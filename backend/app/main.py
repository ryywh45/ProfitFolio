from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import SQLiteDB
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # print("🚀 System Starting...")
    SQLiteDB.create_db_and_tables()
    SQLiteDB.initialize()
    
    yield
    # print("🛑 System Shutting down...")

app = FastAPI(lifespan=lifespan)

# 開發環境用
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 設為 ["*"] 則允許所有來源
    allow_credentials=True, # 允許使用憑證（如 Cookies、HTTP 身份驗證）。如果為 True，則 allow_origins 不能設定為 ["*"]
    allow_methods=["*"],    # 允許所有方法：GET, POST, OPTIONS, etc.
    allow_headers=["*"],    # 允許所有標頭，包括 'Content-Type'
)

# @app.on_event("startup")
# def on_startup():
#     SQLiteDB.create_db_and_tables()


@app.get("/")
def hi():
    return "hello world"

app.include_router(api_router, prefix="/api/v1")