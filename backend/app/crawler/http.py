"""HTTP helpers untuk crawler (blocking, dijalankan via threadpool)."""

import logging
import time
from typing import Optional

import requests

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
}


def fetch_text(url: str, timeout: int = 30, retries: int = 2, pause: float = 0.5) -> Optional[str]:
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=timeout)
            if resp.status_code == 200:
                time.sleep(pause)
                return resp.text
            logger.warning("GET %s -> HTTP %s", url, resp.status_code)
        except requests.RequestException as exc:
            logger.warning("GET %s failed: %s", url, exc)
        time.sleep(pause * (attempt + 2))
    return None


def fetch_bytes(url: str, timeout: int = 60, retries: int = 2, pause: float = 0.5) -> Optional[bytes]:
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=timeout)
            if resp.status_code == 200:
                time.sleep(pause)
                return resp.content
            logger.warning("GET %s -> HTTP %s", url, resp.status_code)
        except requests.RequestException as exc:
            logger.warning("GET %s failed: %s", url, exc)
        time.sleep(pause * (attempt + 2))
    return None
