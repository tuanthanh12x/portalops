from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.sql.schema import ForeignKey

from app.core.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    status = Column(String(20), default="open")
    user_id = Column(Integer, ForeignKey("users.id"))
