# src/utils/cache_decorator.py

import functools
from typing import Callable
from src.utils.cache import cache
from src.utils.logger import get_logger

logger = get_logger("CACHE_DECORATOR")


def cacheable(key: str, ttl: int = 60):

    def decorator(func: Callable):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            try:
                formatted_key = key.format(**kwargs)
            except KeyError:
                formatted_key = key

            # 🔍 Try cache
            cached = cache.get(formatted_key)
            if cached:
                logger.info(f"🚀 SERVED FROM CACHE → {formatted_key}")
                return cached

            logger.info(f"⚡ CACHE MISS → Executing {func.__name__}")

            result = await func(*args, **kwargs)

            cache.set(formatted_key, result, ttl)

            return result

        return wrapper

    return decorator


def invalidate_cache(*keys: str):

    def decorator(func: Callable):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            result = await func(*args, **kwargs)

            for key in keys:
                try:
                    formatted_key = key.format(**kwargs)
                except KeyError:
                    formatted_key = key

                cache.delete(formatted_key)
                logger.info(f"♻️ CACHE INVALIDATED → {formatted_key}")

            return result

        return wrapper

    return decorator