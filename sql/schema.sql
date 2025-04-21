-- Create the database (run this while connected to another db like 'postgres')
CREATE DATABASE airportdb;

-- Then connect to it in the terminal or psql shell using:
-- \c airportdb

-- GATE table
CREATE TABLE GATE (
    Gate_id SERIAL PRIMARY KEY,
    Terminal VARCHAR(10),
    Status VARCHAR(20)
);

-- FLIGHTS table
CREATE TABLE FLIGHTS (
    Flight_id SERIAL PRIMARY KEY,
    Flight_name VARCHAR(50),
    Flight_no VARCHAR(20),
    Dept_time TIME,
    Arr_time TIME,
    Gate_id INT,
    FOREIGN KEY (Gate_id) REFERENCES GATE(Gate_id)
);

-- PASSENGERS table
CREATE TABLE PASSENGERS (
    Pass_id SERIAL PRIMARY KEY,
    Pass_name VARCHAR(100),
    Flight_name VARCHAR(50),
    Flight_no VARCHAR(20),
    Dept_time TIME
);

-- ADMIN_USERS table
CREATE TABLE ADMIN_USERS (
    Admin_id SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE,
    Password VARCHAR(100),
    Role VARCHAR(20)
);

-- REPORTS table
CREATE TABLE REPORTS (
    Report_id SERIAL PRIMARY KEY,
    Pass_id INT,
    Admin_id INT,
    Report_type VARCHAR(50),
    Generated_on TIMESTAMP,
    FOREIGN KEY (Pass_id) REFERENCES PASSENGERS(Pass_id),
    FOREIGN KEY (Admin_id) REFERENCES ADMIN_USERS(Admin_id)
);
