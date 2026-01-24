// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:invId", invController.buildByInventoryId)

router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional 500 error triggered"))
})


module.exports = router;



