const express = require("express")
const router = express.Router()
const db = require("../db")
const ExpressError = require("../expressError")

router.get('/', async (req,res,next) =>{
    try{
        const results = await db.query(`SELECT id, comp_code  FROM invoices`)
        return res.json({
            invoices: results.rows
        })
    } catch(e){
        next(e)
    }
})

router.get('/:id', async (req,res,next) =>{
    try{
        const {id} = req.params;
        const results = await db.query('SELECT id, amt, paid, add_date, paid_date, companies.code, companies.name, companies.description FROM invoices JOIN companies ON invoices.comp_code = companies.code;')
        if(results.rows.length ===0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
         }
        
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company : {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
         return res.json({"invoice": invoice})
    } catch(e){
        next(e)
    }
})

router.post('/', async (req,res,next) =>{
    try{
        const {comp_code, amt, paid, paid_date} = req.body.invoice
        const results = await db.query('INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1,$2,$3,$4) RETURNING *',[comp_code, amt, paid, paid_date])

        return res.status(201).json({invoice : results.rows[0]})
    } catch(e){
        next(e)
    }
})

router.put('/:id', async (req,res,next) =>{
    try{
        const {id} = req.params;
        const {amt, paid} = req.body
        let paidDate = null;

        const currentInvoice = await db.query(`SELECT paid From invoices WHERE id=$1`, [id])
        
        if(currentInvoice.rows.length ===0){
            throw new ExpressError(`Can't update invoice with id of ${id}`, 404)
        }

        const invoicePaidDate = currentInvoice.rows[0].paid_date;

        if (!invoicePaidDate && paid){
            paidDate = new Date();
        } else if (!paid){
            paidDate = null;
        } else {
            paidDate = invoicePaidDate
        }


        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *',[amt, id])

        return res.send({invoice : results.rows[0]})

    } catch(e){
        next(e)
    }
})

router.delete('/:id', async (req,res,next) =>{
    try{
        const {id} = req.params
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`,[id])
        if(results.command === 'DELETE' && results.rowCount===0){
            throw new ExpressError(`Can't Delete company that does not exist`)
        }
        return res.send({status: "deleted"})
    } catch(e){
        next(e)
    }
})


module.exports = router;