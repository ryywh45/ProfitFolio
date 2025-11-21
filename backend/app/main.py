from fastapi import FastAPI
from app.core.database import SQLiteDB
from app.api.v1.api import api_router


app = FastAPI()


@app.on_event("startup")
def on_startup():
    SQLiteDB.create_db_and_tables()


@app.get("/")
def hi():
    return "hello world"

app.include_router(api_router, prefix="/api/v1")