const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'backend', 'database.sqlite'));

console.log("--- USERS ---");
const users = db.prepare('SELECT id, name, username, phone, role FROM users').all();
console.log(JSON.stringify(users, null, 2));

console.log("\n--- ORDERS ---");
const orders = db.prepare('SELECT * FROM orders').all();
console.log(JSON.stringify(orders, null, 2));

console.log("\n--- ADMIN USERS WITH ORDERS ---");
const result = users.map(user => {
  const userOrders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(user.id);
  return { ...user, orders: userOrders };
});
console.log(JSON.stringify(result, null, 2));
