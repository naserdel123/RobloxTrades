const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // للسماح للFrontend بالاتصال

const db = new sqlite3.Database("./db.sqlite");

// إنشاء جدول المستخدمين
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  email TEXT,
  password TEXT,
  admin INTEGER
)`);

// إنشاء جدول المنتجات
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price REAL,
  method TEXT,
  image TEXT
)`);

// إنشاء جدول الطلبات
db.run(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  user TEXT,
  product TEXT,
  roblox TEXT,
  date TEXT
)`);

// تسجيل مستخدم
app.post("/register", async (req,res)=>{
  const {username,email,password} = req.body;
  const hashed = await bcrypt.hash(password,10);
  db.run("INSERT INTO users (username,email,password,admin) VALUES (?,?,?,0)", [username,email,hashed], function(err){
    if(err){ return res.status(500).json({error:err.message}); }
    res.json({success:true});
  });
});

// تسجيل دخول
app.post("/login", (req,res)=>{
  const {email,password} = req.body;
  db.get("SELECT * FROM users WHERE email=?", [email], async (err,row)=>{
    if(err) return res.status(500).json({error:err.message});
    if(!row) return res.status(404).json({error:"مستخدم غير موجود"});
    const match = await bcrypt.compare(password,row.password);
    if(!match) return res.status(401).json({error:"كلمة المرور خطأ"});
    res.json({success:true, username: row.username, admin: row.admin});
  });
});

// إضافة منتج (للأدمن فقط)
app.post("/add-product", (req,res)=>{
  const {name,price,method,image,admin} = req.body;
  if(admin !== 1) return res.status(403).json({error:"غير مصرح"});
  db.run("INSERT INTO products (name,price,method,image) VALUES (?,?,?,?)",[name,price,method,image],function(err){
    if(err) return res.status(500).json({error:err.message});
    res.json({success:true});
  });
});

// جلب المنتجات
app.get("/products",(req,res)=>{
  db.all("SELECT * FROM products",[],(err,rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
});

// حفظ الطلب بعد الدفع
app.post("/orders",(req,res)=>{
  const {user,product,roblox} = req.body;
  db.run("INSERT INTO orders (user,product,roblox,date) VALUES (?,?,?,?)",
    [user,product,roblox,new Date().toISOString()],
    function(err){
      if(err) return res.status(500).json({error:err.message});
      res.json({success:true});
    });
});

app.listen(3000,()=>console.log("Backend running on port 3000"));
