from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.db.database import Base


class Types(Base):
    __tablename__ = "types"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] 

    station = relationship("Stations", back_populates="type")
