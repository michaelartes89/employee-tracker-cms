const inq = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');


// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "C0deK1ng!",
    database: "employee_tracker_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    
});
// Below Code-creates array of questions for inquirer 
const questions = [
    
    {
        name: "startingQuestions",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Add Department",
            "Add Roles",
            "Add Employees",
            "View Department",
            "View Roles",
            "View Employees",
            "Update Employee Roles",
            "End Program"


        ]
    } 

];

function runProgram() {
    // Below Code- starts questions using inquirer and then uses switch statement to call the appropriate function based on the user initial choice
        inq.prompt(questions[0]).then(function(res) {
        switch(res.startingQuestions) {
            case "Add Department":
                addDepartment();
                break;
            case "Add Roles":
                addRoles();
                break;
            case "Add Employees":
                 addEmployees();
                break;   
             case "View Department":
                viewDepartments();
                break;
            case "View Roles":
                 viewRoles();
                break;
            case "View Employees":
                viewEmployees();
                break;
            case "Update Employee Roles":
                updateEmployeeRole();
                break;
            case "End Program":
                connection.end();
                break;
           
        }
    });

};

function addDepartment() {
    // Below Code- uses inquirer to get department name from user and then add it to sql statement to update database
    inq.prompt({  
        name: "departmentName",
        type: "input",
        message: "What is the department's name"
        }).then(function(res) {
            
        let name = res.departmentName;
        let query = "INSERT INTO departments SET ?";
        connection.query(query, { dept_name: name }, function(err) {
            if (err) throw err;
            
        });
        runProgram();
    });
};

function viewDepartments() {
    //Below Code- uses sql statement to select all departments from database and log the info to the console

    let query = "SELECT * FROM departments";
    connection.query(query,function(err,res) {
        if (err) throw err;
        console.log("\nHere are the departments\n\n======================\n");
        console.table(res)
        console.log("======================\n");
        runProgram();
    });

};

function addRoles() {
   /* Below Code- uses sql statement to select all departments from the database,
    next, it pushes the info to an array and allows the user to see it as a choice using inqurier,
    after that, the user selects the department, they can input the title and salary using inquirer,
    last, a for loop is used add the department ID and the information from the full result is added to the datacase with another sql statement */

    let query = "SELECT * FROM departments";
    connection.query(query,function(err, departmentTable) {
        if (err) throw err;
        let allDepartments = [];

        departmentTable.forEach(department => {
            allDepartments.push(department.dept_name);
        });
    const roleQuestions = [
        {
            name:"whichDpt",
            type:"list",
            message:"Which department would you like to add the role to?",
            choices: allDepartments
        },
        {
            name: "roleTitle",
            type: "input",
            message: "What is the title of the role",

        },
        {
            name: "roleSalary",
            type: "input",
            message: "What is the salary for the role?"
        }
    ];
        inq.prompt(roleQuestions).then(function(fullResult) {
            let deptID = "";
            let title = fullResult.roleTitle;
            let salary =fullResult.roleSalary;

            for (let i =0; i < allDepartments.length; i++) {
                if(fullResult.whichDpt === departmentTable[i].dept_name) {
                    deptID = departmentTable[i].dept_id;
                }
            }
            connection.query(
                "INSERT INTO roles SET ?", 
                { title: title, salary: salary, dept_id: deptID },
                function(err) {
                    if (err) throw err; 
                    runProgram();
                }
            );
        });
    })
};
function viewRoles() {
    // Below Code- uses sql statment INNER JOIN to combine records from roles table and departments table and log to the console
    let query = 
    "SELECT roles.roles_id, roles.title,roles.salary,departments.dept_name FROM roles INNER JOIN departments ON (roles.dept_id = departments.dept_id)";
    connection.query(query,function(err,res) {
        if(err) throw err;
        console.log("\nHere are the roles\n\n======================\n");
        console.table(res);
        console.log("======================\n");
        runProgram();
  
    });
};

function addEmployees() {
    /* Below Code- uses sql statement to result all roles from the database,
    next it pushes the info to an array and allows the users to select it with inquirer,
    after that lets the user input the employee first name and last name with inquierer,
    last, it uses  a for loop to set the role id and then another sql statement to insert the set of info the the db*/
    let query = "SELECT * FROM roles";
    connection.query(query,function(err,rolesTable) {
        if (err) throw err;
        let allRoles = [];

        rolesTable.forEach(role => {
            allRoles.push(role.title);
        });
        const employeeQuestions = [
            {
                name:"whichRole",
                type:"list",
                message:"which role will this employee have?",
                choices: allRoles
            },
            {
                name:"employeeFirstName",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name:"employeeLastName",
                type:"input",
                message:"What is the empoyeee's last name"
            }
        ];
        inq.prompt(employeeQuestions).then(function(employee) {
            let roleID;
            let firstName = employee.employeeFirstName;
            let lastName = employee.employeeLastName;

            for (let i= 0; i <allRoles.length; i++) {
                if (employee.whichRole === rolesTable[i].title) {
                    roleID = rolesTable[i].roles_id;
                }
            }
            connection.query("INSERT INTO employee SET ?", 
            {
                first_name: firstName,
                last_name: lastName,
                roles_id: roleID

            },
            function(err) {
                if(err) throw err;
                runProgram();
            }
            );
        
        });
    });

};

function viewEmployees() {
    // Below Code- uses sql statement with INNER JOIN to combine records and log info to console 
    let query = 
    "SELECT employee.employee_id, employee.first_name, employee.last_name, roles.title, roles.salary, departments.dept_name FROM employee INNER JOIN roles ON (employee.roles_id = roles.roles_id) INNER JOIN departments ON (roles.dept_id = departments.dept_id)";
    connection.query(query,function(err,res) {
        if(err) throw err;
        console.log("\nHere are the employees\n\n======================\n");
        console.table(res);
        console.log("======================\n");
        runProgram();
    })

};

function updateEmployeeRole() {
    /* Below Code- uses sql statement to select all from roles table and push the role title to an array,
        next, it lets the user choose the role with inquirer, and also gets the user's input to update salary or title,
        after that, it user for loop to set the new role id and then uses another sql statement to UPDATE the info in the DB*/ 
   let query = "SELECT * FROM roles";
    connection.query(query, function(err,rolesTable) {
        if (err) throw err;
        let allRoles = [];
        rolesTable.forEach(role => {
            allRoles.push(role.title);

        });
        let updateQuestions = [
            {
                name: "whichRole",
                type: "list",
                message: "Which role do you want to update?",
                choices: allRoles
            },
            {
                name: "whichUpdate",
                type: "list",
                message: "What would you like to update",
                choices:["Salary", "Title"]
                
                }
        ];
        inq.prompt(updateQuestions).then(function(role) {
            let roleID;
            for (let i = 0; i < allRoles.length; i++) {
                if (role.whichRole === rolesTable[i].title) {
                    roleID = rolesTable[i].roles_id;
                }
            }
            if (role.whichUpdate === "Salary") {
                inq.prompt({
                    name:"newSalary",
                    type:"input",
                    message: "What is the new salary?"
                }).then(function(response) {
                    let newSalary = response.newSalary;
                    newSalary = parseInt(newSalary);
                    
                    let query = `UPDATE roles SET ? WHERE roles_id = ${roleID}`;
                    connection.query(query, { salary: newSalary }, function(err) {
                        if (err) throw err;
                        runProgram();
                    });
                });
            } else {
                inq.prompt ({
                    name: "newTitle",
                    type: "input",
                    message: "What is the new title?"
                }).then(function(response) {
                    let newTitle = response.newTitle;
                    let query = `UPDATE roles SET ? WHERE roles_id = ${roleID}`;
                    connection.query(query, {title: newTitle }, function(err) {
                        if(err) throw err;
                        runProgram()
                    });
                });
            }

        });
    });

};

//RUN IT :)

runProgram(); 

