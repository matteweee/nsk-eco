from fastapi import APIRouter
from fastapi.responses import FileResponse

import matplotlib
import matplotlib.pyplot as plt
from datetime import datetime

from app.station_data import stations
from app.schedules import time_zone_schedule, clustering_schedule
from app.schemas.station import Station
from app.services.station_service import StationService


matplotlib.use('agg')

router = APIRouter(
    prefix="/stations",
)

@router.get("")
async def get_stations() -> list[Station]:
    return await StationService.find_all()

@router.get("/{station_id}/")
async def get_station(station_id: int) -> Station:
    return await StationService.find_by_id(station_id)

@router.post("/{station_id}/")
async def update_station(station_id: int, station: Station) -> Station:
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

    filename = f"app/static/plots/plot_{option}_{datetime.now().strftime('%d.%m.%Y_%H:%M:%S')}.png"
    plt.savefig(filename, bbox_inches='tight')
    plt.close()
    
    return FileResponse(filename, media_type="image/png")
