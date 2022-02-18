const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const database = {
    users: [
        {
            id: "123",
            name: "John",
            email: "john@gmail.com",
            password: "cookies",
            entries: 0,
            type: "User",
            joined: new Date(),
        },
        {
            id: "124",
            name: "Sally",
            email: "sally@gmail.com",
            password: "bananas",
            entries: 0,
            type: "Shelter",
            joined: new Date(),
        },
    ],
};

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


app.listen(3002, () => {
    console.log("ARS-IN-02 API Is Running On Port 3002");
})