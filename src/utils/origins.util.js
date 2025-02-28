const allowedOrigins = ["https://pirateland.vercel.app"];

if (process.env.NODE_ENV === "dev") {
    allowedOrigins.push("http://localhost:5173");
}

module.exports = allowedOrigins;