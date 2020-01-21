const inq = require("inquirier");
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

const questions = [
    {
        name: "startingQuetions",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Add Department",
            "Add Roles",
            "Add Employees",
            "View Department",
            "View Roles",
            "View Employees",
            "Update employee roles",
            "End Program"


        ]
    },  
    {  
    name: "departmentName",
    type: "input",
    message: "What is the department's name"
    }
];
function runProgram() {
        inq.prompt(questions[0]).then(function(res) {
        switch(res.startingQuestions) {
            case "Add Departments":
                addDepartment();
                break;
            case "Add Roles":
                addRoles();
                break;
            case "Add Employees":
                 addEmployees();
                break;   
             case "View Departments":
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
    inq.prompt(questions[1]).then(function(res) {
        let name = res.departmentName;
        let query = "INSERT INTO departments SET ?";
        connection.query(query, { dept_name: name }, function(err) {
            if (err) throw err;
            runProgram();
        });
    });
}
function viewDepartments() {
    let query = "SELECT * FROM departments";
    connection.query(query,function(err,res) {
        if (err) throw err;
        console.log("\nHere are the departments\n\n======================\n");
        console.table(res)
        console.log("======================\n");
        runProgram();
    });

}

function addRoles() {
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
        inq.promt(roleQuestions).then(function(fullResults) {
            let deptID = "";
            let title = fullResult.roleTitle;
            let salary =fullResult.roleSalary;

            for (let i =0; i < allDepartments.length; i++) {
                if(fullResults.whichDpt === departmentTable[i].dept_name) {
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
}
function viewRoles() {
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
        inq.promt(employeeQuestions).then(function(employee) {
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
    let query = 
    "SELECT employee.employee_id, employee.first_name, employee.last_name, roles.title, roles.salary, department.dept_name FROM employee INNER JOIN roles ON (employee.roles_id = roles.roles_id) INNER JOIN departments ON (roles.dept_id = departments.dept_id)";
    connection.query(query,function(err,res) {
        if(err) throw err;
        console.log("\nHere are the employees\n\n======================\n");
        console.table(res);
        console.log("======================\n");
        runProgram();
    })

};

function updateEmployeeRole() {
    let query = "SELECT * FROM roles";
    connection.query(query, function(err, rolesTable) {
        if (err) throw err;
        let allRoles = [];
        rolesTable.forEach(role => {
            allRoles.push(role.title);

        });
        const updateQuestions = [
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
            for (let i =0; i < allRoles.length; i++) {
                if (role.whichRole === rolesTable[i].title) {
                    roleID = rolesTable[i].roles_id;
                }
            }
            if (role.whichUpdate === "Salary") {
                inq.prompt(
                    {
                    name:"newSalary",
                    type:"input",
                    message: "What is the new salary?"
                }
                ).then(function(response) {
                    let newSalary = response.newSalary;
                    newSalary = parseINT(newSalary);
                    
                    let query = `UPDATE roles SET ? WHERE roles_id = ${roleID}`;
                    connection.query(query, {salary: newSalary }, function(err) {
                        if(err) throw err;
                        runProgram();
                    });
                });
            } else {
                inq.promt ({
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
    })

};

runProgram();

