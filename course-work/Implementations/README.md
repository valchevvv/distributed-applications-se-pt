# Restaurant Management System

## Students
- Daniel Valchev - 2401322026
- Denislav Hristov - 2401322006

## Project Description
Restaurant Management System is a full-stack web application for managing restaurant operations.  
The system allows managing menu items, orders, restaurant tables, employees and categories.

The backend is developed with ASP.NET Core and Entity Framework, while the frontend uses React with TypeScript and Tailwind CSS.  
The application provides a REST API with JWT authentication and a responsive user interface.

## Technologies Used
Backend:
- C# / ASP.NET Core 8
- Entity Framework Core
- SQL Server

Frontend:
- React
- TypeScript
- Tailwind CSS
- Axios

## Installation and Setup

### Requirements
- .NET SDK 8.0+
- Node.js 18+
- SQL Server 2019+

### Backend

1. Navigate to backend folder

```bash
cd backend/RestaurantSystem
```

2. Configure database connection in appsettings.json

3. Apply migrations
```bash
dotnet ef database update
```

4. Run the backend
```bash
dotnet run
```

Backend runs at:
https://localhost:5174

Frontend

5. Navigate to frontend folder
```bash
cd frontend
```

6. Install dependencies
```bash
npm install
```

7. Start development server
```bash
npm run dev
```

Frontend runs at:
http://localhost:5173

Default Login

Admin:
```bash
username: admin
password: admin_pass
```
Manager:
```bash
username: manager
password: manager_pass
```