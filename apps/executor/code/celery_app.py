import os
import logging

from celery import Celery
from dotenv import load_dotenv


load_dotenv()

BROKER_URL = os.getenv("BROKER_URL", "redis://127.0.0.1:6379/0")
BACKEND_URL = os.getenv("BACKEND_URL", "redis://127.0.0.1:6379/0")

celery_app = Celery(
    "tasks",
    broker=BROKER_URL,
    backend=BACKEND_URL,
    broker_connection_retry_on_startup=True
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["code"])

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

celery_app.conf.update(
    worker_log_format="%(asctime)s - %(levelname)s - %(message)s",
    worker_task_log_format=("%(asctime)s - %(levelname)s - %(task_name)s - %(message)s"
    )
)


file_handler = logging.FileHandler('celery.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(
    logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logging.getLogger().addHandler(file_handler)