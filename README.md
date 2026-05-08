# Smart Task Management System

A professional, minimalist task management application built with Flask, featuring real-time updates and data analytics.

## 🚀 Features

- **User Authentication:** Secure registration, login, and logout functionality.
- **Task Management (CRUD):** Add, update, delete, and view tasks with priority and status tracking.
- **Real-time Updates:** Powered by **WebSockets (Socket.io)** for instant UI updates across all connected clients.
- **Data Analytics:** Integrated **Pandas & NumPy** module to provide insights on productivity and task completion.
- **Modern UI/UX:** Clean, responsive design with a minimalist dark-gray theme and dynamic sidebar navigation.
- **RESTful API:** Robust backend architecture following REST principles.

## 🛠️ Tech Stack

- **Backend:** Python, Flask, Flask-SQLAlchemy, Flask-Login, Flask-SocketIO.
- **Database:** PostgreSQL.
- **Data Analysis:** Pandas, NumPy.
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Fetch API).
- **Communication:** WebSockets (Real-time).

## 📋 Project Requirements Satisfied

- [x] **Authentication:** Registration, Login, Logout.
- [x] **REST API:** Endpoints for Add, Update, Delete, and Get All Tasks.
- [x] **Database:** PostgreSQL integration for User and Task data.
- [x] **Analytics:** Calculation of Total, Completed, Pending tasks and Completion Rate using Pandas/NumPy.
- [x] **WebSockets:** Live task updates without page refreshes.
- [x] **Frontend:** Clean, responsive UI with analytics summary.

## ⚙️ Setup & Installation

### 1. Prerequisites
- Python 3.10+
- PostgreSQL installed and running.

### 2. Clone the Repository
```bash
git clone https://github.com/Abhishek000000010/Task-Management-System.git
cd Task-Management-System
```

### 3. Setup Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configuration
Create a `.env` file in the root directory:
```env
SECRET_KEY=your_secret_key_here
DATABASE_URL=postgresql://postgres:root123@localhost:5432/task_manager_db
```

### 6. Run the Application
```bash
python app.py
```
Access the app at `http://127.0.0.1:5000`.

## 📂 Project Structure
- `app.py`: Main entry point.
- `app_init.py`: App configuration and initialization.
- `routes.py`: API endpoints and page routes.
- `models.py`: Database models (User & Task).
- `analytics.py`: Pandas/NumPy analysis module.
- `static/`: CSS and Client-side JS.
- `templates/`: HTML structures.

---
Developed as a high-performance, minimalist productivity solution.
