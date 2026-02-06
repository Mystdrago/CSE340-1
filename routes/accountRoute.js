/* **************************************
* Account routes
* ***************************** */
//Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
router.use(utilities.getAccountData)

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

// Login processing
router.post("/login", 
  regValidate.loginRules(),
  regValidate.checkLogData,
  accountController.accountLogin)

// Default account management view
router.get("/", utilities.checkLogin, accountController.buildAccountManagement);


router.get(
  "/update/:accountId",
  utilities.checkLogin,
  accountController.buildUpdateView
)

router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  accountController.updateAccount
)

router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  accountController.updatePassword
)

router.get("/logout", accountController.accountLogout)


module.exports = router