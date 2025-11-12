from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

import matplotlib
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np


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
    #stations[station_id] = station
    return station

@router.get("/plot/timezone")
async def get_timezone_schedule(capacity: int = 10) -> JSONResponse:
    stations_list = await StationService.find_all()
    stations = []
    for st in stations_list:
        stations.append({
            'id': st.id,
            'latitude': st.latitude,
            'longitude': st.longitude,
            'PM_2_5': st.PM_2_5,
            'PM_10': st.PM_10,
            'overTLV': st.overTLV
        })
    coords = np.array([[s['latitude'], s['longitude']] for s in stations])
    x_min = coords[:, 0].min() - 0.01
    x_max = coords[:, 0].max() + 0.01
    y_min = coords[:, 1].min() - 0.01
    y_max = coords[:, 1].max() + 0.01

    num_zones = int(coords.shape[0] // capacity) + 5
    lines = np.linspace(x_min, x_max, num_zones + 1).tolist()

    zones = []
    for i in range(len(lines) - 1):
        zones.append({
            "x_min": lines[i],
            "x_max": lines[i + 1],
            "y_min": y_min,
            "y_max": y_max
        })

    return JSONResponse(content={"zones": zones})

@router.get("/plot/{option}")
async def get_plot(option: int):
    stations = await StationService.find_all()
    stations_list = []
    for st in stations:
        stations_list.append({
            'id': st.id,
            'latitude': st.latitude,
            'longitude': st.longitude,
            'PM_2_5': st.PM_2_5,
            'PM_10': st.PM_10,
            'overTLV': st.overTLV
        })
    print(stations_list)
    if option == 1:
        fig, ax = plt.subplots(figsize=(5, 4))   # создаём только 1 ось
        time_zones = time_zone_schedule(stations_list, 10, ax)

    elif option == 2:
        fig, ax = plt.subplots(figsize=(5, 4))
        cluster_zones_no_heads = clustering_schedule(stations_list, 10, ax)
    
    elif option == 3:
        fig, ax = plt.subplots(figsize=(5, 4))
        cluster_zones_no_heads = clustering_schedule(stations_list, 10, ax, mode='proximity')
    
    elif option == 4:
        fig, ax = plt.subplots(figsize=(5, 4))
        cluster_zones_no_heads = clustering_schedule(stations_list, 10, ax, mode='battery_life')

    filename = f"app/static/plots/plot_{option}_{datetime.now().strftime('%d.%m.%Y_%H:%M:%S')}.png"
    plt.savefig(filename, bbox_inches='tight')
    plt.close()
    
    return FileResponse(filename, media_type="image/png")
