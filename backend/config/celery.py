import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

app = Celery("docuflow")

# All Celery config lives in Django settings under the CELERY_ prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Finds tasks.py in every installed app.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
