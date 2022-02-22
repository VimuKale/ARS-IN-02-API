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

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("this is working");
})

//LOGIN
app.post("/login", (req, res) => {
    db.select('email', 'hash', 'type').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash); // true
            if (isValid && (req.body.type === "User")) {
                return db.select('*').from('userdetails')
                    .where('u_email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json("unable to get User "))
            }
            if (isValid && (req.body.type === "Shelter")) {
                return db.select('*').from('shelterdetails')
                    .where('s_email', '=', req.body.email)
                    .then(shelter => {
                        res.json(shelter[0])
                    })
                    .catch(err => res.status(400).json("unable to get User "))
            }
            if (isValid && (req.body.type === "Admin")) {
                return db.select('*').from('admindetails')
                    .where('a_email', '=', req.body.email)
                    .then(admin => {
                        res.json(admin[0])
                    })
                    .catch(err => res.status(400).json("unable to get User "))
            }
            else {
                res.status(400).json('Wrong Credentials')
            }

        })
        .catch(err => res.status(400).json('Wrong Credentials'))
})


//USER REGISTER//--------------------------------------------------------------------------------
app.post('/userregister', (req, res) => {
    const { u_name, u_phno, u_email, u_password, u_addr, u_city, u_state, u_zip } = req.body;
    const hash = bcrypt.hashSync(u_password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: u_email,
            type: "User"
        }).into('login')
            .then(() => {
                return trx('userdetails').insert({
                    u_name: u_name,
                    u_phno: u_phno,
                    u_email: u_email,
                    u_addr: u_addr,
                    u_city: u_city,
                    u_state: u_state,
                    u_zip: u_zip,
                    type: "User"
                }).then(user => {
                    res.json(user[0])
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    }).catch(() => res.status(400).json('unable to register'))
})

//SHELTER REGISTER//--------------------------------------------------------------------------------
app.post('/shelterregister', (req, res) => {
    const { s_name, s_phno, s_email, s_password, s_addr, s_city, s_state, s_zip } = req.body;
    const hash = bcrypt.hashSync(s_password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: s_email,
            type: "Shelter"
        }).into('login')
            .then((response) => {
                return trx('shelterdetails').insert({
                    s_name: s_name,
                    s_phno: s_phno,
                    s_email: s_email,
                    s_addr: s_addr,
                    s_city: s_city,
                    s_state: s_state,
                    s_zip: s_zip,
                    type: "Shelter"
                }).then(shelter => {
                    res.json(shelter[0])
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    }).catch((err) => { console.log(err); res.status(400).json('unable to register') })
})

//ADMIN REGISTER//--------------------------------------------------------------------------------
app.post('/adminregister', (req, res) => {
    const { a_name, a_phno, a_email, a_password, a_addr, a_city, a_state, a_zip } = req.body;
    const hash = bcrypt.hashSync(a_password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: a_email,
            type: "Admin"
        }).into('login')
            .then((response) => {
                return trx('admindetails').insert({
                    a_name: a_name,
                    a_phno: a_phno,
                    a_email: a_email,
                    a_addr: a_addr,
                    a_city: a_city,
                    a_state: a_state,
                    a_zip: a_zip,
                    type: "Admin"
                }).then(admin => {
                    res.json({
                        message_type: "success",
                        message: admin[0]
                    })
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    }).catch((err) => {
        console.log(err); res.status(400).json(
            {
                message_type: "fail",
                message: "unable to register admin"
            }
        )
    })
})



app.post('/supplylisting', (req, res) => {
    const { i_id, i_name, i_desc, i_qty, i_cost, s_id, deliver_to, link_to_source, time_frame, status } = req.body;


    db('items')
        .insert({
            i_id: i_id,
            i_name: i_name,
            i_desc: i_desc,
            i_qty: i_qty,
            i_cost: i_cost,
            s_id: s_id,
            deliver_to: deliver_to,
            link_to_source: link_to_source,
            time_frame: time_frame,
            status: status
        }).then(i_record => {
            res.json({
                message_type: "success",
                message: i_record[0]
            })
        })
        .catch((err) => {
            console.log(err); res.status(400).json(
                {
                    message_type: "fail",
                    message: "Unable to register supplies"
                }
            )
        })

})

app.get('/items', (req, res) => {
    db.select('*').from('shelterdetails')
        .join('items', 'shelterdetails.s_id', 'items.s_id')
        .then((i_record) => {
            console.log(i_record[0].i_id);
            res.json(i_record)
        })
        .catch((err) => {
            console.log(err); res.status(400).json(
                {
                    message_type: "fail",
                    message: "Unable to fetch details"
                }
            )
        })
})

//USER PROFILE------------------------------------------------------------------------------------------------
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
//--------------------------------------------------------------------------------------


//LISTENING---------------------------------------------------
app.listen(3002, () => {
    console.log("ARS-IN-02 API Is Running On Port 3002");
})