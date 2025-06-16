import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://ticket_db_owner:npg_3eZYyWpgAX5w@ep-snowy-bar-a11av7vk-pooler.ap-southeast-1.aws.neon.tech/ticket_db")