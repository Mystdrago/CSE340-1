const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  let classification_id = parseInt(req.params.classificationId)

  if (isNaN(classification_id)) {
    // redirect or show a friendly message
    req.flash("notice", "Invalid classification ID")
    return res.redirect("/") 
  }

  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
    let className = "No vehicles found"
    let grid = "<p>No vehicles found for this classification.</p>"

    if (data.length > 0) {
      className = data[0].classification_name
      grid = await utilities.buildClassificationGrid(data)
    }

    const nav = await utilities.getNav()
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
      errors: null,
    })
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    next(error)
  }
}

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
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationList,
    })
  } catch (error) {
    next(error)
  }
}

invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (updateResult) {
    req.flash("notice", `The ${updateResult.inv_make} ${updateResult.inv_model} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit Inventory Item",
      nav,
      classificationList: await utilities.buildClassificationList(), // fallback
      errors: null,
      values: req.body
    })
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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    
    // If invData is empty, return an empty array instead of throwing
    if (invData.length > 0) {
      return res.json(invData)
    } else {
      return res.json([]) // return empty array for JS to handle
    }

  } catch (error) {
    next(error) // pass other errors to error handler
  }
}


invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    
    const itemData = await invModel.getInventoryById(inv_id)
    if (!itemData) return next(new Error("Inventory item not found"))

    const classificationList = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      values: { ...itemData }  // pass all existing values including image, thumbnail
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()

    const itemData = await invModel.getInventoryById(inv_id)
    if (!itemData) return next(new Error("Inventory item not found"))

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      values: { ...itemData }
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)

    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult.rowCount === 1) {
      req.flash("notice", "The vehicle was successfully deleted.")
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      return res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}


module.exports = invCont
