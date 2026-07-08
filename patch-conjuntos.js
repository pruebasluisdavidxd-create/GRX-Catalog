const fs = require("fs");
const path = require("path");

const possiblePaths = [
    path.join(__dirname, "api", "src", "routes", "catalog.js"),
    path.join(__dirname, "src", "routes", "catalog.js"),
];

const filePath = possiblePaths.find((p) => fs.existsSync(p));

if (!filePath) {
    console.log("No encontré catalog.js. Pon este archivo en la carpeta GRX-Catalog y vuelve a correrlo.");
    process.exit(1);
}

let code = fs.readFileSync(filePath, "utf8");

code = code.replace(
    'console.log("🔥 GRX CATALOG V2.7 FIX CAMISA 🔥", __filename);',
    'console.log("🔥 GRX CATALOG V2.8 CONJUNTOS ROBLOX 🔥", __filename);'
);

code = code.replace(
`    "Cintura",
    "Camisa",
    "Pantalón"
];`,
`    "Cintura",
    "Camisa",
    "Pantalón",
    "Conjuntos"
];`
);

if (!code.includes("const characterBundles = [")) {
    code = code.replace(
`const animationBundles = [`,
`// =========================================================
// CONJUNTOS / BUNDLES ROBLOX
// =========================================================

const characterBundles = [
    { bundleId: 238, name: "Man", price: "Gratis", creator: "Roblox", theme: "Clásico" },
    { bundleId: 239, name: "Woman", price: "Gratis", creator: "Roblox", theme: "Clásico" },
    { bundleId: 311, name: "Robloxian 2.0", price: 175, creator: "Roblox", theme: "Clásico" },
    { bundleId: 337, name: "City Life Woman", price: "Gratis", creator: "Roblox", theme: "Ciudad" },
    { bundleId: 589, name: "Junkbot", price: "Gratis", creator: "Roblox", theme: "Robot" },
    { bundleId: 57, name: "Ten Million Robux Man", price: 5000, creator: "Roblox", theme: "Premium" },
    { bundleId: 192, name: "Korblox Deathspeaker", price: 17000, creator: "Roblox", theme: "Korblox" }
];

function normalizeBundle(bundle) {
    return {
        id: bundle.bundleId,
        bundleId: bundle.bundleId,
        name: sanitizeText(bundle.name, 58),
        price: bundle.price,
        creator: sanitizeText(bundle.creator || "Roblox", 40),
        category: "Conjuntos",
        type: "Bundle",
        theme: sanitizeText(bundle.theme || "Conjunto", 30),
        thumbnail: \`rbxthumb://type=BundleThumbnail&id=\${bundle.bundleId}&w=150&h=150\`
    };
}

async function getCharacterBundles(query) {
    let bundles = characterBundles;

    if (query && query.trim() !== "") {
        const q = query.toLowerCase();

        bundles = bundles.filter(bundle =>
            String(bundle.name || "").toLowerCase().includes(q) ||
            String(bundle.theme || "").toLowerCase().includes(q) ||
            String(bundle.creator || "").toLowerCase().includes(q)
        );
    }

    return bundles.map(normalizeBundle);
}

const animationBundles = [`
    );
}

code = code.replace(
    'if (!category || category === "Todos" || category === "Animaciones") {',
    'if (!category || category === "Todos" || category === "Animaciones" || category === "Conjuntos") {'
);

if (!code.includes('debugVersion: "GRX_V2_8_CACHE_BUNDLES"')) {
    code = code.replace(
`        if (category === "Animaciones") {`,
`        if (category === "Conjuntos") {
            const bundleResults = await getCharacterBundles(query);

            return res.json({
                success: true,
                debugVersion: "GRX_V2_8_CACHE_BUNDLES",
                search: query,
                category,
                page,
                pageSize,
                count: bundleResults.length,
                totalCached: bundleResults.length,
                hasMore: false,
                results: bundleResults
            });
        }

        if (category === "Animaciones") {`
    );
}

code = code.replaceAll("GRX_V2_7_CACHE_ANIMATIONS", "GRX_V2_8_CACHE_ANIMATIONS");
code = code.replaceAll("GRX_V2_7_CACHE_MARKETPLACE", "GRX_V2_8_CACHE_MARKETPLACE");
code = code.replaceAll("GRX_V2_7_CACHE_ERROR", "GRX_V2_8_CACHE_ERROR");
code = code.replace('version: "2.7"', 'version: "2.8"');

fs.writeFileSync(filePath, code, "utf8");

console.log("✅ catalog.js actualizado a V2.8 con categoría Conjuntos");
console.log(filePath);