

// =========================
//          PORT
// =========================

process.env.PORT = process.env.PORT || 3000;


// =========================
//        Environment
// =========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// =========================
//         DataBase
// =========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = "mongodb://localhost:27017/cafe";
} else {
    urlDB = "mongodb+srv://Daveolivares:X44f6MKAYFDNBhDR@cluster0-m0vf7.mongodb.net/cafe";
}

process.env.URLDB = urlDB;