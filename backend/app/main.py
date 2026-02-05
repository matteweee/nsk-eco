from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from app.metrics.scheduler import metrics_loop
from app.api.v1.stations import router as station_router
from app.api.v1.ws_metrics import router as ws_metrics_router

app = FastAPI()

@app.on_event("startup")
async def startup():
    asyncio.create_task(metrics_loop())

app.include_router(station_router)
app.include_router(ws_metrics_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)