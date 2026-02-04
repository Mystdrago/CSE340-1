'use strict'

/* ***************************
 *  Check Inventory Data
 *  Validates data from the "Add Inventory" form
 * *************************** */
function checkInventoryData(req, res, next) {
    const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

    const errors = []

    if (!inv_make || inv_make.trim() === '') {
        errors.push('Vehicle Make is required')
    }
    if (!inv_model || inv_model.trim() === '') {
        errors.push('Vehicle Model is required')
    }
    if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > new Date().getFullYear() + 1) {
        errors.push('Vehicle Year must be a valid number')
    }
    if (!inv_description || inv_description.trim() === '') {
        errors.push('Description is required')
    }
    if (!inv_price || isNaN(inv_price) || inv_price < 0) {
        errors.push('Price must be a positive number')
    }
    if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) {
        errors.push('Miles must be a positive number')
    }
    if (!inv_color || inv_color.trim() === '') {
        errors.push('Color is required')
    }
    if (!classification_id || isNaN(classification_id)) {
        errors.push('Classification must be selected')
    }

    if (errors.length > 0) {
        res.locals.errors = errors
        return res.render('inventory/add-inventory', {
            title: 'Add Inventory',
            nav: res.locals.nav || '',
            classificationList: res.locals.classificationList || '',
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }

    next()
}


/* ***************************
 *  Check Update Data
 *  Validates data from the "Edit Inventory" form
 *  Errors will be sent back to the edit view
 * *************************** */
function checkUpdateData(req, res, next) {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

    const errors = []

    if (!inv_make || inv_make.trim() === '') {
        errors.push('Vehicle Make is required')
    }
    if (!inv_model || inv_model.trim() === '') {
        errors.push('Vehicle Model is required')
    }
    if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > new Date().getFullYear() + 1) {
        errors.push('Vehicle Year must be a valid number')
    }
    if (!inv_description || inv_description.trim() === '') {
        errors.push('Description is required')
    }
    if (!inv_price || isNaN(inv_price) || inv_price < 0) {
        errors.push('Price must be a positive number')
    }
    if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) {
        errors.push('Miles must be a positive number')
    }
    if (!inv_color || inv_color.trim() === '') {
        errors.push('Color is required')
    }
    if (!classification_id || isNaN(classification_id)) {
        errors.push('Classification must be selected')
    }

    if (errors.length > 0) {
        res.locals.errors = errors
        return res.render('inventory/edit-inventory', {
            title: 'Edit Inventory',
            nav: res.locals.nav || '',
            classificationList: res.locals.classificationList || '',
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }

    next()
}

module.exports = { checkInventoryData, checkUpdateData }
