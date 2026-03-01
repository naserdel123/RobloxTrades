const BACKEND = "http://localhost:3000"; // لو تنشر على Render استبدل الرابط
let currentUser = null;
let currentAdmin = 0;
let selectedProduct = null;

// عرض التسجيل
function showRegister(){
document.getElementById("authBox").classList.add("hidden");
document.getElementById("registerBox").classList.remove("hidden");
}

function showLogin(){
document.getElementById("registerBox").classList.add("hidden");
document.getElementById("authBox").classList.remove("hidden");
}

// تسجيل حساب
async function register(){
const username = document.getElementById("regUser").value;
const email = document.getElementById("regEmail").value;
const pass = document.getElementById("regPass").value;
const pass2 = document.getElementById("regPass2").value;
if(pass!==pass2){alert("كلمة المرور غير متطابقة"); return;}
const res = await fetch(BACKEND+"/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,email,password:pass})});
const data = await res.json();
if(data.success){alert("تم التسجيل"); showLogin();}
}

// تسجيل دخول
async function login(){
const email = document.getElementById("loginEmail").value;
const pass = document.getElementById("loginPass").value;
const res = await fetch(BACKEND+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})});
const data = await res.json();
if(data.success){
currentUser = data.username;
currentAdmin = data.admin;
document.getElementById("authBox").classList.add("hidden");
document.getElementById("main").classList.remove("hidden");
if(currentAdmin==1) document.getElementById("addBtn").classList.remove("hidden");
loadProducts();
}else{alert(data.error);}
}

function logout(){location.reload();}

// تحميل المنتجات
async function loadProducts(){
const res = await fetch(BACKEND+"/products");
const products = await res.json();
const box = document.getElementById("products");
box.innerHTML="";
products.forEach((p,i)=>{
const div = document.createElement("div");
div.className="card";
div.innerHTML="<img src='"+p.image+"'><h3>"+p.name+"</h3><p>"+p.price+" ريال</p><p>"+p.method+"</p><button onclick='buy("+i+")'>شراء</button>";
box.appendChild(div);
});
}

// إضافة منتج
function openAdd(){document.getElementById("addBox").classList.remove("hidden");}
function addProduct(){
const file = document.getElementById("pImage").files[0];
const name = document.getElementById("pName").value;
const price = document.getElementById("pPrice").value;
const method = document.getElementById("pMethod").value;
const reader = new FileReader();
reader.onload=function(e){
fetch(BACKEND+"/add-product",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,price,method,image:e.target.result,admin:currentAdmin})}).then(r=>r.json()).then(d=>{if(d.success) location.reload();});
};
if(file) reader.readAsDataURL(file);
}

// شراء منتج
function buy(index){selectedProduct = index; document.getElementById("payBox").classList.remove("hidden");
// هنا تضيف كود Moyasar
}

// تأكيد الطلب
function confirmOrder(){const name = document.getElementById("robloxUser").value;
fetch(BACKEND+"/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:currentUser,product:selectedProduct,roblox:name})}).then(r=>r.json()).then(d=>{if(d.success){alert("تم الطلب"); location.reload();}});
}
