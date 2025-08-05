# 👕 Cloth Crafters – Backend API

This is the **Node.js + Express.js** backend for **Cloth Crafters**, a modern tailoring and clothing customization platform. It supports user authentication, profile management, custom measurements, fabric/product browsing, alterations, custom clothing requests, job vacancy applications, and shopping cart functionality.

## 🚀 Tech Stack

- **Node.js + Express** – RESTful API server
- **TiDB Cloud (MySQL-compatible)** – Managed distributed SQL database
- **MySQL2** – MySQL driver for Node.js
- **JWT** – Token-based authentication
- **bcryptjs** – Password hashing
- **Multer** – File/image upload handling
- **dotenv** – Environment configuration

---

## 📁 Project Structure
Cloth-Crafters-Backend/
├── config/ # Database connection

├── controllers/ # All route handlers grouped by feature

├── routes/ # Express route definitions

├── middleware/ # JWT & multer middleware

├── uploads/ # Folder to store uploaded images

├── certificate/ # TiDB Cloud CA certificate

├── app.js # Express app

├── server.js # Entry point

├── .env # Environment variables

├── package.json

└── README.md


---

## 🔐 Features

| Feature              | Description |
|----------------------|-------------|
| ✅ User Auth         | Register & Login with JWT |
| 👤 Profile           | View user profile, upload profile image |
| 📏 Measurements      | Save/update body measurements |
| ✂️ Alterations       | Submit clothes for alteration with images |
| 🎨 Custom Designs    | Request customized clothing with references |
| 🛍️ Products & Fabrics| Browse products and fabrics |
| 🛒 Cart              | Add/remove products and fabrics to cart |
| 💼 Job Vacancies     | Post/apply for vacancies, manage applications |

---

## 🛠️ Setup Instructions

### 1. **Clone the Repository**
git clone https://github.com/Anshika1003/ClothCraftersBackend.git
cd cloth-crafters-backend

### 2. **Install Dependencies**
npm install
### 3. **Create .env File**

DB_HOST=your_tidb_host

DB_PORT=4000

DB_USER=youruser.root

DB_PASSWORD=yourpassword

DB_NAME=clothcrafters

SSL_CA_CERT=./certificate/tidbcloud-server-ca.pem

JWT_SECRET=your_jwt_secret

✅ Download the CA cert from TiDB Cloud → Connect → Download CA → save as
certificate/tidbcloud-server-ca.pem

### 4. *Start the Server*
npm start
Server will start on: http://localhost:4000/


## 📡 API Routes Overview
Route Prefix	        Description

/api/auth	            User registration and login

/api/users	            Profile management and image upload

/api/measurements	    Add/update/get measurements

/api/alter_clothes	    Alteration request with image

/api/customize_clothes	Submit clothing customizations

/api/products	        View products and fabrics

/api/cart	            Add/view/clear cart

/api/vacancy	        Vacancy posting and applications


🧵 Built With ❤️ for Tailors, Designers & Boutiques

Crafted by Anshika Sharma
