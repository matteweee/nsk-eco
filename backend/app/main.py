from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router as station_router

app = FastAPI()

app.include_router(station_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# noinspection PyTypeChecker
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)