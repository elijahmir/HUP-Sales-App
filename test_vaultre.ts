import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export async function testVaultRE() {
    console.log("Starting test...");
    const apiKey = process.env.VAULTRE_API_KEY;
    const bearerToken = process.env.VAULTRE_BEARER_TOKEN;
    const baseUrl = process.env.VAULTRE_BASE_URL;

    console.log("Using API Key:", apiKey ? "Loaded" : "Missing");

    const endpointsToTest = [
        `${baseUrl}/search/properties?status=listing,conditional&pagesize=5`,
        `${baseUrl}/properties/sale?status=listing,conditional&pagesize=5`,
    ];

    for (const url of endpointsToTest) {
        console.log(`\nTesting URL: ${url}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey!,
                'Authorization': `Bearer ${bearerToken!}`
            }
        });

        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Items returned: ${data.items ? data.items.length : 'N/A'}`);
            if (data.items && data.items.length > 0) {
                console.log("Sample item classes:", data.items.map((i: any) => i.class?.name || 'Unknown'));
            }
        } else {
            const text = await response.text();
            console.log(`Error: ${text.substring(0, 100)}`);
        }
    }

}

testVaultRE().catch(console.error);
