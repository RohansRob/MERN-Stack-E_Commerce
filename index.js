const express = require("express");
const cors = require("cors");
require('./db/config');
const User = require("./db/User");
const app = express();
const Product = require("./db/Product");

const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

app.use(express.json());
app.use(cors());
app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: " Something went wrong please after some time " })
        }
        resp.send({ result, auth: token })
    })
    // resp.send(result);

})
app.post("/login", async (req, resp) => {
    console.log(req.body)
    if (req.body.password && req.body.email) {
        //one result 
        let user = await User.findOne(req.body).select("-password");
        if (user) {

        } else {
            resp.send({ result: 'No User Found' })
        }
    } else {
        resp.send({ result: 'No user found' })
    }

});
app.post("/add-product",verifyToken, async (req, resp) => {
    let product = new Product(req.body);
    let result = await Product.save();
    resp.send(result);

});
app.get("/products",verifyToken, async (res, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "No products found" })
    }

});

app.delete("/product/:id",verifyToken, async (req, resp) => {
    // resp.send(req.params.id);
    const result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result);
});

app.get("/product/:id",verifyToken, async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result)
    } else {
        resp.send({ result: "No record found." })
    }

})
app.put("/product/:id",verifyToken, async (req, resp) => {
    let result = await Product.updateOne(
        { _id: req.params.id },

        {
            $set: req.body
        }
    )
    resp.send(result)
});


app.get("/search/:key", verifyToken, async (req, resp) => {
    let result = await Product.find({
        '$or': [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    });
    resp.send(result)
});
//Jwt auth
function verifyToken(req, resp, next) {
    let token = req.headers['authorization'];

    if (token) {
        token = token.split(' ')[1];
        console.warn("middleware called if", token[1])
        Jwt.verify(token, jwtkey, (err, valid) => {
            if (err) {
                //when no token
                resp.status(401).send({ result: "Please provide valid token" })
            } else {
                next();
            }
        })

    } else {
        resp.status(403).send({ result: "Please add token with header" })

    }
    // console.warn("middleware called" , token)
    // next();
}

app.listen(5000);
