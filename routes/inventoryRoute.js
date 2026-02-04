// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const { body } = require("express-validator")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:invId", invController.buildByInventoryId)

router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional 500 error triggered"))
})

// Management view
router.get("/", invController.buildManagementView)

// Add classification
router.get("/add-classification", invController.buildAddClassification)
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters."),
  invController.addClassification
)

// Add inventory
router.get("/add-inventory", invController.buildAddInventory)
router.post(
  "/add-inventory",
  [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Mileage must be a positive integer."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").isInt().withMessage("Please select a classification."),
  ],
  invController.addInventory
)

module.exports = router;