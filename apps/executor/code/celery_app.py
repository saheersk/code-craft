from celery import Celery
import logging


# Initialize Celery
celery_app = Celery(
    "tasks",
    broker="redis://127.0.0.1:6379/0",
    backend="redis://127.0.0.1:6379/0",
    broker_connection_retry_on_startup=True
)

# Load Celery config
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Celery task discovery
celery_app.autodiscover_tasks(["code"])


# Setup logging
logging.basicConfig(
    level=logging.DEBUG,  # Adjust logging level as needed
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Use Celery's logging system to capture task-specific logs
logger = logging.getLogger(__name__)

# Set a handler to display logs in the console if running with Celery worker
celery_app.conf.update(
    worker_log_format="%(asctime)s - %(levelname)s - %(message)s",  # Log format
    worker_task_log_format="%(asctime)s - %(levelname)s - %(task_name)s - %(message)s",  # Task-specific log format
)

# You can also add logging handlers if you want to save logs to a file
file_handler = logging.FileHandler('celery.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logging.getLogger().addHandler(file_handler)