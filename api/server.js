const express = require("express");
const cors = require("cors");

const catalogRoutes = require("./src/routes/catalog");
const emoteRoutes = require("./src/routes/emotes");

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
        version: "1.1.0",
        status: "Online 🚀",
        debugServer: "SERVER_RENDER_CATALOG_Y_EMOTES"
    });
});

app.use("/catalog", catalogRoutes);
app.use("/emotes", emoteRoutes);

// Render usa process.env.PORT.
// Localmente seguirá usando 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("🔥 GRX SERVER ONLINE 🔥");
    console.log("Servidor iniciado en puerto " + PORT);
    console.log("Ruta principal: /");
    console.log("Ruta catálogo: /catalog/search");
    console.log("Ruta emotes: /emotes/search");
    console.log("====================================");
});