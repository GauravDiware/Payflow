# 💳 PayFlow – Full-Stack Banking Application

PayFlow is a secure and responsive **full-stack banking application** built with React.js, Java, Spring Boot, Spring Security, JWT, and PostgreSQL. It provides customers with a digital banking experience for managing accounts, transferring money, and tracking transactions.

## 🚀 Features

* 🔐 Secure JWT authentication & authorization
* 👥 Role-based access — Customer, Admin & Auditor
* 👤 Customer registration & profile management
* 🔑 Secure password management with PBKDF2 hashing
* 🏦 Bank account management
* 💸 Money transfer functionality
* 👥 Beneficiary management
* 📊 Transaction history & search
* 📄 Monthly statement management
* ⚙️ Profile, security & notification settings
* 🗄️ PostgreSQL database with Flyway migrations
* 🐳 Docker support
* 🔗 RESTful APIs

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Vite

### Backend

* Java
* Spring Boot
* Spring Security
* JWT
* Spring Data JPA
* Hibernate

### Database

* PostgreSQL
* Flyway

### Tools

* Git & GitHub
* Docker
* Postman
* JUnit

## 🏗️ Architecture

```text
React.js Frontend
       ↓
REST APIs
       ↓
Spring Boot Backend
       ↓
Spring Security + JWT
       ↓
Spring Data JPA / Hibernate
       ↓
PostgreSQL Database
```

## 📂 Project Structure

```text
PayFlow/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── docker-compose.yml
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd PayFlow
```

### 2. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Database

Configure PostgreSQL credentials in your Spring Boot configuration and run the application. Flyway will handle the database migrations automatically.

## 🔒 Security

PayFlow implements:

* JWT-based authentication
* Role-based authorization
* Password hashing using PBKDF2
* Protected REST endpoints
* Secure password change workflow
* Input validation

## 📌 Future Enhancements

* Forgot password / password recovery
* Email & OTP verification
* Real bank/payment gateway integration
* Account statement PDF generation
* Transaction notifications
* Automated testing expansion
* CI/CD pipeline
* Cloud deployment

## 👨‍💻 Author

**Gaurav Diware**

Java | Spring Boot | React.js | Full-Stack Developer
WELCOME TO PAYFLOW

LOGIN PAGE     
<img width="1916" height="867" alt="login page" src="https://github.com/user-attachments/assets/fa613c75-dcbc-41da-ba16-76f04405e889" />

