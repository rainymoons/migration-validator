"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainExists = domainExists;
const promises_1 = __importDefault(require("dns/promises"));
async function domainExists(domain, cache) {
    const normalizedDomain = domain.toLowerCase();
    const cached = cache.get(normalizedDomain);
    if (cached) {
        return cached;
    }
    const lookupPromise = (async () => {
        try {
            const mxRecords = await promises_1.default.resolveMx(normalizedDomain);
            if (mxRecords.length > 0) {
                return true;
            }
        }
        catch {
            // ignore and try A/AAAA lookup next
        }
        try {
            const aRecords = await promises_1.default.resolve4(normalizedDomain);
            if (aRecords.length > 0) {
                return true;
            }
        }
        catch {
            // ignore and try AAAA lookup next
        }
        try {
            const aaaaRecords = await promises_1.default.resolve6(normalizedDomain);
            return aaaaRecords.length > 0;
        }
        catch {
            return false;
        }
    })();
    cache.set(normalizedDomain, lookupPromise);
    return lookupPromise;
}
