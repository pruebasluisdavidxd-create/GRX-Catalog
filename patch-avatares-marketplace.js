const fs = require("fs");
const path = require("path");

const possiblePaths = [
    path.join(__dirname, "api", "src", "routes", "catalog.js"),
    path.join(__dirname, "src", "routes", "catalog.js"),
];

const filePath = possiblePaths.find((p) => fs.existsSync(p));

if (!filePath) {
    console.log("No encontré catalog.js. Pon este archivo en la carpeta GRX-Catalog.");
    process.exit(1);
}

let code = fs.readFileSync(filePath, "utf8");

code = code.replace(
    'console.log("🔥 GRX CATALOG V2.8 CONJUNTOS ROBLOX 🔥", __filename);',
    'console.log("🔥 GRX CATALOG V2.9 AVATARES MARKETPLACE 🔥", __filename);'
);

const avatarMarketplaceBlock = `
// =========================================================
// CONJUNTOS / AVATARES DEL MARKETPLACE ROBLOX
// Busca avatares reales como los de la pestaña "Avatares".
// =========================================================

const ROBLOX_MARKETPLACE_URL = "https://catalog.roblox.com/v1/search/items/details";

const avatarStarterKeywords = [
    "emo",
    "vkei",
    "y2k",
    "angel",
    "dark",
    "black",
    "cute",
    "mafioso",
    "payaso",
    "sushi",
    "anime",
    "goth",
    "boy",
    "girl",
    "femboy",
    "mask",
    "streetwear",
    "aesthetic"
];

function isMarketplaceBundle(item) {
    const itemType = String(item.itemType || item.itemTypeName || "").toLowerCase();
    const assetType = String(item.assetType || item.assetTypeName || "").toLowerCase();

    return (
        itemType.includes("bundle") ||
        assetType.includes("bundle") ||
        item.itemType === 1 ||
        item.itemType === "Bundle"
    );
}

function normalizeMarketplaceAvatar(item) {
    const id = item.id || item.itemId || item.bundleId;

    return {
        id,
        bundleId: id,
        name: sanitizeText(item.name || item.itemName || "Avatar", 58),
        price: item.price || item.lowestPrice || item.priceStatus || "Gratis",
        creator: sanitizeText(
            item.creatorName ||
            item.creatorTargetName ||
            item.creator?.name ||
            "Roblox",
            40
        ),
        category: "Conjuntos",
        type: "Bundle",
        theme: "Avatar",
        thumbnail: \`rbxthumb://type=BundleThumbnail&id=\${id}&w=150&h=150\`
    };
}

function removeDuplicateAvatars(items) {
    const seen = new Set();
    const clean = [];

    for (const item of items) {
        if (!item || !item.id) continue;

        const key = String(item.id);

        if (seen.has(key)) continue;

        seen.add(key);
        clean.push(item);
    }

    return clean;
}

async function searchMarketplaceAvatars(keyword, limit = 30) {
    const q = sanitizeQuery(keyword || "", 50);

    const attempts = [
        {
            Keyword: q,
            Category: 13,
            Subcategory: 37,
            SortType: 1,
            SortAggregation: 5,
            Limit: limit,
            IncludeNotForSale: true
        },
        {
            Keyword: q,
            Category: 1,
            Subcategory: 37,
            SortType: 1,
            SortAggregation: 5,
            Limit: limit,
            IncludeNotForSale: true
        },
        {
            Keyword: q,
            Category: 4,
            SortType: 1,
            SortAggregation: 5,
            Limit: limit,
            IncludeNotForSale: true
        },
        {
            Keyword: q,
            SortType: 1,
            SortAggregation: 5,
            Limit: limit,
            IncludeNotForSale: true
        }
    ];

    const found = [];

    for (const params of attempts) {
        try {
            const response = await axios.get(ROBLOX_MARKETPLACE_URL, {
                params,
                timeout: 9000,
                headers: {
                    "User-Agent": "GRX-Catalog/1.0"
                }
            });

            const data = response.data?.data || [];

            for (const item of data) {
                if (!isMarketplaceBundle(item)) continue;

                const normalized = normalizeMarketplaceAvatar(item);

                if (normalized.id) {
                    found.push(normalized);
                }
            }

            if (found.length >= limit) {
                break;
            }
        } catch (error) {
            console.log("Falló búsqueda de avatares:", q, error.message);
        }
    }

    return removeDuplicateAvatars(found).slice(0, limit);
}

async function getCharacterBundles(query) {
    const cleanQuery = sanitizeQuery(query || "", 50);

    if (cleanQuery !== "") {
        return await searchMarketplaceAvatars(cleanQuery, 60);
    }

    const all = [];

    for (const keyword of avatarStarterKeywords) {
        const results = await searchMarketplaceAvatars(keyword, 20);

        for (const item of results) {
            all.push(item);
        }

        if (all.length >= 80) {
            break;
        }
    }

    return removeDuplicateAvatars(all).slice(0, 80);
}

`;

const startMarker = "// =========================================================\n// CONJUNTOS / BUNDLES ROBLOX";
const animationMarker = "const animationBundles = [";

const startIndex = code.indexOf(startMarker);
const animationIndex = code.indexOf(animationMarker);

if (startIndex !== -1 && animationIndex !== -1 && startIndex < animationIndex) {
    code = code.slice(0, startIndex) + avatarMarketplaceBlock + code.slice(animationIndex);
} else if (!code.includes("async function getCharacterBundles")) {
    if (animationIndex === -1) {
        console.log("No encontré const animationBundles para insertar el bloque.");
        process.exit(1);
    }

    code = code.slice(0, animationIndex) + avatarMarketplaceBlock + code.slice(animationIndex);
} else {
    console.log("Ya existe getCharacterBundles, pero no pude reemplazarlo automáticamente.");
    console.log("Revisa manualmente el bloque de Conjuntos.");
}

code = code.replaceAll("GRX_V2_8_CACHE_BUNDLES", "GRX_V2_9_AVATARS_MARKETPLACE");
code = code.replaceAll("GRX_V2_8_CACHE_MARKETPLACE", "GRX_V2_9_CACHE_MARKETPLACE");
code = code.replaceAll("GRX_V2_8_CACHE_ANIMATIONS", "GRX_V2_9_CACHE_ANIMATIONS");
code = code.replaceAll("GRX_V2_8_CACHE_ERROR", "GRX_V2_9_CACHE_ERROR");
code = code.replace('version: "2.8"', 'version: "2.9"');

fs.writeFileSync(filePath, code, "utf8");

console.log("✅ catalog.js actualizado a V2.9 con Avatares del Marketplace");
console.log(filePath);