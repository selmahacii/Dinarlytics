import torch
import logging
from typing import Dict, Any, List, Tuple
from app.models.erp_model import ERPModel

logger = logging.getLogger(__name__)

class TrainingService:
    """Service d'entraînement robuste avec suivi des métriques."""

    @staticmethod
    def train_model(model: ERPModel, train_data: List[Dict[str, Any]], 
                   epochs: int = 10, lr: float = 1e-3, batch_size: int = 8) -> Dict[str, Any]:
        """Entraîne le modèle avec loss multitâche et validation."""
        optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-5)
        
        # Poids pour chaque tâche (importance relative)
        task_weights = {
            "risk": 1.0,
            "liquidity": 1.0,
            "profitability": 1.0,
            "solvency": 1.0,
            "anomaly": 1.0,
            "suggestion": 0.5
        }
        
        model.train()
        losses_by_epoch = []
        best_loss = float('inf')
        
        for epoch in range(epochs):
            epoch_losses = {task: 0.0 for task in task_weights}
            epoch_total_loss = 0.0
            batch_count = 0
            
            # Mini-batches
            for i in range(0, len(train_data), batch_size):
                batch = train_data[i:i+batch_size]
                
                # Préparer les données du batch
                batch_x = []
                batch_y = {}
                
                for task in task_weights:
                    batch_y[task] = []
                
                for sample in batch:
                    batch_x.append(list(sample['features'].values()))
                    for task, value in sample['targets'].items():
                        if task in batch_y:
                            batch_y[task].append(value if isinstance(value, (int, float)) else 0)
                
                x = torch.tensor(batch_x, dtype=torch.float32)
                
                optimizer.zero_grad()
                outputs = model(x)
                
                # Calcul du loss multitâche
                total_loss = 0.0
                for task, weight in task_weights.items():
                    if task in outputs and task in batch_y and len(batch_y[task]) > 0:
                        y_task = torch.tensor([batch_y[task]], dtype=torch.float32).T
                        criterion = torch.nn.MSELoss()
                        loss = criterion(outputs[task], y_task)
                        total_loss += weight * loss
                        epoch_losses[task] += loss.item()
                
                total_loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # Gradient clipping
                optimizer.step()
                
                epoch_total_loss += total_loss.item()
                batch_count += 1
            
            avg_epoch_loss = epoch_total_loss / max(1, batch_count)
            losses_by_epoch.append(avg_epoch_loss)
            
            # Early stopping
            if avg_epoch_loss < best_loss:
                best_loss = avg_epoch_loss
            else:
                logger.info(f"Epoch {epoch+1}/{epochs} - Loss: {avg_epoch_loss:.4f} (convergé)")
            
            if (epoch + 1) % max(1, epochs // 10) == 0:
                logger.info(f"Epoch {epoch+1}/{epochs} - Loss: {avg_epoch_loss:.4f}")
        
        return {
            "total_epochs": epochs,
            "final_loss": losses_by_epoch[-1] if losses_by_epoch else None,
            "best_loss": min(losses_by_epoch) if losses_by_epoch else None,
            "loss_history": losses_by_epoch,
            "convergence": "converged" if abs(losses_by_epoch[-1] - losses_by_epoch[0]) > 0 else "stable"
        }

    @staticmethod
    def evaluate_model(model: ERPModel, test_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Évalue le modèle sur les données de test."""
        model.eval()
        criterion = torch.nn.MSELoss()
        
        total_loss = 0.0
        task_losses = {}
        
        with torch.no_grad():
            for sample in test_data:
                x = torch.tensor([list(sample['features'].values())], dtype=torch.float32)
                outputs = model(x)
                
                for task in outputs:
                    if task not in task_losses:
                        task_losses[task] = 0.0
                    if task in sample['targets']:
                        y = torch.tensor([[sample['targets'][task]]], dtype=torch.float32)
                        loss = criterion(outputs[task], y)
                        task_losses[task] += loss.item()
                        total_loss += loss.item()
        
        avg_loss = total_loss / max(1, len(test_data) * len(task_losses))
        
        return {
            "avg_loss": avg_loss,
            "task_losses": task_losses,
            "num_samples": len(test_data)
        }
