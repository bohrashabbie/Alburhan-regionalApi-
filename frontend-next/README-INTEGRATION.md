# Frontend-Backend Integration Guide

## Overview
This Next.js frontend is fully integrated with the FastAPI backend running on `http://127.0.0.1:8000`.

## Setup Instructions

### 1. Start the Backend
```bash
cd c:\alburhan\Alburhan-regionalApi-
python main.py
```
Backend will run on: `http://127.0.0.1:8000`

### 2. Start the Frontend
```bash
cd frontend-next
npm install  # First time only
npm run dev
```
Frontend will run on: `http://localhost:3000`

## Features Integrated

### Authentication
- **Login**: `/api/auth/login` - POST with username & password
- **Register**: `/api/auth/register` - POST with user details
- **Current User**: `/api/auth/me` - GET with Bearer token

### Dashboard Pages (All Functional)
1. **Banners** (`/dashboard/banners`)
   - GET `/api/banners/` - List all banners
   - POST `/api/banners/` - Create banner
   - PUT `/api/banners/{id}` - Update banner
   - DELETE `/api/banners/{id}` - Delete banner
   - POST `/api/banners/upload-image` - Upload banner image

2. **Branches** (`/dashboard/branches`)
   - GET `/api/branches/` - List all branches
   - POST `/api/branches/` - Create branch
   - PUT `/api/branches/{id}` - Update branch
   - DELETE `/api/branches/{id}` - Delete branch

3. **Countries** (`/dashboard/countries`)
   - GET `/api/countries/` - List all countries
   - POST `/api/countries/` - Create country
   - PUT `/api/countries/{id}` - Update country
   - DELETE `/api/countries/{id}` - Delete country
   - POST `/api/countries/upload-logo` - Upload country logo

4. **Projects** (`/dashboard/projects`)
   - GET `/api/projects/` - List all projects
   - POST `/api/projects/` - Create project
   - PUT `/api/projects/{id}` - Update project
   - DELETE `/api/projects/{id}` - Delete project

5. **Project Categories** (`/dashboard/categories`)
   - GET `/api/project-categories/` - List all categories
   - POST `/api/project-categories/` - Create category
   - PUT `/api/project-categories/{id}` - Update category
   - DELETE `/api/project-categories/{id}` - Delete category

6. **Project Images** (`/dashboard/images`)
   - GET `/api/project-images/` - List all images
   - POST `/api/project-images/` - Create image
   - PUT `/api/project-images/{id}` - Update image
   - DELETE `/api/project-images/{id}` - Delete image

7. **Users** (`/dashboard/users`)
   - GET `/api/users/` - List all users
   - PUT `/api/users/{id}` - Update user
   - DELETE `/api/users/{id}` - Delete user

## API Utilities

### Location
- `app/utils/api.ts` - API client with authentication
- `app/utils/auth.ts` - Authentication service

### Usage Example
```typescript
import { apiClient } from './utils/api';
import { authService } from './utils/auth';

// Login
const result = await authService.login({ username, password });

// Make authenticated API call
const data = await apiClient.get('/banners/');
```

## Backend Features
- ✅ **Caching**: All GET endpoints cached (60s TTL)
- ✅ **Cache Invalidation**: POST/PUT/DELETE operations invalidate cache
- ✅ **Service Layer**: Business logic separated from routes
- ✅ **Error Handling**: Try-catch blocks in all services
- ✅ **Logging**: Comprehensive logging at router and service levels
- ✅ **CORS**: Enabled for all origins

## Testing

### Test Authentication
1. Go to `http://localhost:3000`
2. Click "Create one" to register
3. Fill in username, email, password, fullname
4. After registration, login with username/password
5. You'll be redirected to `/dashboard`

### Test CRUD Operations
1. Navigate to any dashboard page (e.g., Banners)
2. Click "New Banner" to create
3. Edit existing items
4. Delete items
5. Upload images (for Banners/Countries)

## Environment
- **Backend**: Python 3.x, FastAPI, PostgreSQL
- **Frontend**: Next.js 16, React 19, Material-UI 7, TypeScript
- **API Base URL**: Auto-detected (localhost:8000 or deployed URL)

## Notes
- Frontend automatically detects backend URL
- Authentication token stored in localStorage
- All API calls include Bearer token if authenticated
- Image uploads handled via FormData
- Real-time error messages via Snackbar alerts
