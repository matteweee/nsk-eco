from celery import Celery
from app.core.config import settings

celery = Celery(
    'station_updater',
    broker=settings.CELERY_BROKER_URL,   # можно RabbitMQ
    backend=settings.CELERY_BROKER_URL,
    include=['app.tasks.update_stations']
)

celery.conf.beat_schedule = {
    'update-stations-every-second': {
        'task': 'app.tasks.update_stations.update_stations',
        'schedule': 3.0,  # каждую секунду
    },
}
celery.conf.timezone = 'UTC'
