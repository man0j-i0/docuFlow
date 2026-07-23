"""S3/MinIO access. Isolated here so the rest of the app never touches boto3."""

import boto3
from botocore.client import Config
from django.conf import settings


def _client(endpoint_url: str):
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )

def internal_client():
    """For server-side operations: head, get, delete."""
    return _client(settings.S3_ENDPOINT_URL)

def public_client():
    """For signing URLs the browser will call — must sign the public host."""
    return _client(settings.S3_PUBLIC_ENDPOINT_URL)


def presigned_put(key: str, content_type: str) -> str:
    return public_client().generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key, "ContentType": content_type},
        ExpiresIn=settings.S3_PRESIGN_EXPIRY,
    )

def presigned_get(key: str) -> str:
    return public_client().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
        ExpiresIn=settings.S3_PRESIGN_EXPIRY,
    )

def head_object(key: str) -> dict:
    """Size + ETag, used to confirm an upload actually landed."""
    return internal_client().head_object(Bucket=settings.S3_BUCKET_NAME, Key=key)