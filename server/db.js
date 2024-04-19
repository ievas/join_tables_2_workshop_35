let pg = require("pg");
let client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_store_db"
);
let uuid = require("uuid");
let bcrypt = require("bcrypt");

let createTables = async () => {
  let SQL = `
  DROP TABLE IF EXISTS favorites;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS products;
  

  CREATE TABLE users(
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT UNIQUE

  );
  CREATE TABLE products(
    id UUID PRIMARY KEY,
    name TEXT
  );
  CREATE TABLE favorites(
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    CONSTRAINT user_product_unique UNIQUE (product_id, user_id)
  );
  `;
  await client.query(SQL);
};

let createProduct = async (product) => {
  let SQL = `INSERT INTO products(id, name) VALUES ($1,$2) RETURNING *`;
  let response = await client.query(SQL, [uuid.v4(), product.name]);
  return response.rows[0];
};
let createUser = async ({ username, password }) => {
  let SQL = `INSERT INTO users(id, username, password) VALUES ($1,$2, $3) RETURNING *`;
  let response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};
let fetchUsers = async () => {
  let SQL = `SELECT * FROM users`;
  let response = await client.query(SQL);
  return response.rows;
};
let fetchProducts = async () => {
  let SQL = `SELECT * FROM products`;
  let response = await client.query(SQL);
  return response.rows;
};
let fetchFavorites = async (userId) => {
  let SQL = `SELECT * FROM favorites WHERE user_id = $1`;
  let response = await client.query(SQL, [userId]);
  return response.rows;
};
let createFavorite = async ({ product_id, user_id }) => {
  let SQL = `INSERT INTO favorites (id, product_id, user_id) VALUES ($1,$2,$3) RETURNING *`;
  let response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
};
let destroyFavorite = async ({ user_id, id }) => {
  let SQL = `DELETE FROM favorites WHERE user_id=$1 AND id=$2`;
  await client.query(SQL, [user_id, id]);
};

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
};
