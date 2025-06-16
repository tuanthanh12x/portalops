from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_tickets():
    return [{"id": 1, "title": "Example ticket"}]

@router.get("/test")
async def test_ticket():
    return [{"Hello test test day"}]