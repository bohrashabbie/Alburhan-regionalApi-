"""
Utility script to reset user passwords after bcrypt migration
Run this to update existing user passwords to work with the new bcrypt implementation
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.connections.database import get_db
from src.models.models import User
from src.auth.auth import hash_password


async def reset_password(username: str, new_password: str):
    """Reset a user's password"""
    async for db in get_db():
        try:
            # Find user
            result = await db.execute(
                select(User).where(User.username == username)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print(f"❌ User '{username}' not found")
                return
            
            # Update password
            user.password_hash = hash_password(new_password)
            await db.commit()
            
            print(f"✅ Password updated for user '{username}'")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error: {e}")
        finally:
            break


async def list_users():
    """List all users in the database"""
    async for db in get_db():
        try:
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            if not users:
                print("No users found in database")
                return
            
            print("\n=== Users in Database ===")
            for user in users:
                status = "✓ Active" if user.isactive else "✗ Inactive"
                print(f"  • {user.username} ({user.email}) - {status}")
            print()
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            break


async def main():
    print("=" * 50)
    print("User Password Reset Utility")
    print("=" * 50)
    print()
    
    while True:
        print("\nOptions:")
        print("1. List all users")
        print("2. Reset user password")
        print("3. Exit")
        
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == "1":
            await list_users()
        
        elif choice == "2":
            username = input("Enter username: ").strip()
            password = input("Enter new password: ").strip()
            
            if not username or not password:
                print("❌ Username and password cannot be empty")
                continue
            
            await reset_password(username, password)
        
        elif choice == "3":
            print("\nGoodbye!")
            break
        
        else:
            print("❌ Invalid choice")


if __name__ == "__main__":
    asyncio.run(main())
