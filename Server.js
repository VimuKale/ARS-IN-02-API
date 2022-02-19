const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const knex = require("knex");
const { response } = require("express");

const db = knex({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',//home localhost
        user: 'root',
        password: 'password',
        database: 'ars'
    }
});

// db.select('*').from('userdetails').then(data => {
//     console.log(data);
// });

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("this is working");
});

app.post("/login", (req, res) => {
    if (
        req.body.email === database.users[1].email &&
        req.body.password === database.users[1].password &&
        req.body.userType === database.users[1].type
    ) {
        res.json("success");
    } else {
        res.status(404).json("failed to Login");
    }
});
//USER REGISTER Andraei//---------------------------------------

app.post('/userregister', (req, res) => {
    const { u_id, u_name, u_phno, u_email, u_password, u_addr, u_city, u_state, u_zip } = req.body;
    db('userdetails')
        .insert({
            u_name: u_name,
            u_phno: u_phno,
            u_email: u_email,
            u_addr: u_addr,
            u_city: u_city,
            u_state: u_state,
            u_zip: u_zip
        })
        .then(response => {
            res.json(response);
        }).catch(err => res.status(400).json('unable to register'))
})


//--------------------------------------------------------------
//USER REGISTER//---------------------------------------

// app.post("/userregister", (req, res) => {
//     const u_id = req.body.u_id;
//     const u_name = req.body.u_name;
//     const u_phno = req.body.u_phno;
//     const u_email = req.body.u_email;
//     // const u_password = req.body.u_password;
//     const u_addr = req.body.u_addr;
//     const u_city = req.body.u_city;
//     const u_state = req.body.u_state;
//     const u_zip = req.body.u_zip;
//     // const username = req.body.username;
//     // const password = req.body.password;

//     db.query(
//         "INSERT INTO userdetails(u_id,u_name,u_phno,u_email,u_addr,u_city,u_state,u_zip) VALUES (?,?,?,?,?,?,?,?)",
//         [u_id, u_name, u_phno, u_email, u_addr, u_city, u_state, u_zip],
//         (err, result) => {
//             console.log(err);
//             // console.log("working db");
//         }
//     );
// });

//-------------------------------------------------------


app.listen(3002, () => {
    console.log("ARS-IN-02 API Is Running On Port 3002");
})