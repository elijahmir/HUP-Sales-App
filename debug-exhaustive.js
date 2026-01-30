const fs = require("fs");
const path = require("path");

// Load env vars
try {
  const envPath = path.resolve(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
} catch (e) {
  console.error("Error loading .env.local", e);
}

const apiKey = process.env.VAULTRE_API_KEY;
const bearerToken = process.env.VAULTRE_BEARER_TOKEN;
const baseUrl = process.env.VAULTRE_BASE_URL;

const headers = {
  "Content-Type": "application/json",
  "X-Api-Key": apiKey,
  Authorization: `Bearer ${bearerToken}`,
};

async function searchSuburbs(term) {
  console.log(`Searching suburb: ${term}`);
  const url = `${baseUrl}/suburbs?name=${encodeURIComponent(term)}&pagesize=10`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  return (data.items || []).map((item) => ({
    id: item.id,
    name: item.name,
    postcode: item.postcode,
    state: item.state?.abbreviation || "",
  }));
}

async function run() {
  const addressComponents = {
    unit: "",
    street_number: "2",
    street_name: "Moonbeam Place",
    suburb: "Ulverstone",
  };

  console.log("Target:", addressComponents);

  // 1. Get Suburb
  const suburbs = await searchSuburbs(addressComponents.suburb);
  const targetSuburb = suburbs.find(
    (s) => s.name.toLowerCase() === addressComponents.suburb.toLowerCase(),
  );

  if (!targetSuburb) {
    console.log("Suburb NOT FOUND in search results:", suburbs);
    return;
  }
  console.log("Found Suburb:", targetSuburb);

  // 2. Fetch Properties
  let page = 1;
  const pageSize = 100;
  let hasMore = true;
  let totalScanned = 0;

  const targetUnit = (addressComponents.unit || "").toLowerCase().trim();
  const targetStreetNo = addressComponents.street_number.toLowerCase().trim();
  const targetStreetName = addressComponents.street_name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

  console.log(
    `Normalized Target: Unit='${targetUnit}', No='${targetStreetNo}', Name='${targetStreetName}'`,
  );

  while (hasMore) {
    console.log(`Fetching Page ${page}...`);
    const url = `${baseUrl}/properties/residential/sale?suburbs=${targetSuburb.id}&page=${page}&pagesize=${pageSize}&sort=modified&sortOrder=desc`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.log("API Error:", res.status);
      break;
    }
    const data = await res.json();
    const items = data.items || [];

    console.log(`Page ${page}: Got ${items.length} items.`);
    totalScanned += items.length;

    if (items.length === 0) break;

    for (const p of items) {
      if (!p.address) continue;

      const pStreetRaw = p.address.street || "";
      const pStreet = pStreetRaw
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
      const pNumber = (p.address.streetNumber || "")
        .toString()
        .toLowerCase()
        .trim();
      const pUnit = (p.address.unitNumber || "")
        .toString()
        .toLowerCase()
        .trim();

      // Check partial matches to debug
      if (pStreet.includes("moonbeam")) {
        console.log(`\nPotential Match Found:`);
        console.log(`ID: ${p.id}`);
        console.log(
          `Raw Address: ${p.address.unitNumber || ""} ${p.address.streetNumber} ${p.address.street}`,
        );
        console.log(
          `Normalized: Unit='${pUnit}', No='${pNumber}', Name='${pStreet}'`,
        );

        const streetMatch = pStreet === targetStreetName;
        const numberMatch = pNumber === targetStreetNo;
        const unitMatch = pUnit === targetUnit;

        console.log(
          `Match Result: Street=${streetMatch}, Number=${numberMatch}, Unit=${unitMatch}`,
        );
        if (streetMatch && numberMatch && unitMatch) {
          console.log("!!! EXACT MATCH CONFIRMED !!!");
          return;
        }
      }
    }

    if (page >= data.totalPages || page > 50) hasMore = false;
    page++;
  }
  console.log(`Finished. Scanned ${totalScanned} properties.`);
}

run();
