# CampusConnect Frontend

A modern, responsive React frontend for the CampusConnect College Club Management System. Built with React, Tailwind CSS, and modern UI components.

## Features

### 🎨 Modern UI/UX
- **Mobile-first responsive design** - Works perfectly on all devices
- **Dark/Light mode toggle** - User preference support
- **Modern card layouts** - Clean and intuitive interface
- **Soft color palette** - Easy on the eyes
- **Smooth animations** - Enhanced user experience

### 👥 User Management
- **Student Authentication** - Secure login/signup with college email
- **Profile Management** - Edit personal information and upload photos
- **Role-based Access** - Student and Admin interfaces
- **Protected Routes** - Secure navigation based on user roles

### 🏛️ Club Management
- **Club Discovery** - Browse and search clubs by category
- **Club Details** - Comprehensive club information with tabs
- **Join Requests** - Request to join clubs with admin approval
- **My Clubs** - Manage joined clubs and leave functionality

### 💬 Real-time Communication
- **Club Chats** - Real-time messaging for club members
- **Socket.io Integration** - Live chat functionality
- **Message History** - Persistent chat conversations

### 🎯 Admin Features
- **Admin Dashboard** - Overview of all clubs and statistics
- **Club Creation** - Create new clubs with photos and details
- **Club Editing** - Update club information and settings
- **Join Request Management** - Approve/reject member requests
- **Event Management** - Create and manage club events
- **Announcement System** - Share important updates with members

### 📱 Responsive Design
- **Mobile-optimized** - Touch-friendly interface
- **Tablet support** - Optimized layouts for medium screens
- **Desktop experience** - Full-featured desktop interface
- **Cross-browser compatibility** - Works on all modern browsers

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Date-fns** - Date manipulation utilities
- **Socket.io Client** - Real-time communication

## Project Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Footer.jsx
│   │       ├── Navbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateAnnouncement.jsx
│   │   │   ├── CreateClub.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── EditClub.jsx
│   │   │   └── PendingRequests.jsx
│   │   ├── Chats.jsx
│   │   ├── ClubDetails.jsx
│   │   ├── Clubs.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyClubs.jsx
│   │   ├── Profile.jsx
│   │   └── Signup.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Components

### Authentication
- **Login/Signup** - College email-based authentication
- **Protected Routes** - Role-based access control
- **Auth Context** - Global authentication state management

### Navigation
- **Responsive Navbar** - Mobile-friendly navigation
- **Role-based Menu** - Different options for students and admins
- **Theme Toggle** - Dark/light mode switch

### Club Management
- **Club Cards** - Beautiful club presentation
- **Search & Filter** - Find clubs by name, category, or description
- **Join/Leave** - Easy club membership management

### Admin Interface
- **Dashboard** - Overview with statistics and quick actions
- **Club Management** - Create, edit, and manage clubs
- **Request Management** - Handle join requests
- **Event/Announcement Creation** - Content management tools

## API Integration

The frontend integrates with the backend API endpoints:

- **Authentication**: `/auth/login`, `/auth/signup`, `/auth/logout`
- **User Management**: `/user/profile`, `/user/edit`, `/user/myclubs`
- **Club Management**: `/club/all`, `/club/create`, `/club/join`, `/club/approve`
- **Events**: `/event/create`, `/event/all`
- **Announcements**: `/announcement/create`, `/announcement/all`
- **Chat**: Socket.io integration for real-time messaging

## Styling

The application uses Tailwind CSS with a custom design system:

- **Color Palette**: Blue and purple gradients with gray accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable components with consistent styling
- **Dark Mode**: Complete dark mode support with smooth transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@campusconnect.com or create an issue in the repository.
