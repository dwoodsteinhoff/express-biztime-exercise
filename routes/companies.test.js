process.env.NODE_ENV = "test";

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testCompany;

beforeEach(async()=>{
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('Test1', 'Test Company', 'A Test Company')
        RETURNING code, name`
    )
    testCompany = result.rows
})

afterEach(async()=>{
    await db.query(`DELETE from companies`)
})

afterAll(async()=>{
    await db.end()
})

describe("GET /companies", ()=>{
    test("Get a list of companies", async()=>{
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            companies: testCompany
        })
    })
})

describe("POST /companies", ()=>{
    test("Create a new company", async()=>{
        const res = await request(app).post(`/companies`).send({code:'NewComp', name:'New Test Company', description: 'Created a New Company'})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            company: {code:'NewComp', name:'New Test Company', description: 'Created a New Company'}
        })
    })
})

describe("PATCH /companies/:code", () =>{
    test("Updates a single company", async() =>{
        const res= await request(app)
        .put(`/companies/${testCompany[0].code}`)
        .send({name:'New Test Company', description: 'Created a New Company'})
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: { code: "Test1", name:'New Test Company', description: 'Created a New Company'}
        })
    })
    test("Responds with 404 for invalid code", async() =>{
        const res= await request(app).patch(`/company/0`).send({code:'NewComp', name:'New Test Company', description: 'Created a New Company'})
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /companies/:code", () =>{
    test("deletes a single company", async() =>{
        const res= await request(app).delete(`/companies/${testCompany[0].code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status:'deleted'})
    })
    test("Responds with 404 for invalid company", async() =>{
        const res= await request(app).delete(`/companies/0`)
        expect(res.statusCode).toBe(404);
    })
})