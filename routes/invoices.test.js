process.env.NODE_ENV = "test";

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testCompany;
let testInvoice;

// beforeAll(async()=>{
//      await db.query(
//         `INSERT INTO companies (code, name)
//         VALUES 
//         ('Test1', 'Test Company 1'),
//         ('Test2', 'Test Company 2')
//         RETURNING code, name`
//     )
// })

beforeEach(async()=>{
    const companyResult = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES 
        ('Test1', 'Test Company 1', 'Wow Test Company 1'),
        ('Test2', 'Test Company 2', 'Wow Test Company 2')
        RETURNING code, name, description`
    )
    testCompany= companyResult.rows

    const invoiceResult = await db.query(
        `INSERT INTO invoices 
        (comp_code, amt, paid, paid_date)
        VALUES 
        ('Test1', 100, false, Null ),
        ('Test2', 200, true, '2018-01-01')
        RETURNING id, comp_code, amt, paid, paid_date, add_date`
    )
    testInvoice = invoiceResult.rows
})

afterEach(async()=>{
    await db.query(`DELETE from invoices`)
    await db.query(`DELETE FROM companies`)
})

afterAll(async()=>{
    await db.end()
})

describe("GET /invoices", ()=>{
    test("Get a list of invoices", async()=>{
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            invoices: [
                {comp_code: testInvoice[0].comp_code,
                    id: testInvoice[0].id},
                {comp_code: testInvoice[1].comp_code,
                    id: testInvoice[1].id}       
            ]
        })
    })
})

describe("GET /companies/:code", ()=>{
    test("Get a single company and it's invoices", async()=>{
        const res = await request(app).get(`/companies/${testCompany[0].code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            company: {
                code : testCompany[0].code,
                name : testCompany[0].name,
                description: testCompany[0].description,
                invoices : [
                    {
                        id : testInvoice[0].id,
                        amt: testInvoice[0].amt,
                        paid : testInvoice[0].paid,
                        paid_date : testInvoice[0].paid_date,
                        add_date : "2024-05-20T04:00:00.000Z"
                    }
                ]
            }
        })
    })
})