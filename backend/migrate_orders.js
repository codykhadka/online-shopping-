const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Try to link orders to users by matching customerName -> username or name
const orders = db.prepare('SELECT id, customerName FROM orders WHERE user_id IS NULL').all();
const users = db.prepare('SELECT id, name, username FROM users').all();

let linkedCount = 0;
orders.forEach(order => {
  const user = users.find(u => u.username === order.customerName || u.name === order.customerName);
  if (user) {
    db.prepare('UPDATE orders SET user_id = ? WHERE id = ?').run(user.id, order.id);
    linkedCount++;
  }
});

console.log(`Migration complete. Linked ${linkedCount} orders to user accounts.`);
