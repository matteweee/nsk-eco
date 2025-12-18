from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

import matplotlib
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from skimage import measure
from random import randint



from app.schedules import time_zone_schedule, clustering_schedule
from app.schemas.station import Station
from app.services.station_service import StationService
from app.state.runtime import runtime_state


matplotlib.use('agg')

router = APIRouter(
    prefix="/stations",
)

@router.post("/fake_pollutions")
async def set_fake_pollutions():
    runtime_state["fake_pollutions"] += randint(1, 20)
    return JSONResponse(content={"status": "ok", "fake_pollutions": runtime_state["fake_pollutions"]})

@router.post("/clear_fake_pollutions")
async def clear_fake_pollutions():
    runtime_state["fake_pollutions"] -= randint(1, 20)
    return JSONResponse(content={"status": "ok", "fake_pollutions": 0})

@router.post("/reset")
async def reset_cluster_heads():
    """
    Сбрасывает все станции к их исходному типу.
    """
    count = await StationService.reset_all_types()
    return JSONResponse(content={"status": "ok", "updated_stations": count})

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

@router.get("/plot/cluster")
async def get_cluster_schedule(capacity: int = 10, mode: str | None = None) -> JSONResponse:
    stations_list = await StationService.find_all()

    stations = []
    for st in stations_list:
        stations.append({
            'id': st.id,
            'latitude': st.latitude,
            'longitude': st.longitude,
            'PM_2_5': st.PM_2_5,
            'PM_10': st.PM_10,
            'overTLV': st.overTLV,
            'battery_life': st.battery_life,
            'type_st': st.type_st
        })

    coords = np.array([[s['latitude'], s['longitude']] for s in stations])
    station_ids = np.array([s['id'] for s in stations])
    batteries = np.array([s['battery_life'] for s in stations])
    type_sts = np.array([s['type_st'] for s in stations])

    df = pd.DataFrame(coords, columns=['lat', 'lon'])
    num_clusters = int(coords.shape[0] // capacity) + 5
    kmeans = KMeans(n_clusters=num_clusters, random_state=0).fit(df)

    polygons = []
    cluster_heads = []

    # --- формируем зоны
    h = 0.001
    x_min, x_max = coords[:, 0].min() - 0.01, coords[:, 0].max() + 0.01
    y_min, y_max = coords[:, 1].min() - 0.01, coords[:, 1].max() + 0.01
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h),
                         np.arange(y_min, y_max, h))
    Z = kmeans.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

    for cluster_id in np.unique(Z):
        mask = Z == cluster_id
        padded_mask = np.pad(mask, pad_width=1, mode='constant', constant_values=0)
        contours = measure.find_contours(padded_mask.astype(float), 0.5)

        for contour in contours:
            latitudes = xx[0, 0] + contour[:, 1] * h
            longitudes = yy[0, 0] + contour[:, 0] * h
            polygon = [[float(lat), float(lon)] for lat, lon in zip(latitudes, longitudes)]
            polygons.append({
                "cluster_id": int(cluster_id),
                "points": polygon
            })


        if mode:
            # фильтруем только станции с type_st == 0
            valid_mask = (kmeans.labels_ == cluster_id) & (type_sts == 1)
            cluster_points = coords[valid_mask]
            cluster_ids = station_ids[valid_mask]

            if len(cluster_points) == 0:
                continue  # нет подходящих станций

            if mode == "battery_life":
                cluster_batteries = batteries[valid_mask]
                sorted_idx = np.argsort(cluster_batteries)[::-1][:2]
            else:
                dists = np.linalg.norm(cluster_points - kmeans.cluster_centers_[cluster_id], axis=1)
                sorted_idx = np.argsort(dists)[:2]

            selected_ids = cluster_ids[sorted_idx]
            selected_heads = cluster_points[sorted_idx]

            # Обновляем их типы в БД
            for sid in selected_ids:
                await StationService.update_type(sid)

            cluster_heads_entry = {"cluster_id": int(cluster_id), "heads": []}
            for sid, coords_pair in zip(selected_ids, selected_heads):
                cluster_heads_entry["heads"].append({
                    "id": int(sid),
                    "coords": coords_pair.tolist(),
                    "type": "battery_head" if mode == "battery_life" else "cluster_head"
                })
            cluster_heads.append(cluster_heads_entry)

    
    if mode:
        runtime_state["mode"] = "cluster_head"
        runtime_state["cluster_count"] = len(polygons)
    else:
        runtime_state["mode"] = "clusters"
        runtime_state["stations_count"] = len(stations) 

    print(runtime_state)

    return JSONResponse(content={"polygons": polygons, "heads": cluster_heads})




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
    
    runtime_state["stations_count"] = len(stations)

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
