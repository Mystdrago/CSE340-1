const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

 module.exports = invCont

 /* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  const vehicle = await invModel.getInventoryById(inv_id)

  if (!vehicle) {
    next(new Error("Vehicle not found"))
    return
  }

  const detail = await utilities.buildDetailView(vehicle)
  const nav = await utilities.getNav()

  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    detail,
    errors: null,
  })
}

/* Management View*/
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* Add Classification View*/
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: "",
    })
  } catch (error) {
    next(error)
  }
}

/* POST: Insert Classification */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name,
    })
  }

  try {
    const result = await invModel.insertClassification(classification_name)
    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      const nav = await utilities.getNav() // refresh nav to show new classification
      return res.render("./inventory/management", { title: "Inventory Management", nav, errors: null })
    } else {
      throw new Error("Insertion failed")
    }
  } catch (error) {
    next(error)
  }
}

/* Add Inventory View*/
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      errors: null,
      classificationList,
      values: {} // empty for sticky
    })
  } catch (error) {
    next(error)
  }
}

/* POST: Insert Inventory */
invCont.addInventory = async function (req, res, next) {
  const errors = validationResult(req)
  const values = req.body
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(values.classification_id)

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      errors: errors.array(),
      classificationList,
      values
    })
  }

  try {
    const result = await invModel.insertInventory(values)
    if (result) {
      req.flash("notice", `Inventory item "${values.inv_make} ${values.inv_model}" added successfully.`)
      return res.render("./inventory/management", { title: "Inventory Management", nav, errors: null })
    } else {
      throw new Error("Insertion failed")
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
