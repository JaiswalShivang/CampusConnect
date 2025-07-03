# CampusConnect

CampusConnect is a modern MERN stack web application for campus communities. It enables students and admins to manage clubs, events, announcements, and real-time chat in a beautiful, secure, and responsive interface.

## 🚀 Features
- User authentication (signup/login)
- Club creation, join requests, and admin approval
- Event and announcement management
- Real-time group chat for club members
- Responsive, modern UI with dark mode
- Admin dashboard with stats and quick actions
- Cloudinary image uploads

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB Atlas
- **Image Hosting:** Cloudinary
- **Deployment:** Vercel/Netlify (frontend), Render (backend)

## 📦 Project Structure
```
CampusConnect/
  client/    # React frontend
  server/    # Node/Express backend
```

## ⚙️ Setup Instructions

### 1. Clone the repository
```sh
git clone https://github.com/JaiswalShivang/CampusConnect.git
cd CampusConnect
```

### 2. Install dependencies
```sh
cd client && npm install
cd ../server && npm install
```

### 3. Environment Variables
Create `.env` files in both `client` and `server` folders:

#### `client/.env`
```
VITE_API_URL=http://localhost:4000
```

#### `server/.env`
```
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
PORT=4000
```

### 4. Run the app locally
**Backend:**
```sh
cd server
npm start
```
**Frontend:**
```sh
cd client
npm run dev
```



## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License. 
