
const {v4:uuidv4} = require("uuid");
const User = require("../models/user");
const {setUser} = require("../service/auth");

async function handleUserSignUp (req,res) {
    const {name,email,password} = req.body;
    await User.create(
        {
            name, email, password,
        }
    );
    return res.redirect("/home");
};



async function handleUserlogin(req, res) {
    const { email, password, source } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
        return res.render(source === "admin" ? "admin_login" : "login", {
            error: "Invalid Username or Password",
        });
    }

    const token = setUser(user);
    res.cookie("uid", token);

    if (source === "admin") {
        return res.redirect("/admin");
    } else {
        return res.redirect("/home");
    }
}


module.exports = {
    handleUserSignUp,
    handleUserlogin
};
