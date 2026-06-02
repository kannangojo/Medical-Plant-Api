# 🌿 Medicinal Plant Chatbot

A full-stack web application built using **React.js**, **Django REST Framework**, and **PostgreSQL/SQLite** that allows users to register, log in, and interact with a medicinal plant chatbot. The chatbot provides information about medicinal plants such as Neem, Tulsi, Aloe Vera, Mint, and Turmeric.

## 📸 Project Preview

- User Authentication (Register/Login)
- Database-backed User Management
- Interactive Plant Chatbot
- Plant Database Management
- Responsive User Interface
- REST API Integration

---

## 🚀 Features

### 🔐 Authentication
- User Registration
- User Login
- Secure Authentication
- Logout Functionality

### 🌱 Plant Chatbot
- Ask about medicinal plants
- Instant plant information retrieval
- Quick-select plant buttons
- Automated chatbot responses

### 📚 Plant Database Management
- Add new medicinal plants
- Delete existing plants
- View plant details
- Manage botanical names and descriptions

### 🎨 User Interface
- Responsive Design
- Modern Dashboard Layout
- Clean and User-Friendly Interface

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Django
- Django REST Framework

### Database
- PostgreSQL / SQLite

### Tools
- Git
- GitHub
- VS Code

---

## 📂 Project Structure

```text
medicinal-plant-chatbot/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── chatbot/
│   ├── api/
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/medicinal-plant-chatbot.git
cd medicinal-plant-chatbot
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

### Configure Database

```bash
python manage.py makemigrations
python manage.py migrate
```

### Start Django Server

```bash
python manage.py runserver
```

Backend runs on:

```text
http://127.0.0.1:8000/
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://127.0.0.1:5173/
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|----------|----------|-------------|
| POST | /register/ | Register User |
| POST | /login/ | Login User |
| POST | /logout/ | Logout User |

### Plants

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /plants/ | Get All Plants |
| POST | /plants/ | Add New Plant |
| DELETE | /plants/<id>/ | Delete Plant |
| GET | /plants/<name>/ | Get Plant Details |

---

## 🌿 Supported Plants

- Neem
- Tulsi
- Aloe Vera
- Mint
- Turmeric

---

## 🎯 Future Enhancements

- JWT Authentication
- Plant Image Support
- AI-Powered Chatbot Responses
- Plant Search Functionality
- Plant Recommendation System
- Deployment on Render and Vercel

---

## 👨‍💻 Author

**Kannan K**

Aspiring Python Full Stack Developer

GitHub: https://github.com/kannangojo

Email: kannan.gojo@gmail.com

---

## 📜 License

This project is developed for educational and portfolio purposes.