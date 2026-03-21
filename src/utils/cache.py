# src/utils/cache.py

import time
from typing import Any, Optional
from config.settings import CACHE_PREFIX
from src.utils.logger import get_logger

logger = get_logger("CACHE")


class InMemoryCache:
    def __init__(self):
        self.store = {}

    def _build_key(self, key: str) -> str:
        return f"{CACHE_PREFIX}:{key}"

    def set(self, key: str, value: Any, ttl: int = 60):
        full_key = self._build_key(key)
        expire_at = time.time() + ttl

        self.store[full_key] = {
            "value": value,
            "expire_at": expire_at
        }

        logger.info(f"💾 CACHE SET → {full_key} (ttl={ttl}s)")

    def get(self, key: str) -> Optional[Any]:
        full_key = self._build_key(key)
        data = self.store.get(full_key)

        if not data:
            logger.info(f"❌ CACHE MISS → {full_key}")
            return None

        if data["expire_at"] < time.time():
            del self.store[full_key]
            logger.info(f"⏰ CACHE EXPIRED → {full_key}")
            return None

        logger.info(f"✅ CACHE HIT → {full_key}")
        return data["value"]

    def delete(self, key: str):
        full_key = self._build_key(key)
        if full_key in self.store:
            del self.store[full_key]
            logger.info(f"🗑 CACHE DELETE → {full_key}")

    def delete_pattern(self, pattern: str):
        full_pattern = self._build_key(pattern)

        keys_to_delete = [
            k for k in self.store.keys()
            if k.startswith(full_pattern)
        ]

        for k in keys_to_delete:
            del self.store[k]
            logger.info(f"🗑 CACHE DELETE PATTERN → {k}")

    def clear(self):
        self.store.clear()
        logger.info("🧹 CACHE CLEARED")


cache = InMemoryCache()