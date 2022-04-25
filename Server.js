const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt-nodejs');
// const { uploadImage } = require("./routes/image")
const uploadImg = require("./middleware/UploadImage")


const knex = require("knex");
// const { response } = require("express");

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
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

app.use("/uploads", express.static("uploads"))



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
    const { s_name, s_phno, s_cat, s_email, s_password, s_addr, s_city, s_state, s_zip } = req.body;
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
                    s_cat: s_cat,
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



//UPDATE USER
app.put('/updateuser', (req, res) => {
    const { u_name, u_phno, u_id, u_addr, u_city, u_state, u_zip } = req.body;
    const subQuery = db('userdetails').select('u_id').where({ u_id })
    subQuery.then(response => {
        if (response.length > 0) {
            subQuery.update({
                u_name: u_name,
                u_phno: u_phno,
                u_addr: u_addr,
                u_city: u_city,
                u_state: u_state,
                u_zip: u_zip,
            })
                .then(resp => {
                    res.json('update done')
                })
                .catch(err => { res.json('update failed') })
        }
        else {
            res.json('update failed')
        }
    })
        .catch(err => { res.json(err) })
})

//UPDATE SHELTER
app.put('/updateshelter', (req, res) => {
    const { s_name, s_phno, s_id, s_addr, s_city, s_state, s_zip, s_cat } = req.body;
    const subQuery = db('shelterdetails').select('s_id').where({ s_id })
    subQuery.then(response => {
        if (response.length > 0) {
            subQuery.update({
                s_name: s_name,
                s_phno: s_phno,
                s_addr: s_addr,
                s_city: s_city,
                s_state: s_state,
                s_zip: s_zip,
                s_cat: s_cat,
            })
                .then(resp => {
                    res.json('update done')
                })
                .catch(err => { res.json('update failed') })
        }
        else {
            res.json('update failed')
        }
    })
        .catch(err => { res.json(err) })
})

//UPDATE ADMIN
app.put('/updateadmin', (req, res) => {
    const { a_name, a_phno, a_id, a_addr, a_city, a_state, a_zip } = req.body;
    const subQuery = db('admindetails').select('a_id').where({ a_id })
    subQuery.then(response => {
        if (response.length > 0) {
            subQuery.update({
                a_name: a_name,
                a_phno: a_phno,
                a_addr: a_addr,
                a_city: a_city,
                a_state: a_state,
                a_zip: a_zip,
            })
                .then(resp => {
                    res.json('update done')
                })
                .catch(err => { res.json('update failed') })
        }
        else {
            res.json('update failed')
        }
    })
        .catch(err => { res.json(err) })
})









app.post("/rescueimage", uploadImg.single("petImg"), (req, res) => {

    const { u_id, ra_type, ra_desc, ra_loc, ra_lm, ra_city, ra_zip, year, month, day, date } = req.body;
    const petfilename = req.file.filename;

    db('rescuerequest')
        .insert({
            u_id: u_id,
            ra_type: ra_type,
            ra_desc: ra_desc,
            ra_loc: ra_loc,
            ra_lm: ra_lm,
            ra_city: ra_city,
            ra_zip: ra_zip,
            petfilename: petfilename,
            year: year,
            month: month,
            day: day,
            date: date,

        }).then(i_record => {
            res.json({
                message: "success",
                message_desc: i_record[0],
            })
        })
        .catch((err) => {
            console.log(err); res.status(400).json(
                {
                    message: "fail",
                    message_desc: "Rescue Request Failed"
                }
            )
        })
})













//ADD SUPPLY LISTING
app.post('/supplylisting', (req, res) => {
    const { i_name, i_desc, i_qty, i_cost, s_id, deliver_to, link_to_source, time_frame, status } = req.body;
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth()+1;
    let dd = today.getDate();
  
    if(dd < 10) dd = '0' + dd;
    if(mm < 10) mm = '0' + mm;
  
    const date = yyyy+'-'+mm+'-'+dd;
    db('items')
        .insert({
            i_name: i_name,
            i_desc: i_desc,
            i_qty: i_qty,
            i_cost: i_cost,
            s_id: s_id,
            deliver_to: deliver_to,
            link_to_source: link_to_source,
            time_frame: time_frame,
            status: status,
            date:date,
        }).then(i_record => {
            res.json("success")
        })
        .catch((err) => {
            console.log(err); res.status(400).json("fail")
        })
})

//ACCEPT REQUEST
app.post('/acceptrequest', (req, res) => {
    const { s_id, r_id } = req.body;
    db('rescuestatus')
        .insert({
            r_id: r_id,
            s_id: s_id,
            status: "Accepted"
        }).then(i_record => {
            res.json("success")
        })
        .catch((err) => {
            console.log(err); res.status(400).json("fail")
        })
})

//GET SUPPLIES ITEMS
app.get('/items', (req, res) => {
    db.select('*').from('shelterdetails')
        .join('items', 'shelterdetails.s_id', 'items.s_id')
        .then((i_record) => {
            // console.log(i_record[0].i_id);
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


// app.post("/image", (req, res) => uploadImage(req, res, db))

//ADD PETS FOR ADOPTION
app.post("/adoptionimage", uploadImg.single("petImg"), (req, res) => {

    const { p_name, p_type, p_desc, s_id } = req.body;
    const petfilename = req.file.filename;

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth()+1;
    let dd = today.getDate();
  
    if(dd < 10) dd = '0' + dd;
    if(mm < 10) mm = '0' + mm;
  
    const date = yyyy+'-'+mm+'-'+dd;

    db('adoptionlisting')
        .insert({
            p_name: p_name,
            p_type: p_type,
            p_desc: p_desc,
            petfilename: petfilename,
            s_id: s_id,
            pet_list_date:date,

        }).then(i_record => {
            res.json({
                message: "success",
                message_desc: i_record[0]
            })
        })
        .catch((err) => {
            console.log(err); res.status(400).json(
                {
                    message: "fail",
                    message_desc: "Adoption Listing Failed"
                }
            )
        })
})

//GET PETS FOR ADOPTION
app.get('/pets', (req, res) => {
    db.select('*').from('shelterdetails')
        .join('adoptionlisting', 'shelterdetails.s_id', 'adoptionlisting.s_id')
        .then((i_record) => {
            // console.log(i_record[0].i_id);
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

app.get('/requests', (req, res) => {

    db.select('*').from('userdetails')
        .join('rescuerequest', 'userdetails.u_id', 'rescuerequest.u_id')
        .whereNotExists(db.select('*').from('rescuestatus').whereRaw('rescuerequest.r_id = rescuestatus.r_id'))
        .then((i_record) => {
            // console.log(i_record[0].i_id);
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



    // db.select('*').from('userdetails')
    //     .join('rescuerequest', 'userdetails.u_id', 'rescuerequest.u_id')
    //     .whereNotIn('rescurequest.r_id', 'rescuestatus.r_id')
    //     .then((i_record) => {
    //         // console.log(i_record[0].i_id);
    //         res.json(i_record)
    //     })
    //     .catch((err) => {
    //         console.log(err); res.status(400).json(
    //             {
    //                 message_type: "fail",
    //                 message: "Unable to fetch details"
    //             }
    //         )
    //     })
})

app.get('/acceptedrequests', (req, res) => {

    db.select('*').from(db.raw(`rescuerequest,userdetails,shelterdetails,rescuestatus where rescuestatus.r_id = rescuerequest.r_id And rescuerequest.u_id = userdetails.u_id And rescuestatus.s_id = shelterdetails.s_id And rescuestatus.s_id`))
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



app.delete('/deleterequest', (req, res) => {
    db('rescuerequest')
        .where('r_id', req.body.key)
        .del()
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(
                {
                    message_type: "fail",
                    message: "Unable to Delete Record"
                }
            )
        })
})



app.delete('/deletesupplies', (req, res) => {
    db('items')
        .where('i_id', req.body.key)
        .del()
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(
                {
                    message_type: "fail",
                    message: "Unable to Delete Record"
                }
            )
        })
})

app.delete('/deleteadoption', (req, res) => {
    db('adoptionlisting')
        .where('adop_id', req.body.key)
        .del()
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(
                {
                    message_type: "fail",
                    message: "Unable to Delete Record"
                }
            )
        })
})


//UPDATE SUPPLY DETAILS
app.put('/updatesupplies', (req, res) => {
    const { i_id, i_name, i_desc, i_qty, i_cost, deliver_to, link_to_source, time_frame, status } = req.body;
    const subQuery = db('items').select('i_id').where({ i_id })
    subQuery.then(response => {
        if (response.length > 0) {
            subQuery.update({
                i_name: i_name,
                i_desc: i_desc,
                i_qty: i_qty,
                i_cost: i_cost,
                deliver_to: deliver_to,
                link_to_source: link_to_source,
                time_frame: time_frame,
                status: status
            })
                .then(resp => {
                    res.json('update done')
                })
                .catch(err => { res.json('update failed') })
        }
        else {
            res.json('update failed')
        }
    })
        .catch(err => { res.json(err) })
})


//UPDATE ADOPTION DETAILS
app.put('/updatestatus', (req, res) => {
    const { status_id, status } = req.body;
    const subQuery = db('rescuestatus').select('status_id').where({ status_id })
    subQuery.then(response => {
        if (response.length > 0) {
            subQuery.update({
                status: status,
            }).then(resp => {
                res.json('update done')
            })
                .catch(err => { res.json('update failed') })
        }
        else {
            res.json('update failed')
        }
    })
        .catch(err => { res.json(err) })
})




//UPDATE ADOPTION DETAILS
app.put('/updateadoption', (req, res) => {
    const { adop_id, p_name, p_type, p_desc } = req.body;
    const subQuery = db('adoptionlisting').select('adop_id').where({ adop_id })
    subQuery.then(response => {
        if (response.length > 0) {
            subQuery.update({
                p_name: p_name,
                p_desc: p_desc,
                p_type: p_type,
            })
                .then(resp => {
                    res.json('update done')
                })
                .catch(err => { res.json('update failed') })
        }
        else {
            res.json('update failed')
        }
    })
        .catch(err => { res.json(err) })
})

//USER PROFILE
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

//LISTENING
app.listen(3002, () => {
    console.log("ARS-IN-02 API Is Running On Port 3002");
})


// app.get('/shelteritems', (req, res) => {
//     console.log(req.body.s_id);
//     db.select('*').from('shelterdetails')
//         .join('items', 'shelterdetails.s_id', 'items.s_id')
//         .where('items.s_id', req.body.s_id)
//         .then((i_record) => {
//             // console.log(i_record[0].i_id);
//             res.json(i_record)
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(400).json(
//                 {
//                     message_type: "fail",
//                     message: "Unable to fetch details"
//                 }
//             )
//         })
// })