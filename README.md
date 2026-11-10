# Project Title 
A Ticket Prioritization and Assignment System using Machine Learning for IT Service Management

The IT Service Desk Ticketing System is a web-based platform designed to help employees, IT Support personnel, Service Desk staff, IT Supervisor, and System Administrators manage and monitor IT-related concerns and service requests. Its main objective is to make IT support faster and more efficient by simplifying how issues are reported, assigned, monitored, and resolved with the help of Machine Learning. It helps reduce manual work, keeps everyone updated on ticket progress, and makes it easier for the IT team to manage requests and provide timely support.

## Group Members & Roles 

- **Umlas, Ryan Christopher C.** – Lead Developer & Project Manager
- **Eugenio, Rhazzie L.** – Documentation Lead
- **De Leon, Jeremy James L.** – Documentation Contributor
- **Dela Peña, Pedrick Aron D.** – Documentation Contributor
- **Jagonoy, Mark Rainier V.** – Documentation Contributor

## Tech Stack

- **Frontend:** React.js, Vite
- **Backend:** Django
- **Database:** PostgreSQL
- **Tools & Version Control:** Git, Visual Studio Code, Postman

## System Requirements & Prerequisites
- **Node.js (v22+)**
- **npm (v10.9.2+)**
- **Python (v3.13.5)**
- **PostgreSQL (18.x or compatible version)**

## Installation & Setup Instructions

### 1. Clone the Repository
git clone https://github.com/ryanumlas/A-Ticket-Prioritization-and-Assignment-System-using-Machine-Learning.git
cd A-Ticket-Prioritization-and-Assignment-System-using-Machine-Learning

### 2. Set Up the Backend
Navigate to the backend project directory:

cd backend

Create a Python virtual environment:

py -m venv venv

Activate the virtual environment on Windows:

venv\Scripts\activate

Install the required backend dependencies:

pip install -r requirements.txt

### 3. Set Up the Frontend
Open another terminal window and navigate to the frontend project directory:

cd frontend

Install the frontend dependencies:

npm install

**Note:** Replace `backend` and `frontend` with the actual folder names if your repository uses a different structure.


## Database Setup & Configuration

Follow these steps to configure your local PostgreSQL database:

### 1. Start the PostgreSQL Server
- Make sure PostgreSQL is installed on your computer.
- Open **pgAdmin 4** and connect to your local PostgreSQL server.

### 2. Create a New Database
- In pgAdmin 4, right-click **Databases** and select **Create → Database**.
- Enter the database name: `your_database_name_db`.
- Click **Save** to create the database.

### 3. Configure Environment Variables
- Navigate to the backend project folder.
- Locate the `.env` file or create one if it does not exist.
- Update the database connection settings with your local PostgreSQL credentials.

Example `.env` configuration:

DB_NAME=your_database_name_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

**Note:** Make sure the environment variable names match those configured in your Django `settings.py` file.

### 4. Apply Database Migrations

Open a terminal inside the backend directory, activate your virtual environment, and run:

py manage.py migrate

This command creates the necessary database tables based on the existing Django migrations.

### 5. Verify the Database Setup
- Open pgAdmin 4.
- Navigate to your newly created database.
- Expand **Schemas → public → Tables**.
- Verify that the application tables have been created successfully.

---

## Running the Application

### 1. Start the Backend Server

- Open a terminal and navigate to the backend directory.
- Activate the Python virtual environment:

venv\Scripts\activate

- Start the Django development server:

py manage.py runserver

The backend server will run at:

`http://127.0.0.1:8000/`

### 2. Start the Frontend Server

- Open another terminal window.
- Navigate to the frontend directory.
- Install dependencies if you have not already done so:

npm install

- Start the Vite development server:

npm run dev

### 3. Access the Application

Open your web browser and navigate to:

`http://localhost:5173/`

The IT Ticketing System should now be accessible locally.
