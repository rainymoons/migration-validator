import dns from "dns/promises";

export async function domainExists(domain: string, cache: Map<string, Promise<boolean>>): Promise<boolean> {
  const normalizedDomain = domain.toLowerCase();
  const cached = cache.get(normalizedDomain);
  if (cached) {
    return cached;
  }

  const lookupPromise = (async () => {
    try {
      const mxRecords = await dns.resolveMx(normalizedDomain);
      if (mxRecords.length > 0) {
        return true;
      }
    } catch {
      // ignore and try A/AAAA lookup next
    }

    try {
      const aRecords = await dns.resolve4(normalizedDomain);
      if (aRecords.length > 0) {
        return true;
      }
    } catch {
      // ignore and try AAAA lookup next
    }

    try {
      const aaaaRecords = await dns.resolve6(normalizedDomain);
      return aaaaRecords.length > 0;
    } catch {
      return false;
    }
  })();

  cache.set(normalizedDomain, lookupPromise);
  return lookupPromise;
}
