console.log("🔥 GRX CATALOG V2.9 AVATARES MARKETPLACE 🔥", __filename);

const express = require("express");
const axios = require("axios");

const router = express.Router();

const ROBLOX_CATALOG_URL = "https://catalog.roblox.com/v2/search/items/details";

const PAGE_SIZE_DEFAULT = 60;
const PAGE_SIZE_MIN = 20;
const PAGE_SIZE_MAX = 80;

const MAX_CACHE_ITEMS_PER_KEY = 5000;
const KEYWORDS_PER_EXPAND = 6;
const MAX_EXPANDS_PER_REQUEST = 6;

const catalogCache = new Map();

const categoryKeywords = {
    "Todos": [
        "y2k avatar accessory",
        "black hair ugc",
        "emo hair ugc",
        "messy hair ugc",
        "mask ugc",
        "cyber mask ugc",
        "oni mask ugc",
        "sword back ugc",
        "katana back ugc",
        "wings ugc",
        "chain necklace ugc",
        "glasses ugc",
        "sunglasses ugc",
        "hoodie roblox",
        "shirt roblox",
        "pants roblox",
        "streetwear ugc",
        "shoulder pet ugc",
        "tail waist ugc",
        "cape back ugc",
        "backpack ugc",
        "goth ugc",
        "anime ugc",
        "aesthetic ugc",
        "dark avatar ugc",
        "cute avatar ugc"
    ],

    "Cabeza": [
        "ugc hat",
        "ugc crown",
        "ugc horns",
        "ugc helmet",
        "ugc beanie",
        "ugc cap",
        "head accessory",
        "y2k hat",
        "goth hat",
        "anime hat",
        "cute hat",
        "black horns",
        "demon horns",
        "angel halo",
        "headphones ugc"
    ],

    "Cabello": [
        "black hair ugc",
        "messy hair ugc",
        "fluffy hair ugc",
        "emo hair ugc",
        "anime hair ugc",
        "y2k hair ugc",
        "brown hair ugc",
        "white hair ugc",
        "red hair ugc",
        "blue hair ugc",
        "pink hair ugc",
        "cute hair ugc",
        "spiky hair ugc",
        "goth hair ugc",
        "vkei hair ugc",
        "scene hair ugc",
        "short hair ugc",
        "long hair ugc",
        "mullet hair ugc",
        "wolfcut hair ugc"
    ],

    "Cara": [
        "face accessory ugc",
        "cute face accessory",
        "eyes ugc",
        "blush ugc",
        "mouth ugc",
        "face detail ugc",
        "tears face ugc",
        "star face ugc",
        "heart face ugc",
        "anime face accessory",
        "kawaii face accessory"
    ],

    "Lentes": [
        "glasses ugc",
        "sunglasses ugc",
        "shades ugc",
        "visor ugc",
        "goggles ugc",
        "y2k glasses ugc",
        "star glasses ugc",
        "heart glasses ugc",
        "black glasses ugc",
        "cyber glasses ugc"
    ],

    "Máscaras": [
        "mask ugc",
        "black mask ugc",
        "cyber mask ugc",
        "oni mask ugc",
        "gas mask ugc",
        "face mask ugc",
        "scary mask ugc",
        "demon mask ugc",
        "samurai mask ugc",
        "skull mask ugc",
        "cute mask ugc",
        "ninja mask ugc"
    ],

    "Cuello": [
        "chain necklace ugc",
        "necklace ugc",
        "collar ugc",
        "scarf ugc",
        "tie ugc",
        "neck accessory ugc",
        "cross chain ugc",
        "goth necklace ugc",
        "spiked collar ugc",
        "black scarf ugc",
        "silver chain ugc",
        "gold chain ugc"
    ],

    "Espalda": [
        "sword back ugc",
        "katana back ugc",
        "wings ugc",
        "cape ugc",
        "backpack ugc",
        "back accessory ugc",
        "blade back ugc",
        "angel wings ugc",
        "demon wings ugc",
        "black wings ugc",
        "anime sword ugc",
        "samurai sword ugc",
        "guitar back ugc",
        "cute backpack ugc"
    ],

    "Hombros": [
        "shoulder pet ugc",
        "shoulder plush ugc",
        "shoulder buddy ugc",
        "shoulder accessory ugc",
        "cute shoulder ugc",
        "shoulder cat ugc",
        "shoulder dog ugc",
        "shoulder dragon ugc",
        "shoulder monster ugc",
        "anime shoulder ugc"
    ],

    "Cintura": [
        "tail waist ugc",
        "belt ugc",
        "waist accessory ugc",
        "pouch ugc",
        "chain waist ugc",
        "cat tail ugc",
        "demon tail ugc",
        "fox tail ugc",
        "sword waist ugc",
        "waist bag ugc"
    ],

    "Camisa": [
        "shirt roblox",
        "black shirt roblox",
        "t shirt roblox",
        "t-shirt roblox",
        "tee roblox",
        "hoodie roblox",
        "black hoodie roblox",
        "jacket roblox",
        "sweater roblox",
        "vest roblox",
        "top roblox",
        "streetwear shirt roblox",
        "y2k shirt roblox",
        "emo shirt roblox",
        "goth shirt roblox",
        "anime shirt roblox",
        "oversized hoodie roblox",
        "shirt layered clothing",
        "hoodie layered clothing",
        "jacket layered clothing",
        "sweater layered clothing"
    ],

    "Pantalón": [
        "pants roblox",
        "black pants roblox",
        "jeans roblox",
        "cargos roblox",
        "shorts roblox",
        "trousers roblox",
        "joggers roblox",
        "skirt roblox",
        "streetwear pants roblox",
        "y2k pants roblox",
        "emo pants roblox",
        "goth pants roblox",
        "baggy pants roblox",
        "ripped jeans roblox",
        "pants layered clothing",
        "jeans layered clothing",
        "cargos layered clothing",
        "shorts layered clothing"
    ]
};

const modifiers = [
    "new",
    "trending",
    "popular",
    "aesthetic",
    "black",
    "white",
    "red",
    "blue",
    "pink",
    "purple",
    "cute",
    "cool",
    "emo",
    "y2k",
    "anime",
    "streetwear",
    "dark",
    "soft",
    "cyber",
    "classic",
    "modern",
    "cheap",
    "free",
    "limited",
    "premium",
    "best",
    "goth",
    "vkei",
    "kawaii",
    "scene"
];

const supportedCategories = [
    "Cabeza",
    "Cabello",
    "Cara",
    "Lentes",
    "Máscaras",
    "Cuello",
    "Espalda",
    "Hombros",
    "Cintura",
    "Camisa",
    "Pantalón"
];

const categoryAssetTypeIds = {
    "Cabeza": [8],
    "Cabello": [41],
    "Cara": [42],
    "Lentes": [42],
    "Máscaras": [42],
    "Cuello": [43, 45],
    "Espalda": [46],
    "Hombros": [44],
    "Cintura": [47],
    "Camisa": [2, 11, 64, 65, 67, 68],
    "Pantalón": [12, 66, 69, 72]
};


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
        thumbnail: `rbxthumb://type=BundleThumbnail&id=${id}&w=150&h=150`
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

const animationBundles = [
    { bundleId: 427999, name: "adidas Sports Animation Pack", price: 250, creator: "Roblox" },
    { bundleId: 2623795, name: "adidas Community Animation Pack", price: "Gratis", creator: "Roblox" },
    { bundleId: 82, name: "Robot Animation Pack", price: 300, creator: "Roblox" },
    { bundleId: 83, name: "Stylish Animation Pack", price: 300, creator: "Roblox" },
    { bundleId: 56, name: "Cartoony Animation Package", price: 300, creator: "Roblox" },
    { bundleId: 79, name: "Levitation Animation Pack", price: 1000, creator: "Roblox" },
    { bundleId: 80, name: "Zombie Animation Pack", price: 500, creator: "Roblox" },
    { bundleId: 81, name: "Superhero Animation Pack", price: 300, creator: "Roblox" },
    { bundleId: 75, name: "Ninja Animation Package", price: 750, creator: "Roblox" },
    { bundleId: 43, name: "Toy Animation Pack", price: 300, creator: "Roblox" },
    { bundleId: 667, name: "Oldschool Animation Pack", price: 300, creator: "Roblox" },
    { bundleId: 331856, name: "Bold Animation Pack by e.l.f.", price: 200, creator: "Roblox" },
    { bundleId: 1189398, name: "Wicked Popular Animation Pack", price: 300, creator: "Roblox" }
];

const assetTypeCategory = {
    8: "Cabeza",
    41: "Cabello",
    42: "Cara",
    43: "Cuello",
    44: "Hombros",
    45: "Cuello",
    46: "Espalda",
    47: "Cintura",

    64: "Camisa",
    65: "Camisa",
    67: "Camisa",
    68: "Camisa",

    66: "Pantalón",
    69: "Pantalón",
    72: "Pantalón",

    2: "Camisa",
    11: "Camisa",
    12: "Pantalón",

    17: "Cuerpo",
    27: "Cuerpo",
    28: "Cuerpo",
    29: "Cuerpo",
    30: "Cuerpo",
    31: "Cuerpo",

    70: "Cuerpo",
    71: "Cuerpo"
};

function sanitizeText(value, maxLength = 70) {
    let text = String(value || "");

    text = text
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (text.length > maxLength) {
        text = text.slice(0, maxLength).trim();
    }

    return text || "Sin nombre";
}

function sanitizeQuery(value, maxLength = 60) {
    let text = String(value || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (text.length > maxLength) {
        text = text.slice(0, maxLength).trim();
    }

    return text;
}

function getAssetTypeId(item) {
    if (typeof item.assetType === "number") return item.assetType;
    if (typeof item.assetTypeId === "number") return item.assetTypeId;
    if (item.assetType && typeof item.assetType.id === "number") return item.assetType.id;

    const parsed = Number(item.assetType);
    return Number.isNaN(parsed) ? null : parsed;
}

function getAssetTypeIdsForCategory(category) {
    if (!category || category === "Todos" || category === "Animaciones" || category === "Conjuntos") {
        return [];
    }

    return categoryAssetTypeIds[category] || [];
}

function itemMatchesRequestedCategory(item, requestedCategory) {
    if (!requestedCategory || requestedCategory === "Todos") {
        return true;
    }

    return item.category === requestedCategory;
}

function getCategoryFromName(name) {
    const text = String(name || "").toLowerCase();

    if (
        text.includes("[bundle]") ||
        text.includes(" bundle") ||
        text.includes("package") ||
        text.includes("body") ||
        text.includes("torso") ||
        text.includes("arm") ||
        text.includes("leg")
    ) {
        return "Cuerpo";
    }

    if (
        text.includes("glasses") ||
        text.includes("sunglasses") ||
        text.includes("shades") ||
        text.includes("goggles") ||
        text.includes("visor")
    ) {
        return "Lentes";
    }

    if (
        text.includes("mask") ||
        text.includes("gas mask") ||
        text.includes("oni") ||
        text.includes("cyber mask") ||
        text.includes("skull mask")
    ) {
        return "Máscaras";
    }

    if (
        text.includes("hair") ||
        text.includes("hairstyle") ||
        text.includes("bangs") ||
        text.includes("ponytail") ||
        text.includes("pigtail") ||
        text.includes("twin tail") ||
        text.includes("twintail") ||
        text.includes("bob") ||
        text.includes("mullet") ||
        text.includes("wolfcut")
    ) {
        return "Cabello";
    }

    if (
        text.includes("necklace") ||
        text.includes("chain") ||
        text.includes("collar") ||
        text.includes("scarf") ||
        text.includes("tie") ||
        text.includes("neck")
    ) {
        return "Cuello";
    }

    if (
        text.includes("back") ||
        text.includes("wings") ||
        text.includes("backpack") ||
        text.includes("cape") ||
        text.includes("sword") ||
        text.includes("katana") ||
        text.includes("blade") ||
        text.includes("guitar")
    ) {
        return "Espalda";
    }

    if (
        text.includes("shoulder") ||
        text.includes("plush") ||
        text.includes("buddy")
    ) {
        return "Hombros";
    }

    if (
        text.includes("waist") ||
        text.includes("tail") ||
        text.includes("belt") ||
        text.includes("pouch")
    ) {
        return "Cintura";
    }

    if (
        text.includes("shirt") ||
        text.includes("t-shirt") ||
        text.includes("t shirt") ||
        text.includes("tee") ||
        text.includes("hoodie") ||
        text.includes("jacket") ||
        text.includes("sweater") ||
        text.includes("vest") ||
        text.includes("top")
    ) {
        return "Camisa";
    }

    if (
        text.includes("pants") ||
        text.includes("jeans") ||
        text.includes("cargos") ||
        text.includes("shorts") ||
        text.includes("trousers") ||
        text.includes("joggers") ||
        text.includes("skirt") ||
        text.includes("stockings") ||
        text.includes("socks") ||
        text.includes("bottom")
    ) {
        return "Pantalón";
    }

    if (
        text.includes("face") ||
        text.includes("eyes") ||
        text.includes("blush") ||
        text.includes("mouth") ||
        text.includes("tears")
    ) {
        return "Cara";
    }

    if (
        text.includes("hat") ||
        text.includes("cap") ||
        text.includes("crown") ||
        text.includes("horns") ||
        text.includes("helmet") ||
        text.includes("beanie") ||
        text.includes("halo") ||
        text.includes("headphones")
    ) {
        return "Cabeza";
    }

    return "Todos";
}

function getCategoryFromItem(item) {
    const itemTypeText = String(item.itemType || item.itemTypeName || "").toLowerCase();

    if (itemTypeText.includes("bundle")) {
        return "Cuerpo";
    }

    const assetTypeId = getAssetTypeId(item);
    const nameCategory = getCategoryFromName(item.name);

    if (nameCategory === "Camisa" || nameCategory === "Pantalón") {
        return nameCategory;
    }

    if (
        assetTypeId === 8 ||
        assetTypeId === 41 ||
        assetTypeId === 43 ||
        assetTypeId === 44 ||
        assetTypeId === 46 ||
        assetTypeId === 47
    ) {
        return assetTypeCategory[assetTypeId] || "Todos";
    }

    if (
        assetTypeId === 2 ||
        assetTypeId === 11 ||
        assetTypeId === 64 ||
        assetTypeId === 65 ||
        assetTypeId === 67 ||
        assetTypeId === 68
    ) {
        return "Camisa";
    }

    if (
        assetTypeId === 12 ||
        assetTypeId === 66 ||
        assetTypeId === 69 ||
        assetTypeId === 72
    ) {
        return "Pantalón";
    }

    if (assetTypeId === 42) {
        if (nameCategory === "Lentes" || nameCategory === "Máscaras" || nameCategory === "Cara") {
            return nameCategory;
        }

        return "Cara";
    }

    if (assetTypeId === 45) {
        if (nameCategory !== "Todos") {
            return nameCategory;
        }

        return "Cuello";
    }

    if (assetTypeId && assetTypeCategory[assetTypeId]) {
        return assetTypeCategory[assetTypeId];
    }

    if (nameCategory !== "Todos") {
        return nameCategory;
    }

    return "Todos";
}

function getPrice(item) {
    if (item.price !== undefined && item.price !== null) return item.price;
    if (item.lowestPrice !== undefined && item.lowestPrice !== null) return item.lowestPrice;
    if (item.priceStatus !== undefined && item.priceStatus !== null) return item.priceStatus;

    return "Gratis";
}

function normalizeItem(item) {
    const id = item.id || item.assetId;
    const assetTypeId = getAssetTypeId(item);
    const category = getCategoryFromItem(item);

    return {
        id,
        name: sanitizeText(item.name || "Sin nombre", 58),
        price: getPrice(item),
        creator: sanitizeText(item.creatorName || item.creatorTargetName || "Desconocido", 40),
        category,
        type: assetTypeId || item.assetType || item.itemType || "Unknown",
        thumbnail: `rbxthumb://type=Asset&id=${id}&w=150&h=150`
    };
}

function isSupportedCatalogItem(item) {
    return supportedCategories.includes(item.category);
}

function removeDuplicates(items) {
    const used = new Set();
    const clean = [];

    for (const item of items) {
        if (!item.id) continue;

        if (!used.has(item.id)) {
            used.add(item.id);
            clean.push(item);
        }
    }

    return clean;
}

function shuffleItems(items) {
    const copy = [...items];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    return copy;
}

function removeDuplicateKeywords(keywords) {
    const used = new Set();
    const clean = [];

    for (const keyword of keywords) {
        const text = sanitizeText(keyword, 90).toLowerCase();

        if (!used.has(text)) {
            used.add(text);
            clean.push(text);
        }
    }

    return clean;
}

async function searchRobloxCatalog(keyword, limit = 30, category = "Todos") {
    try {
        const shouldUseAssetTypes =
            category !== "Camisa" &&
            category !== "Pantalón";

        const assetTypeIds = shouldUseAssetTypes
            ? getAssetTypeIdsForCategory(category)
            : [];

        const params = {
            keyword,
            limit,
            categoryFilter: "CommunityCreations",
            sortType: 3
        };

        if (assetTypeIds.length > 0) {
            params.AssetTypeIds = assetTypeIds.join(",");
            params.assetTypeIds = assetTypeIds.join(",");
        }

        const response = await axios.get(ROBLOX_CATALOG_URL, {
            params,
            timeout: 9000,
            headers: {
                "User-Agent": "GRX-Catalog/1.0"
            }
        });

        return response.data?.data || [];
    } catch (error) {
        console.log("Falló búsqueda:", keyword, error.message);
        return [];
    }
}

function getAllKeywordCombinations(query, category) {
    const keywords = [];

    if (query && query.trim() !== "") {
        const q = query.trim();

        keywords.push(q);
        keywords.push(`${q} ugc`);
        keywords.push(`${q} roblox`);

        const categoryBase = categoryKeywords[category] || [];

        for (const base of categoryBase) {
            keywords.push(`${q} ${base}`);
        }

        for (const modifier of modifiers) {
            keywords.push(`${q} ${modifier}`);
            keywords.push(`${modifier} ${q}`);
        }
    } else {
        const baseList = categoryKeywords[category] || categoryKeywords["Todos"];

        for (const base of baseList) {
            keywords.push(base);
        }

        for (const base of baseList) {
            for (const modifier of modifiers) {
                keywords.push(`${base} ${modifier}`);
                keywords.push(`${modifier} ${base}`);
            }
        }
    }

    return removeDuplicateKeywords(keywords);
}

function getCacheKey(query, category) {
    const cleanQuery = sanitizeQuery(query || "", 50).toLowerCase() || "sin_busqueda";
    return `${category}::${cleanQuery}`;
}

function getOrCreateCache(query, category, forceRefresh = false) {
    const key = getCacheKey(query, category);

    if (forceRefresh && catalogCache.has(key)) {
        catalogCache.delete(key);
    }

    if (!catalogCache.has(key)) {
        catalogCache.set(key, {
            key,
            query: query || "",
            category,
            items: [],
            usedIds: new Set(),
            keywords: getAllKeywordCombinations(query, category),
            keywordIndex: 0,
            isExpanding: false,
            exhausted: false,
            createdAt: Date.now(),
            updatedAt: 0
        });
    }

    return catalogCache.get(key);
}

function addItemsToCache(cache, rawItems) {
    const normalized = rawItems
        .filter(item => item && (item.id || item.assetId) && item.name)
        .map(item => normalizeItem(item))
        .filter(item => item.category !== "Cuerpo")
        .filter(item => isSupportedCatalogItem(item));

    let added = 0;

    for (const item of normalized) {
        if (cache.items.length >= MAX_CACHE_ITEMS_PER_KEY) break;
        if (cache.usedIds.has(item.id)) continue;

        if (!itemMatchesRequestedCategory(item, cache.category)) {
            continue;
        }

        cache.usedIds.add(item.id);
        cache.items.push(item);
        added++;
    }

    cache.updatedAt = Date.now();

    return added;
}

async function expandCache(cache, reason = "normal") {
    if (cache.isExpanding) return;
    if (cache.exhausted) return;

    if (cache.items.length >= MAX_CACHE_ITEMS_PER_KEY) {
        cache.exhausted = true;
        return;
    }

    cache.isExpanding = true;

    try {
        const selectedKeywords = [];

        for (let i = 0; i < KEYWORDS_PER_EXPAND; i++) {
            if (cache.keywordIndex >= cache.keywords.length) {
                cache.exhausted = true;
                break;
            }

            selectedKeywords.push(cache.keywords[cache.keywordIndex]);
            cache.keywordIndex++;
        }

        if (selectedKeywords.length === 0) {
            cache.exhausted = true;
            return;
        }

        console.log("Expandiendo cache:", cache.key, "Motivo:", reason);
        console.log("Keywords:", selectedKeywords.join(" | "));

        const searches = await Promise.allSettled(
            selectedKeywords.map(keyword => searchRobloxCatalog(keyword, 30, cache.category))
        );

        let rawItems = [];

        for (const result of searches) {
            if (result.status === "fulfilled") {
                rawItems.push(...result.value);
            }
        }

        const added = addItemsToCache(cache, rawItems);

        console.log("Cache:", cache.key, "Items totales:", cache.items.length, "Agregados:", added);
    } finally {
        cache.isExpanding = false;
    }
}

async function waitForCacheNotExpanding(cache, maxMs = 3500) {
    const start = Date.now();

    while (cache.isExpanding && Date.now() - start < maxMs) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function ensureCacheHasPage(cache, page, pageSize) {
    const needed = page * pageSize;
    let expands = 0;

    while (
        cache.items.length < needed &&
        !cache.exhausted &&
        expands < MAX_EXPANDS_PER_REQUEST
    ) {
        await expandCache(cache, "page-needed");
        await waitForCacheNotExpanding(cache, 3500);

        expands++;

        if (cache.items.length >= needed) {
            break;
        }

        if (cache.keywordIndex >= cache.keywords.length) {
            cache.exhausted = true;
            break;
        }
    }

    if (cache.items.length < needed && !cache.exhausted) {
        expandCache(cache, "background-more");
    }
}

function getPageFromCache(cache, page, pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return cache.items.slice(start, end);
}

function detectAnimationName(name) {
    const text = String(name || "").toLowerCase();

    if (text.includes("idle")) return "idle";
    if (text.includes("walk")) return "walk";
    if (text.includes("run")) return "run";
    if (text.includes("jump")) return "jump";
    if (text.includes("fall")) return "fall";
    if (text.includes("climb")) return "climb";
    if (text.includes("swim")) return "swim";

    return null;
}

async function getAnimationBundleData(bundle) {
    let animations = {};

    try {
        const response = await axios.get(
            `https://catalog.roblox.com/v1/bundles/${bundle.bundleId}/details`,
            { timeout: 8000 }
        );

        const bundleItems = response.data?.items || [];

        for (const bundleItem of bundleItems) {
            const key = detectAnimationName(bundleItem.name);

            if (key && bundleItem.id) {
                animations[key] = bundleItem.id;
            }
        }
    } catch (error) {
        console.log("No pude leer detalles de:", bundle.name);
    }

    return {
        id: bundle.bundleId,
        bundleId: bundle.bundleId,
        name: sanitizeText(bundle.name, 58),
        price: bundle.price,
        creator: sanitizeText(bundle.creator, 40),
        category: "Animaciones",
        type: "AnimationPack",
        animations,
        thumbnail: `rbxthumb://type=BundleThumbnail&id=${bundle.bundleId}&w=150&h=150`
    };
}

async function getAnimationPacks(query) {
    let packs = animationBundles;

    if (query && query.trim() !== "") {
        const q = query.toLowerCase();

        packs = packs.filter(pack =>
            pack.name.toLowerCase().includes(q) ||
            pack.creator.toLowerCase().includes(q)
        );
    }

    return await Promise.all(packs.map(getAnimationBundleData));
}

async function warmUpCache() {
    const warmCategories = [
        "Todos",
        "Cabello",
        "Máscaras",
        "Espalda",
        "Cuello",
        "Lentes",
        "Cabeza",
        "Camisa",
        "Pantalón"
    ];

    console.log("🔥 Precargando cache GRX en segundo plano...");

    for (const category of warmCategories) {
        const cache = getOrCreateCache("", category);
        expandCache(cache, "startup-warmup");

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

router.get("/", (req, res) => {
    res.json({
        name: "GRX Catalog Route",
        version: "2.9",
        status: "Online",
        route: "/catalog/search"
    });
});

router.get("/search", async (req, res) => {
    try {
        const query = sanitizeQuery(req.query.q || "", 60);
        const category = req.query.category || "Todos";
        const page = Math.max(1, Number(req.query.page) || 1);
        const forceRefresh = req.query.refresh === "1" || req.query.refresh === "true";

        const pageSize = Math.min(
            Math.max(Number(req.query.pageSize) || PAGE_SIZE_DEFAULT, PAGE_SIZE_MIN),
            PAGE_SIZE_MAX
        );

        if (category === "Conjuntos") {
            const bundleResults = await getCharacterBundles(query);

            return res.json({
                success: true,
                debugVersion: "GRX_V2_9_AVATARS_MARKETPLACE",
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

        if (category === "Animaciones") {
            const animationResults = await getAnimationPacks(query);

            return res.json({
                success: true,
                debugVersion: "GRX_V2_9_CACHE_ANIMATIONS",
                search: query,
                category,
                page,
                pageSize,
                count: animationResults.length,
                totalCached: animationResults.length,
                hasMore: false,
                results: animationResults
            });
        }

        const safeCategory =
            category === "Todos" || supportedCategories.includes(category)
                ? category
                : "Todos";

        const cache = getOrCreateCache(query, safeCategory, forceRefresh);

        await ensureCacheHasPage(cache, page, pageSize);

        let results = getPageFromCache(cache, page, pageSize);

        if (results.length === 0 && page > 1 && cache.items.length > 0) {
            results = shuffleItems(cache.items).slice(0, pageSize);
        }

        const hasMore =
            !cache.exhausted ||
            cache.items.length > page * pageSize;

        res.json({
            success: true,
            debugVersion: "GRX_V2_9_CACHE_MARKETPLACE",
            search: query,
            category: safeCategory,
            page,
            pageSize,
            count: results.length,
            totalCached: cache.items.length,
            maxCache: MAX_CACHE_ITEMS_PER_KEY,
            cacheKey: cache.key,
            cacheExhausted: cache.exhausted,
            hasMore,
            results
        });

    } catch (error) {
        console.error("Error buscando en GRX Cache Catalog:", error.message);

        res.json({
            success: false,
            debugVersion: "GRX_V2_9_CACHE_ERROR",
            error: "No se pudo conectar al catálogo de Roblox",
            results: [],
            hasMore: true
        });
    }
});

warmUpCache();

module.exports = router;