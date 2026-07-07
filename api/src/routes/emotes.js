const express = require("express");
const axios = require("axios");

const router = express.Router();

const ROBLOX_CATALOG_URL = "https://catalog.roblox.com/v2/search/items/details";

// AssetTypeIds 61 = EmoteAnimation
const EMOTE_ASSET_TYPE_ID = 61;

// Cache simple para evitar demasiadas peticiones a Roblox
const emoteCache = new Map();

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutos
const MAX_CACHE_ITEMS = 240;

function normalizeSearch(value) {
    const text = String(value || "").trim();
    return text.length > 0 ? text.slice(0, 60) : "emote";
}

function getThumbnail(assetId) {
    return `https://www.roblox.com/asset-thumbnail/image?assetId=${assetId}&width=420&height=420&format=png`;
}

function normalizePrice(item) {
    if (item.priceStatus && typeof item.priceStatus === "string") {
        return item.priceStatus;
    }

    if (typeof item.price === "number") {
        return item.price;
    }

    if (typeof item.lowestPrice === "number") {
        return item.lowestPrice;
    }

    return "Gratis";
}

function normalizeItem(item) {
    const id = Number(item.id || item.assetId);

    if (!id) return null;

    return {
        id,
        name: item.name || "Emote",
        category: "Emotes",
        type: "EmoteAnimation",
        price: normalizePrice(item),
        thumbnail: getThumbnail(id),
        creatorName: item.creatorName || "",
        creatorType: item.creatorType || ""
    };
}

async function fetchRobloxEmotePage(search, cursor, limit) {
    const params = {
        AssetTypeIds: EMOTE_ASSET_TYPE_ID,
        Keyword: search,
        Limit: Math.max(10, Math.min(Number(limit) || 30, 30)),
        SortType: 3,
        SortAggregation: 5
    };

    if (cursor) {
        params.Cursor = cursor;
    }

    const response = await axios.get(ROBLOX_CATALOG_URL, {
        params,
        timeout: 12000,
        headers: {
            "User-Agent": "GRX-Catalog/1.0"
        }
    });

    const body = response.data || {};
    const rawItems = Array.isArray(body.data) ? body.data : [];

    return {
        items: rawItems.map(normalizeItem).filter(Boolean),
        nextCursor: body.nextPageCursor || null
    };
}

async function ensureEmoteCache(search, neededCount) {
    const key = search.toLowerCase();
    const now = Date.now();

    let cache = emoteCache.get(key);

    if (!cache || now - cache.createdAt > CACHE_TTL_MS) {
        cache = {
            createdAt: now,
            items: [],
            nextCursor: null,
            exhausted: false,
            searchedOnce: false
        };

        emoteCache.set(key, cache);
    }

    while (
        cache.items.length < neededCount &&
        cache.items.length < MAX_CACHE_ITEMS &&
        !cache.exhausted
    ) {
        try {
            const page = await fetchRobloxEmotePage(
                search,
                cache.searchedOnce ? cache.nextCursor : null,
                30
            );

            cache.searchedOnce = true;

            const seen = new Set(cache.items.map((item) => item.id));

            for (const item of page.items) {
                if (!seen.has(item.id)) {
                    cache.items.push(item);
                    seen.add(item.id);
                }
            }

            cache.nextCursor = page.nextCursor;

            if (!page.nextCursor || page.items.length === 0) {
                cache.exhausted = true;
            }
        } catch (error) {
            console.warn("Falló búsqueda de emotes:", search, error.message);
            break;
        }
    }

    return cache;
}

router.get("/", (req, res) => {
    res.json({
        name: "GRX Emotes API",
        status: "Online 🕺",
        route: "/emotes/search"
    });
});

router.get("/search", async (req, res) => {
    const search = normalizeSearch(req.query.q || req.query.search);
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(10, Math.min(Number(req.query.pageSize) || 30, 30));

    const neededCount = page * pageSize;

    const cache = await ensureEmoteCache(search, neededCount);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const results = cache.items.slice(start, end);

    res.json({
        success: true,
        debugVersion: "GRX_EMOTES_CATALOG_V1",
        search,
        page,
        pageSize,
        count: results.length,
        totalCached: cache.items.length,
        hasMore: !cache.exhausted || cache.items.length > end,
        results
    });
});

module.exports = router;