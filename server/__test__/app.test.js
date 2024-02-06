const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('should return the expected response with q=phone, limit=2, skip=0', async () => {
    const response = await request(app)
      .get('/')
      .query({ q: 'phone', limit: 2, skip: 0 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('products');
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  it('should return status code 400 when required query parameters are missing', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(400);
  });

  it('should handle page limit change', async () => {
    const response = await request(app)
      .get('/')
      .query({ q: 'phone', limit: 4, skip: 0 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('products');
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products).toHaveLength(4);
  });

  it('should return an empty array when no products match the search query', async () => {
    const response = await request(app)
      .get('/')
      .query({ q: 'nonexistentproduct', limit: 2, skip: 0 });
    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(0);
  });

  it('should return status code 400 when limit and skip parameters are missing', async () => {
    const response = await request(app)
      .get('/')
      .query({ q: 'phone' });
    expect(response.status).toBe(400);
  });

  it('should return status code 400 when limit and skip parameters are provided as strings', async () => {
    const response = await request(app)
      .get('/')
      .query({ q: 'phone', limit: 'two', skip: 'zero' });
    expect(response.status).toBe(400);
  });

  it('should return status code 400 when limit and skip parameters are provided as negative numbers', async () => {
    const response = await request(app)
      .get('/')
      .query({ q: 'phone', limit: -2, skip: -1 });
    expect(response.status).toBe(400);
  });
});
