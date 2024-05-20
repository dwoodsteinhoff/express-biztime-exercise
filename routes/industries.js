const express = require("express")
const router = express.Router()
const db = require("../db")
const ExpressError = require("../expressError")
const slugify = require("slugify")

router.get('/', async(req,res,next)=>{
    try{ 
        const results = await db.query(
            `SELECT i.industry, c.code 
            FROM industries AS i
            LEFT JOIN companies_industries AS ci
            ON i.code = ci.industry_code
            LEFT JOIN companies as c 
            ON ci.comp_code = c.code`
        )
        return res.json({
            industries: results.rows
        })
    } catch(e){
        next(e)
    }
})

router.post('/', async (req,res,next) =>{
    try{
        const {code, industry} = req.body
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1,$2) RETURNING *',[code, industry])
        return res.status(201).json({industry : results.rows[0]})
    } catch(e){
        next(e)
    }
})

module.exports = router;

