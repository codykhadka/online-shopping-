const Database = require('better-sqlite3');
const db = new Database('./danphe.db');
const users = db.prepare('SELECT id, username, name, email, avatar, role FROM users').all();
console.log(JSON.stringify(users, null, 2));
