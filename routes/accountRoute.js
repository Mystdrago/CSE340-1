/* **************************************
* Account routes
* ***************************** */
//Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

/* ***************************************
* Deliver Login Veiw
* ************************************* */
router.get("/login", accountController.buildLogin)

//register veiw
router.get("/register", accountController.buildRegister)

// actual registration handler
router.post('/register', accountController.registerAccount)


module.exports = router