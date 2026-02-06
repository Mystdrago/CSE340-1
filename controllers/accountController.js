const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}


//register veiw
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname: "",
        account_lastname: "",
        account_email: "",
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )


  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  try {
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email,
      })
    }

    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!passwordMatch) {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email,
      })
    }

    // SUCCESS LOGIN
    delete accountData.account_password

    const accessToken = jwt.sign(
      accountData,
      process.env.ACCOUNT_TOKEN_SECRET,
      { expiresIn: "1h" }
    )

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      maxAge: 3600 * 1000,
    })

    return res.redirect("/account/")

  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "Something went wrong. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
    })
  }
}

async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  return res.render("account/management", {
    title: "Account Management",
    nav,
    messages: req.flash()
  });
}


// Show update account view
async function buildUpdateView(req, res) {
  const nav = res.locals.nav
  const account_id = req.params.accountId

  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    messages: req.flash(),
    ...accountData
  })
}

// Process account info update
async function updateAccount(req, res) {
  const nav = res.locals.nav
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const result = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (result) {
    const updatedData = await accountModel.getAccountById(account_id)

    req.flash("success", "Account updated successfully.")

    return res.render("account/management", {
      title: "Account Management",
      nav,
      accountData: updatedData,
      messages: req.flash()
    })
  }

  req.flash("notice", "Account update failed.")
  res.redirect(`/account/update/${account_id}`)
}



// Process password update
async function updatePassword(req, res) {
  const nav = res.locals.nav
  const { account_password, account_id } = req.body

  const hashedPassword = await bcrypt.hash(account_password, 10)
  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    const updatedData = await accountModel.getAccountById(account_id)

    req.flash("success", "Password updated successfully.")

    return res.render("account/management", {
      title: "Account Management",
      nav,
      accountData: updatedData,
      messages: req.flash()
    })
  }

  req.flash("notice", "Password update failed.")
  res.redirect(`/account/update/${account_id}`)
}

function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}


module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateView, updateAccount, updatePassword, accountLogout}