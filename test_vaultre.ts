export async function testVaultRE() {
    console.log("Starting test...");
    const apiKey = process.env.VAULTRE_API_KEY;
    const bearerToken = process.env.VAULTRE_BEARER_TOKEN;
    const baseUrl = process.env.VAULTRE_BASE_URL;

    console.log("Using API Key:", apiKey ? "Loaded" : "Missing");

    const res = await fetch(`${baseUrl}/search/properties/address?term=street&pagesize=5`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey!,
            Authorization: `Bearer ${bearerToken!}`,
        }
    });

    if (!res.ok) {
        console.error("HTTP Error", res.status);
        console.error(await res.text());
        return;
    }

    const data = await res.json();
    console.log(JSON.stringify(data.items?.[0] || data, null, 2));
}

testVaultRE().catch(console.error);
