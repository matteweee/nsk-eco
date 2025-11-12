from sqlalchemy.future import select
from app.db.models.station import Stations
from app.services.base import BaseService
from app.db.database import async_session_maker
from app.db.models.station import Stations


class StationService(BaseService):
    model = Stations

    @classmethod
    async def update_type(cls, station_id: int):
        """
        Обновляет тип станции (например, 'cluster_head' или 'battery_head'),
        но только если у станции type_st == 0.
        """
        async with async_session_maker() as session:
            result = await session.execute(select(Stations).where(Stations.id == station_id))
            station = result.scalar_one_or_none()
            if not station:
                return None

            station.type_st = 2
            session.add(station)
            await session.commit()
            #return station

    @classmethod
    async def reset_all_types(cls):
        async with async_session_maker() as session:
            result = await session.execute(select(Stations))
            stations = result.scalars().all()

            for st in stations:
                if st.type_st == 2:
                    st.type_st = 0
                    session.add(st)

            await session.commit()
