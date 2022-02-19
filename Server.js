const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt-nodejs');

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


//USER REGISTER//---------------------------------------

app.post('/userregister', (req, res) => {
    const { u_name, u_phno, u_email, u_password, u_addr, u_city, u_state, u_zip } = req.body;
    const hash = bcrypt.hashSync(u_password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: u_email
        }).into('login')
            .then(() => {
                return trx('userdetails').insert({
                    u_name: u_name,
                    u_phno: u_phno,
                    u_email: u_email,
                    u_addr: u_addr,
                    u_city: u_city,
                    u_state: u_state,
                    u_zip: u_zip
                }).then(user => {
                    res.json(user[0])
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    }).catch(err => res.status(400).json('unable to register'))
    // db('userdetails')
    //     .insert({
    //         u_name: u_name,
    //         u_phno: u_phno,
    //         u_email: u_email,
    //         u_addr: u_addr,
    //         u_city: u_city,
    //         u_state: u_state,
    //         u_zip: u_zip
    //     })
    //     .then(response => {
    //         res.json("user registered successfully");
    //     }).catch(err => res.status(400).json('unable to register'))

})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    db.select('*').from('userdetails').where({
        u_id: id
    }).then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('No Such User Found')
        }
    }).catch(err => res.status(400).json('Error while retriving User'))
})




//LISTENING---------------------------------------------------
app.listen(3002, () => {
    console.log("ARS-IN-02 API Is Running On Port 3002");
})