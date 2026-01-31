from fastapi import FastAPI
from sqlalchemy import create_engine
import os
import traceback

app = FastAPI()

@app.get("/")
def read_root():
    url = "postgresql://postgres:postgres@127.0.0.1:5432/dinarlytics"
    engine = create_engine(url)
    try:
        conn = engine.connect()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        res = {"status": "failed"}
        try:
            res["msg"] = str(e)
        except Exception:
            res["msg"] = "COULD NOT STRINGIFY"
        try:
             res["type"] = str(type(e))
        except Exception:
             res["type"] = "COULD NOT GET TYPE"
        return res
