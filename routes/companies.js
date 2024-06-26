const express = require("express")
const router = express.Router()
const db = require("../db")
const ExpressError = require("../expressError")
const slugify = require("slugify")

router.get('/', async (req,res,next) =>{
    try{
        const results = await db.query(`SELECT code, name FROM companies`)
        return res.json({
            companies: results.rows
        })
    } catch(e){
        next(e)
    }
})

router.get('/:code', async (req,res,next) =>{
    try{
        const {code} = req.params;

        const companyResults = await db.query(`SELECT * FROM companies WHERE code=$1 `,[code])

        const invoiceResults = await db.query(`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE comp_code=$1`, [code])

        const industryResults = await db.query(
            `SELECT c.code, c.name, i.industry 
            FROM companies as c 
            LEFT JOIN companies_industries AS ci 
            ON c.code = ci.comp_code 
            LEFT JOIN industries as i 
            ON ci.industry_code = i.code 
            WHERE c.code = $1;`,
            [code]
        )

        if(companyResults.rows.length ===0){
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
         }

        const company = companyResults.rows[0]
        const invoices = invoiceResults.rows
        const industries = industryResults.rows


        company.invoices = invoices.map(inv => inv)
        company.industries = industries.map(ind => ind.industry)

        return res.json({"company": company})

    } catch(e){
        next(e)
    }
})

router.post('/', async (req,res,next) =>{
    try{
        const {name,description} = req.body
        const code = slugify(name, {lower:true});

        const results = await db.query('INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING *',[code,name,description])
        return res.status(201).json({company : results.rows[0]})
    } catch(e){
        next(e)
    }
})

router.put('/:code', async (req,res,next) =>{
    try{
        const {code} = req.params;
        const {name, description} = req.body

        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *',[name,description,code])

        if(results.rows.length ===0){
            throw new ExpressError(`Can't update company with code of ${code}`, 404)
        }

        return res.send({company : results.rows[0]})

    } catch(e){
        next(e)
    }
})

router.delete('/:code', async (req,res,next) =>{
    try{
        const {code} = req.params
        const results = await db.query(`DELETE FROM companies WHERE code=$1`,[code])
        if(results.command === 'DELETE' && results.rowCount===0){
            throw new ExpressError(`Can't Delete company that does not exist`, 404)
        }
        return res.send({status: "deleted"})
    } catch(e){
        next(e)
    }
})

module.exports = router;