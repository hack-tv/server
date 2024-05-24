const { afterAll, beforeAll, describe, expect, it } = require('@jest/globals');
const request = require('supertest');

const { Profile, User } = require('../models');
const app = require('../app');
const users = require('../mocks/users.json');
const profiles = require('../mocks/profiles.json');

/* ========== SEED DATA ========== */
beforeAll(async () => {
  try {
    await User.bulkCreate(users, { individualHooks: true });
    await Profile.bulkCreate(profiles);
  } catch (err) {
    console.log(err);
  }
});

/* ========== LOGIN (POST) ========== */
describe('POST /auth/login', () => {
  it('Email tidak diberikan / tidak diinput', async () => {
    const response = await request(app).post('/auth/login').send({
      email: '',
      password: '12345',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Email is required');
  });

  it('Password tidak diberikan / tidak diinput', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'akmal@hacktv.com',
      password: '',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Password is required');
  });

  it('Email diberikan invalid / tidak terdaftar', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'invalid@hacktv.com',
      password: '12345',
    });

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('Password diberikan salah / tidak match', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'akmal@hacktv.com',
      password: 'invalid',
    });

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('Berhasil login dan mengirimkan access_token', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'akmal@hacktv.com',
      password: '12345',
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('access_token', expect.any(String));
  });
});

/* ========== REGISTER (POST) ========== */
describe('POST /auth/register', () => {
  it('Email tidak diberikan / tidak diinput', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      password: '12345',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Email is required');
  });

  it('Password tidak diberikan / tidak diinput', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      email: 'badzlin@hacktv.com',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Password is required');
  });

  it('Email diberikan string kosong', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      email: '',
      password: '12345',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Email is required');
  });

  it('Password diberikan string kosong', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      email: 'badzlin@hacktv.com',
      password: '',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Password is required');
  });

  it('Email sudah terdaftar', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      email: 'akmal@hacktv.com',
      password: '12345',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Email already exists');
  });

  it('Format email salah / invalid', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      email: 'badzlin',
      password: '12345',
    });

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid email format');
  });

  it('Berhasil register', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'Badzlin Maladzi',
      imgUrl: 'https://i.pravatar.cc/300',
      email: 'badzlin@hacktv.com',
      password: '12345',
    });

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('id', expect.any(Number));
    expect(response.body).toHaveProperty('email', 'badzlin@hacktv.com');
  });
});

/* ========== CLEAN UP DATA ========== */
afterAll(async () => {
  try {
    await User.destroy({ truncate: true, cascade: true, restartIdentity: true });
    await Profile.destroy({ truncate: true, cascade: true, restartIdentity: true });
  } catch (err) {
    console.log(err);
  }
});
