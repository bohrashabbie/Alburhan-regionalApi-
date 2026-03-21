from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

class BaseRepository:

    def __init__(self, model):
        self.model = model

    async def get_all(self, db: AsyncSession):
        result = await db.execute(select(self.model))
        return result.scalars().all()

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