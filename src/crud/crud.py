from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

class BaseRepository:

    def __init__(self, model):
        self.model = model

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = None):
        """Get all records with optional pagination"""
        query = select(self.model)
        
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def count(self, db: AsyncSession):
        """Count total records"""
        result = await db.execute(select(func.count()).select_from(self.model))
        return result.scalar()

    async def get_by_id(self, db: AsyncSession, record_id: int):
        result = await db.execute(
            select(self.model).where(self.model.id == record_id)
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: dict):
        record = self.model(**data)
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record

    async def update(self, db: AsyncSession, record_id: int, data: dict):
        record = await self.get_by_id(db, record_id)
        if not record:
            return None

        for key, value in data.items():
            if value is not None:
                setattr(record, key, value)

        await db.commit()
        await db.refresh(record)
        return record

    async def delete(self, db: AsyncSession, record_id: int):
        record = await self.get_by_id(db, record_id)
        if not record:
            return None

        await db.delete(record)
        await db.commit()
        return record