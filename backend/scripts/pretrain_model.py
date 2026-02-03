import polars as pl
from sklearn.ensemble import IsolationForest
import joblib
import os
import argparse

def train_anomaly_model(data_path, model_output_path):
    print(f"Loading data from {data_path} using Polars...")
    try:
        # Load data efficiently with Polars
        # Specifying dtypes to prevent type inference errors
        df = pl.read_csv(
            data_path, 
            separator=";",
            schema_overrides={"compte": pl.String, "debit": pl.Float64, "credit": pl.Float64}
        )
        
        # Filter only numeric entries (credits/debits)
        # We focus on "credit" amounts for Sales Journal to find abnormal sales
        sales_data = df.filter(
            (pl.col("journal") == "VT") & 
            (pl.col("compte").str.starts_with("70"))
        )
        
        # Extract features (just the amount for now)
        # Polars to Numpy
        X = sales_data.select("credit").to_numpy()
        
        print(f"Training Isolation Forest on {len(X)} transactions...")
        clf = IsolationForest(contamination=0.01, random_state=42)
        clf.fit(X)
        
        # Save model
        os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
        joblib.dump(clf, model_output_path)
        print(f"Model saved to {model_output_path}")
        
        # Test basic prediction
        test_amount = [[5000000.0]] # Huge amount
        pred = clf.predict(test_amount)
        print(f"Prediction for 5,000,000 DA: {'Anomaly' if pred[0] == -1 else 'Normal'}")

    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pre-train AI models with synthetic data")
    parser.add_argument("--data", type=str, default="backend/data/synthetic_journal_ventes.csv")
    parser.add_argument("--output", type=str, default="backend/app/models/ai/anomaly_detector.joblib")
    
    args = parser.parse_args()
    train_anomaly_model(args.data, args.output)
