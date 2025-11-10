from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.db.database import Base


class StationBehavior(Base):
    __tablename__ = "stations_behaviors"

    id: Mapped[int] = mapped_column(primary_key=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"))

    radius: Mapped[float] = mapped_column(default=0.0)
    speed: Mapped[float] = mapped_column(default=0.0)
    progress: Mapped[float] = mapped_column(default=0.0)

    station = relationship("Stations", back_populates="behavior")
