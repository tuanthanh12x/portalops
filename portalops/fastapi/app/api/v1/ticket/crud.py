from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .models import Ticket
from .schemas import TicketCreate

async def create_ticket(db: AsyncSession, ticket: TicketCreate):
    new_ticket = Ticket(**ticket.dict())
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)
    return new_ticket

async def list_tickets(db: AsyncSession):
    result = await db.execute(select(Ticket))
    return result.scalars().all()
