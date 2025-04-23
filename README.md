# ✈️ XENOS – Airport Operation Management System

**Developers:**  
- Shaldon Barnes – NNM23CS172  

**Course:** CS2102-1 – Database Management System  
**Institution:** NMAM Institute of Technology  
**Semester:** 4th sem CSE  
**Submission Date:** 23 April 2025  

---

## 📖 Abstract

**XENOS** is a robust, database-driven web application designed to streamline and automate airport operations. It handles flight schedules, passenger details, employee information, and reporting features. With real-time access and a centralized platform, the system boosts efficiency, reduces manual work, and strengthens airport data security.

---

## 🎯 Objectives

- 📅 24×7 access to flight, passenger & staff information  
- 🔄 Automate data entry, schedule management, and reporting  
- 📲 Multi-device access (PC, tablet, mobile)  
- 🔐 Role-based access control for security  
- 🧾 Generate detailed reports with export options  
- 🔁 Improve coordination & communication across departments  

---

## 🖥️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js  
- **Database:** PostgreSQL  
- **Editor:** Visual Studio Code  

---

## ⚙️ System Requirements

**Hardware:**
- 1.6GHz+ processor
- ≥1GB RAM
- Stable internet connection

**Software:**
- Node.js v18+
- PostgreSQL with pgAdmin
- Modern browser (Chrome/Firefox recommended)

---

## 🛠️ Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Shaldonbarnes10/Xenos_Airport_Operations.git
   cd Xenos_Airport_Operations
   ```

2. **Install dependencies**  
   ```bash
   npm install express pg path
   and the rest are given in the requirements.txt file
   ```

3. **Initialize project**  
   ```bash
   npm init -y
   ```

4. **Start PostgreSQL and create tables**  
   Use pgAdmin or SQL queries to set up schema.

5. **Run the server**  
   ```bash
   node server.js
   ```

6. **Access the application in browser:**  
   - `http://localhost:3000/signup.html` – User Signup  
   - `http://localhost:3000/flights.html` – Manage Flights  
   - `http://localhost:3000/passengers.html` – Manage Passengers  
   - `http://localhost:3000/report.html` – Generate Reports  

---

## 📊 Key Features

- ✈️ Real-time flight schedules & status updates  
- 🧳 Passenger details with check-in & baggage info  
- 🧑‍✈️ Role-based user access (admin, staff, etc.)  
- 📈 Exportable reports (filter by date/category)  
- 📱 Fully responsive design for all devices  

---

## 🧬 Database Schema

- **FLIGHTS:** `Flight_id`, `Flight_name`, `Flight_no`, `Dept_time`, `Arr_time`, `Gate_id`, `Status`
- **GATE:** `Gate_id`, `Terminal`  
- **PASSENGERS:** `Pass_id`, `Pass_name`, `Flight_name`, `Flight_no`, `Dept_time`  
- **REPORTS:** `Report_id`, `Pass_id`, `Admin_id`, `Report_type`, `Generated_on`  
- **ADMIN_USERS:** `Username`, `Password`, `Role`  

---

## ✅ Output Screens

Screens include:
- Signup Page 
- Login Page  
- Home Dashboard  
- Flight Management  
- Passenger Details  
- Report Generation  


---

## 🔮 Future Enhancements

- 📱 Mobile app integration  
- 🌐 Real-time flight tracking  
- 📦 Baggage tracking module  
- 🔔 Automated alerts for delays/schedule changes  
- 🌍 Multilingual interface  
- 👤 Passenger self-service portal for check-ins  

---

## 📚 References

- [Node.js Tutorials – W3Schools](https://www.w3schools.com/nodejs/)  
- [PostgreSQL Tutorials – W3Schools](https://www.w3schools.com/postgresql/)  
- [JavaScript Tutorials – W3Schools](https://www.w3schools.com/js/)

---