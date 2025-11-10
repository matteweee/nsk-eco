from app.db.models.station import Stations
from app.services.base import BaseService


class StationService(BaseService):
    model = Stations