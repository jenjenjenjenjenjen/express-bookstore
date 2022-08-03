process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require('../models/book');

let book;

describe("books routes test", function () {

    beforeEach(async function() {
        await db.query(`DELETE FROM books`);

        book = await Book.create({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Test Auth",
            "language": "english",
            "pages": 264,
            "publisher": "Testing",
            "title": "Test Book",
            "year": 2017
          });
    });

    describe('GET /books', function() {

        test("get all books", async () => {
            const response = await request(app).get('/books');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({books: [book]});
        });

    });

    describe('GET /books/[id]', function() {

        test("get single book", async () => {
            const resp = await request(app).get(`/books/${book.isbn}`);

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual({book: book});

        })
        test("return 404 for ivalid id", async () => {
            const resp = await request(app).get('/books/badnum');

            expect(resp.statusCode).toBe(404);
        });
    });

    describe('POST /books', function() {
        
        test("create new book", async () => {
            const resp = await request(app).post('/books').send({
                "isbn": "3793249374",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Me",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "My Book",
                "year": 2017
            });

            expect(resp.statusCode).toBe(201);
            expect(resp.body).toEqual({"book": {
                    "isbn": "3793249374",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Me",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "My Book",
                    "year": 2017
                }});
        });
        test("return 400 for missing data", async () => {
            const resp = await request(app).post('/books').send({
                "isbn": "3793249374",
                "author": "Me",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "My Book",
                "year": 2017
            });

            expect(resp.statusCode).toBe(400);
        });
        test("return 400 for wrong type", async () => {
            const resp = await request(app).post('/books').send({
                "isbn": "3793249374",
                "amazon_url": 4000000000,
                "author": "Me",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "My Book",
                "year": 2017
            });

            expect(resp.statusCode).toBe(400);
        });

    });

    describe("PUT /books/[isbn]", function() {

        test("update book", async () => {
            const resp = await request(app).put(`/books/${book.isbn}`).send({
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Real Author",
                "language": "english",
                "pages": 264,
                "publisher": "Testing",
                "title": "Test Book",
                "year": 2017
            });

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual({book: {
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Real Author",
                "language": "english",
                "pages": 264,
                "publisher": "Testing",
                "title": "Test Book",
                "year": 2017
              }});
        });
        test("return 400 for invalid isbn", async () => {
            const resp = await request(app).put('/books/badisbn');

            expect(resp.statusCode).toBe(400);
        });

    });

    describe('DELETE /books/[isbn]', function() {

        test("delete a book", async () => {
            const resp = await request(app).delete(`/books/${book.isbn}`);

            expect(resp.statusCode).toBe(200);
        });
        test("return 404 for invalid isbn", async () => {
            const resp = await request(app).delete('/books/badisbn');

            expect(resp.statusCode).toBe(404);
        })
    })

    afterAll(function() {
        db.end();
    })
});