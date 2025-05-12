# Delve Super Admin Dashboard

A secure Super Admin portal for managing users and controlling AI resource consumption within the Delve application. The system automatically enforces usage limits based on user account type (free/paid) and provides administrators with tools to monitor usage, manage user access, and view relevant logs.

## Features

### Authentication & Security
- Dedicated login route (`/admin/login`) with JWT-based authentication
- Protected admin routes requiring valid Super Admin token
- Role-based access control

### AI Usage Tracking & Control
- Automatic tracking of AI endpoint calls per user
- Differentiated limits for free vs paid users
- Daily usage reset at midnight UTC
- Automatic blocking of users who exceed daily limits

### User Management
- View and filter all users by status (active, blocked, deactivated)
- Manually deactivate or reactivate user accounts
- Permanent user deletion with associated data
- View user-specific AI usage logs

### System Monitoring
- Dashboard with key metrics and statistics
- Comprehensive system logs for tracking blockings and account changes
- Detailed view of currently blocked users

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Hooks

## Project Structure

```
delve-super-admin/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin dashboard pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── login/        # Admin login
│   │   ├── logs/         # System logs viewer
│   │   └── users/        # User management
│   └── api/              # API routes
│       ├── admin/        # Admin API endpoints
│       └── ai/           # AI-related endpoints with usage tracking
├── components/           # Reusable UI components
├── lib/                  # Utility functions and services
│   ├── auth/             # Authentication utilities
│   └── db/               # Database services
└── models/               # Mongoose models
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### User Management
- `GET /api/admin/users` - Get all users with filtering
- `POST /api/admin/users/:id/deactivate` - Deactivate a user
- `POST /api/admin/users/:id/reactivate` - Reactivate a user
- `DELETE /api/admin/users/:id` - Delete a user

### Logs and Monitoring
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/ai/logs/:userId` - Get AI usage logs for a specific user

### AI Endpoint (with Usage Checking)
- `POST /api/ai/process` - Example AI endpoint with usage tracking and limiting

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/delve-super-admin.git
   cd delve-super-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000/admin/login in your browser

## User Types and Limits

- **Free Users**: Limited to 10 AI requests per day
- **Paid Users**: Limits calculated based on subscription tier (approximately half of their monthly subscription cost)

## Demo Credentials

For demonstration purposes, you can use the following credentials:

- **Email**: admin@example.com
- **Password**: admin123

## License

MIT License
