/* **************************************
* Account routes
* ***************************** */
//Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

/* ***************************************
* Deliver Login Veiw
* ************************************* */
router.get("/login", accountController.buildLogin)

//register veiw
router.get("/register", accountController.buildRegister)

// actual registration handler
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  accountController.registerAccount
)

// Login view
router.get("/login", accountController.buildLogin)

// Login processing
router.post("/login", 
  regValidate.loginRules(),
  regValidate.checkLogData,
  accountController.accountLogin)

// Default account management view
router.get("/", accountController.buildAccountManagement);

module.exports = router