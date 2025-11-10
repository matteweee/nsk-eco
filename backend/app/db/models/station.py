from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.db.database import Base


class Stations(Base):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(primary_key=True)
    type_st: Mapped[int] = mapped_column(ForeignKey("types.id"))

    battery_life: Mapped[float]
    latitude: Mapped[float]
    longitude: Mapped[float]
    PM_2_5: Mapped[float]
    PM_10: Mapped[float]
    overTLV: Mapped[int]

    behavior = relationship("StationBehavior", back_populates="station")
    type = relationship("Types", back_populates="station")
