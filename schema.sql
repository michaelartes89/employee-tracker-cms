DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE departments (
    dept_id INT NOT NULL AUTO INCREMENT,
    dept_name VARCHAR(120) NOT NULL,
    PRIMARY KEY (dept_id)
);

CREATE TABLE roles (
 roles_id  INT NOT NULL AUTO INCREMENT,
 title VARCHAR(120) NOT NULL,
 salary DECIMAL(120) NOT NULL,
 dept_id INT NOT NULL,
 PRIMARY KEY (roles_id),
 FOREIGN KEY (dept_id),
    REFERENCES departments(debt_id)
);

CREATE TABLE employee (
    employee_id INT NOT NULL AUTO INCREMENT,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    roles_id INT NOT NULL,
    manager_id INT,
    PRIMARY KEY (employee_id),
    FOREIGN KEY (roles_id),
        REFERENCES roles(roles_id)
);
