const express = require("express");
const router = express.Router();
const {handleHomePage, handleAdminPage, handleAdminLoginPost} = require("../controllers/url")

router.get("/home", handleHomePage);

router.get("/", (req, res) => {
    return res.render("signup");
});

router.get("/login", (req,res) => {
    return res.render("login");
});

router.get("/admin", handleAdminPage);


router.post("/admin/login", handleAdminLoginPost);

module.exports = router;