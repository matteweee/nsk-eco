import asyncio
import random
import math
from app.core.celery_app import celery
from app.db.database import async_session_maker
from app.db.models.station import Stations
from app.db.models.station_behavior import StationBehavior
from sqlalchemy import select

loop = asyncio.get_event_loop()

# Память для маршрутов и прогресса
routes = {}
progress = {}
speeds = {}

@celery.task(name="app.tasks.update_stations.update_stations")
def update_stations():
    loop.run_until_complete(update_stations_async())


async def update_stations_async():
    async with async_session_maker() as session:
        try:
            result = await session.execute(select(Stations, StationBehavior).join(StationBehavior, Stations.id == StationBehavior.station_id))
            stations = result.all()
            
            # Инициализация маршрутов (при первом запуске)
            if not routes:
                
                for st, bh in stations:
                    print(st)
                    if st.type_st == 1:
                        base_lat = st.latitude
                        base_lon = st.longitude
                        
                        # Круг из 12 точек (через 30°)
                        route = [
                            (
                                base_lat + bh.radius * math.cos(angle),
                                base_lon + bh.radius * math.sin(angle)
                            )
                            for angle in [i * (2 * math.pi / 12) for i in range(12)]
                        ]

                        routes[st.id] = route
                        bh.progress = 0.0

            # Обновление всех станций
            for st, bh in stations:
                if st.id in routes:
                    route = routes[st.id]
                    idx = int(bh.progress) % len(route)
                    next_idx = (idx + 1) % len(route)

                    lat1, lon1 = route[idx]
                    lat2, lon2 = route[next_idx]

                    # доля пути между двумя точками
                    frac = bh.progress % 1.0

                    # плавное движение между точками
                    st.latitude = lat1 + (lat2 - lat1) * frac
                    st.longitude = lon1 + (lon2 - lon1) * frac

                    # продвижение по кругу
                    bh.progress += bh.speed
                    if bh.progress >= len(route):
                        bh.progress -= len(route)

            result_all = await session.execute(select(Stations))
            stations_all = result_all.scalars().all()
            print(len(stations_all))
            for st in stations_all:
                # обновляем показатели PM
                for field in ["PM_2_5", "PM_10"]:
                    old = getattr(st, field)
                    if old == 0.1:
                        old = random.uniform(0.1, 10)
                    new = round(old * (1 + random.uniform(-0.05, 0.05)), 2)
                    setattr(st, field, new)

                    # пересчёт TLV
                    st.overTLV = st.PM_2_5 > 25 or st.PM_10 > 50

            await session.commit()
            print(f"✅ Updated {len(stations)} stations ({len(routes)} moving in circular paths)")

        except Exception as e:
            await session.rollback()
            print("❌ Error updating stations:", e)
