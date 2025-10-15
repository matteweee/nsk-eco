from pydantic import BaseModel


class Station(BaseModel):
    id: int
    latitude: float
    longitude: float
    PM_2_5: float
    PM_10: float
    overTLV: int
