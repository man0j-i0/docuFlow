from celery import shared_task


@shared_task(name="core.ping")
def ping() -> str:
    """Smoke test proving API -> RabbitMQ -> worker -> Redis result backend works."""
    return "pong"
