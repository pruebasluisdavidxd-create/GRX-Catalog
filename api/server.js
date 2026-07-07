const express = require("express");
const cors = require("cors");

const catalogRoutes = require("./src/routes/catalog");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});

app.get("/", (req, res) => {
    res.json({
        name: "GRX Catalog API",
        version: "1.0.0",
        status: "Online 🚀",
        debugServer: "SERVER_LISTO_PARA_RENDER_Y_LOCAL"
    });
});

app.use("/catalog", catalogRoutes);

// Render usa process.env.PORT.
// Localmente seguirá usando 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("🔥 GRX SERVER ONLINE 🔥");
    console.log("Servidor iniciado en puerto " + PORT);
    console.log("Ruta principal: /");
    console.log("Ruta catálogo: /catalog/search");
    console.log("====================================");
});