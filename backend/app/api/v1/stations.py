from fastapi import APIRouter
from fastapi.responses import FileResponse

import matplotlib
import matplotlib.pyplot as plt

from app.station_data import stations
from app.schedules import time_zone_schedule, clustering_schedule
from app.schemas.station import Station


matplotlib.use('agg')

router = APIRouter(
    prefix="/stations",
)

@router.get("")
async def get_stations():
    data = stations
    return data

@router.get("/{station_id}/")
async def get_station(station_id: int):
    data = stations[station_id]
    return data

@router.post("/{station_id}/")
async def update_station(station_id: int, station: Station):
    stations[station_id] = station
    return station

@router.get("/plot/{option}")
async def get_plot(option: int):
    
    if option == 1:
        fig, ax = plt.subplots(figsize=(5, 4))   # создаём только 1 ось
        time_zones = time_zone_schedule(stations, 10, ax)

    elif option == 2:
        fig, ax = plt.subplots(figsize=(5, 4))
        cluster_zones_no_heads = clustering_schedule(stations, 10, ax)
    
    elif option == 3:
        fig, ax = plt.subplots(figsize=(5, 4))
        cluster_zones_no_heads = clustering_schedule(stations, 10, ax, mode='proximity')
    
    elif option == 4:
        fig, ax = plt.subplots(figsize=(5, 4))
        cluster_zones_no_heads = clustering_schedule(stations, 10, ax, mode='battery_life')

    filename = f"plot_{option}.png"
    plt.savefig(filename)
    plt.close()

    return FileResponse(filename, media_type="image/png")
