from fastapi import FastAPI, Depends
from app.core.database import SessionLocal, init_db
from app.api.v1.ticket import crud, schemas
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI(title="Async Ticket Service")

@app.on_event("startup")
async def on_startup():
    await init_db()

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session

@app.post("/tickets/", response_model=schemas.TicketResponse)
async def create(ticket: schemas.TicketCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_ticket(db, ticket)

@app.get("/tickets/", response_model=list[schemas.TicketResponse])
async def get_list(db: AsyncSession = Depends(get_db)):
    return await crud.list_tickets(db)
