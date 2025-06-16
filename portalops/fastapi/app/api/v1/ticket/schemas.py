from pydantic import BaseModel

class TicketBase(BaseModel):
    title: str
    content: str

class TicketCreate(TicketBase):
    pass

class TicketResponse(TicketBase):
    id: int
    status: str