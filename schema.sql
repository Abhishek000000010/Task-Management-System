-- Database Schema for Smart Task Management System

-- Drop tables if they exist (for a clean setup)
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS "user";

-- Create User Table
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(150) NOT NULL
);

-- Create Task Table
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id)
);

-- Index for faster task lookups by user
CREATE INDEX idx_task_user_id ON task(user_id);
