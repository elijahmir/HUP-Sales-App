/**
 * Quick VaultRE API test script
 * Run with: npx tsx scripts/test-vaultre.ts
 */

async function testVaultREAPI() {
  const apiKey = "mxnKSCMDtl8zChowPH21a6siiGqxbTJN5zm8u6jb";
  const bearerToken = "zgmtiytthjanqdpaofjhmudaalwsfmtpiqvmxrlg";
  const baseUrl = "https://ap-southeast-2.api.vaultre.com.au/api/v1.3";

  const headers = {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
    Authorization: `Bearer ${bearerToken}`,
  };

  console.log("🔌 Testing VaultRE API connection...\n");

  // Test 1: Get properties (check connection)
  try {
    console.log("Test 1: Fetching residential sale properties...");
    const response = await fetch(
      `${baseUrl}/properties/residential/sale?pagesize=3`,
      {
        method: "GET",
        headers,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.log(`❌ Connection failed: ${response.status} - ${text}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Connection successful!`);
    console.log(`   Total properties in VaultRE: ${data.totalItems}`);
    console.log(`   First 3 properties:`);
    data.items.forEach((item: any, i: number) => {
      console.log(
        `   ${i + 1}. ${item.displayAddress || item.address?.displayAddress || "No address"} (ID: ${item.id})`,
      );
    });
  } catch (error) {
    console.log(`❌ Error: ${error}`);
    return;
  }

  console.log("\n");

  // Test 3: Test Suburb Search
  console.log("Test 3: Testing Suburb Search...");
  try {
    const suburbTerm = "Campbelltown"; // Example suburb
    console.log(`Searching for suburb: ${suburbTerm}`);

    // Endpoint: GET /suburbs?name=...
    const url = new URL(`${baseUrl}/suburbs`);
    url.searchParams.set("name", suburbTerm);
    url.searchParams.set("pagesize", "5");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        Authorization: `Bearer ${bearerToken}`,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ Suburb search successful. Found ${data.items?.length || 0} items.`,
      );
      if (data.items && data.items.length > 0) {
        console.log(
          "   First suburb result:",
          JSON.stringify(data.items[0], null, 2),
        );
      } else {
        console.log("   No suburbs found for the given term.");
      }
    } else {
      console.log(
        `❌ Suburb search failed: ${response.status} ${response.statusText}`,
      );
      const text = await response.text();
      console.log("   Response:", text);
    }
  } catch (error) {
    console.log("❌ Suburb search error:", error);
  }

  console.log("\n");

  // Test 2: Search for properties by address
  try {
    console.log("Test 2: Searching for 'Devonport'...");
    const response = await fetch(
      `${baseUrl}/search/properties/address?term=Devonport&pagesize=5`,
      {
        method: "GET",
        headers,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.log(`❌ Search failed: ${response.status} - ${text}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Search successful!`);
    console.log(`   Found ${data.totalItems} properties matching 'Devonport'`);
    if (data.items.length > 0) {
      console.log(`   Sample result:`);
      const first = data.items[0];
      console.log(`   - Display: ${first.displayAddress}`);
      console.log(`   - ID: ${first.id}`);
      if (first.address) {
        console.log(
          `   - Street: ${first.address.streetNumber} ${first.address.street}`,
        );
        console.log(`   - Suburb: ${first.address.suburb?.name}`);
      }
      if (first.saleLife) {
        console.log(`   - Status: ${first.saleLife.status}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
  }

  console.log("\n✅ VaultRE API tests completed!");
}

testVaultREAPI();
