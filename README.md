# AI Business Assistant

A modern AI business assistant web application built with React, TypeScript, and Vite. This frontend application connects to the [alpha_backend](https://github.com/abakarovy/alpha_backend) API.

## Features

- 🔐 **Authentication**: Register and login with full user profile (name, nickname, email, password, phone, country, gender)
- 💬 **AI Chat Interface**: ChatGPT/DeepSeek-like interface with:
  - Initial centered input state
  - Smooth transition to chat layout after first message
  - Persistent conversation history
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- 📱 **Sidebar Navigation**: Persistent sidebar with AI Chat, Profile, and Settings pages

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn
- Backend API running (see [alpha_backend](https://github.com/abakarovy/alpha_backend))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alpha_webapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint:
   - Create a `.env` file in the root directory
   - Add your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```
   (Replace with your actual backend URL)

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginPage.tsx      # Login page
│   │   └── RegisterPage.tsx   # Registration page
│   ├── Chat/
│   │   └── ChatPage.tsx       # Main chat interface
│   ├── Profile/
│   │   └── ProfilePage.tsx    # User profile page
│   ├── Settings/
│   │   └── SettingsPage.tsx   # Settings page
│   ├── Layout.tsx             # Main layout with sidebar
│   ├── Sidebar.tsx            # Sidebar navigation
│   └── ProtectedRoute.tsx     # Route protection component
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── services/
│   └── api.ts                 # API service layer
├── App.tsx                    # Main app component with routing
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

## API Integration

The application expects the following API endpoints from the backend:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `POST /api/chat` - Send chat message

All API requests include authentication tokens in the Authorization header when the user is logged in.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## License

This project is part of the Alpha Future Hackathon, Team "Smile" :-)
