const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.classification AS c
      LEFT JOIN public.inventory AS i
      ON c.classification_id = i.classification_id
      WHERE c.classification_id = $1
    `
    const result = await pool.query(sql, [classification_id])
    return result.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    return []
  }
}


/* Get a single vehicle's data by inv_id*/
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error: " + error)
  }
}

// Insert new classification
async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount
  } catch (error) {
    console.error("insertClassification error:", error)
    return 0
  }
}

// Insert new inventory item
async function insertInventory({
  inv_make, inv_model, inv_year, inv_description, inv_price,
  inv_miles, inv_color, classification_id
}) {
  try {
    const sql = `INSERT INTO inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_image, inv_thumbnail)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'/images/no-image.png','/images/no-image.png')`
    const result = await pool.query(sql, [
      inv_make, inv_model, inv_year, inv_description,
      inv_price, inv_miles, inv_color, classification_id
    ])
    return result.rowCount
  } catch (error) {
    console.error("insertInventory error:", error)
    return 0
  }
}

/* ***************************
 *  Update inventory item without touching image or classification
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color) {
  try {
    const sql = `UPDATE inventory
                 SET inv_make=$1, inv_model=$2, inv_description=$3,
                     inv_price=$4, inv_year=$5, inv_miles=$6, inv_color=$7
                 WHERE inv_id=$8
                 RETURNING *`
    const result = await pool.query(sql, [
      inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_id
    ])
    return result.rows[0]
  } catch (error) {
    console.error("updateInventory error:", error)
    return null
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error:", error)
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  insertClassification,
  insertInventory,
  updateInventory,
  deleteInventoryItem
}