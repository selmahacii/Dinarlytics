import torch
import torch.nn as nn
from typing import Dict, Any

class ERPFeatureEncoder(nn.Module):
    """Encode les features tabulaires ERP en vecteur latent avec BatchNorm et Dropout."""
    def __init__(self, input_dim: int, hidden_dim: int = 128, n_layers: int = 2, dropout: float = 0.3):
        super().__init__()
        layers = []
        # First layer
        layers += [nn.Linear(input_dim, hidden_dim), nn.BatchNorm1d(hidden_dim), nn.ReLU(), nn.Dropout(dropout)]
        # Hidden layers
        for _ in range(n_layers - 1):
            layers += [nn.Linear(hidden_dim, hidden_dim), nn.BatchNorm1d(hidden_dim), nn.ReLU(), nn.Dropout(dropout)]
        self.encoder = nn.Sequential(*layers)

    def forward(self, x):
        if x.size(0) <= 1: # Handle single samples during inference
            self.encoder.eval()
        return self.encoder(x)

class MultiTaskHead(nn.Module):
    """T????tes multit????ches pour risque, liquidit????, rentabilit????, solvabilit????, anomalies et suggestions."""
    def __init__(self, latent_dim: int, task_outputs: Dict[str, int]):
        super().__init__()
        self.heads = nn.ModuleDict({
            task: nn.Sequential(
                nn.Linear(latent_dim, latent_dim // 2),
                nn.ReLU(),
                nn.Linear(latent_dim // 2, out_dim),
                nn.Sigmoid() if task not in ['anomaly', 'suggestion'] else nn.Identity()
            )
            for task, out_dim in task_outputs.items()
        })

    def forward(self, x):
        return {task: head(x) for task, head in self.heads.items()}

class ERPModel(nn.Module):
    """Mod????le multit????che complet pour analyse financi????re pr????dictive."""
    def __init__(self, input_dim: int, task_outputs: Dict[str, int], hidden_dim: int = 128, n_layers: int = 2):
        super().__init__()
        self.encoder = ERPFeatureEncoder(input_dim, hidden_dim, n_layers)
        self.heads = MultiTaskHead(hidden_dim, task_outputs)

    def forward(self, x):
        latent = self.encoder(x)
        return self.heads(latent)
