{
"nodes": [
{
"parameters": {
"url": "https://ap-southeast-2.api.vaultre.com.au/api/v1.3/properties",
"authentication": "genericCredentialType",
"genericAuthType": "httpHeaderAuth",
"sendQuery": true,
"queryParameters": {
"parameters": [
{
"name": "suburbs",
"value": "={{ $('Match Suburb ID').item.json.suburb_id }}"
},
{
"name": "pagesize",
"value": "100"
},
{
"name": "sort",
"value": "modified"
},
{
"name": "sortOrder",
"value": "desc"
}
]
},
"sendHeaders": true,
"headerParameters": {
"parameters": [
{
"name": "X-Api-Key",
"value": "mxnKSCMDtl8zChowPH21a6siiGqxbTJN5zm8u6jb"
},
{
"name": "Accept",
"value": "application/json"
}
]
},
"options": {}
},
"type": "n8n-nodes-base.httpRequest",
"typeVersion": 4.2,
"position": [
1120,
0
],
"id": "07792a23-8043-4dcc-9669-07bf55ae76e0",
"name": "Get Properties",
"credentials": {
"httpHeaderAuth": {
"id": "Pc6ND4tAVak1lyyt",
"name": "VaultRE Auth"
}
}
},
{
"parameters": {
"jsCode": "// --- 1. Extract & Parse Target Address ---\nconst rawStreet = [\n $('Edit Fields').first().json.address_street_number,\n $('Edit Fields').first().json.address_street_name\n].filter(Boolean).join(' ') || ''; \nconst rawSuburb = $('Edit Fields').first().json.address_suburb || '';\nconst targetSuburb = rawSuburb.toLowerCase().trim();\n\n// Regex to capture the full number part (e.g. \"1/60\" or \"24\") and the street name\nconst streetMatch = rawStreet.match(/^([\\d/]+)\\s*(.*)$/);\n\nlet targetUnit = '';\nlet targetStreetNo = '';\nlet targetStreetName = rawStreet;\n\nif (streetMatch) {\n const fullNumber = streetMatch[1].trim(); // \"1/60\" or \"24\"\n targetStreetName = streetMatch[2].toLowerCase().replace(/[^a-z0-9]/g, '').trim();\n\n if (fullNumber.includes('/')) {\n // Split \"1/60\" -> Unit 1, Number 60\n const parts = fullNumber.split('/');\n targetUnit = parts[0];\n targetStreetNo = parts[1];\n } else {\n // Just \"24\" -> Unit Empty, Number 24\n targetStreetNo = fullNumber;\n }\n}\n\n// --- 2. Collect all properties from all pages ---\nlet allProperties = [];\nfor (const page of $input.all()) {\n  const pageData = page.json;\n  if (Array.isArray(pageData.items)) {\n    allProperties.push(...pageData.items);\n  }\n}\n\n// --- 3. Search for Exact Match ---\nlet found = null;\n\nfor (const p of allProperties) {\n  if (!p.address || !p.address.street || !p.address.suburb) continue;\n\n  const vaultSuburb = (p.address.suburb.name || '').toLowerCase().trim();\n  const vaultStreetName = (p.address.street || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();\n  \n  // Vault numbers can be numbers or strings, ensure we compare strings\n  const vaultStreetNo = (p.address.streetNumber || '').toString().trim();\n  const vaultUnit = (p.address.unitNumber || '').toString().trim();\n\n  // CHECK 1: Suburb\n  if (vaultSuburb !== targetSuburb) continue;\n\n  // CHECK 2: Street Name\n  if (vaultStreetName !== targetStreetName) continue;\n\n  // CHECK 3: Unit & Street Number\n  // We explicitly compare Unit vs Unit AND Number vs Number\n  if (vaultStreetNo === targetStreetNo && vaultUnit === targetUnit) {\n    found = p;\n    break;\n  }\n}\n\n// --- 4. Output ---\nif (found) {\n  return [{ json: found }];\n} else {\n  return [{\n    json: {\n      error: 'Match Failed',\n      debug_target: { unit: targetUnit, number: targetStreetNo, street: targetStreetName, suburb: targetSuburb },\n      debug_total_scanned: allProperties.length\n    }\n  }];\n}"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1792,
        0
      ],
      "id": "f8064ea7-871c-4584-b64e-d72ca5dc9bb9",
      "name": "IsExist"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "261d35ad-d6a5-4674-8d96-169cd89c6643",
              "leftValue": "={{ $json.id }}",
              "rightValue": "",
              "operator": {
                "type": "number",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        2016,
        0
      ],
      "id": "5bdb0df4-f16d-4b27-b9e8-5f7b43f7a3d8",
      "name": "If"
    },
    {
      "parameters": {
        "url": "https://ap-southeast-2.api.vaultre.com.au/api/v1.3/suggest/suburb",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "state",
              "value": "={{ $('Edit Fields').item.json.address_state }}"
            },
            {
              "name": "term",
              "value": "={{ $('Edit Fields').item.json.address_suburb }}"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-Api-Key",
              "value": "mxnKSCMDtl8zChowPH21a6siiGqxbTJN5zm8u6jb"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.3,
      "position": [
        448,
        0
      ],
      "id": "ff4c0de7-3a0b-4baa-8ee3-a8e45ff6c550",
      "name": "Get Suburbs",
      "credentials": {
        "httpHeaderAuth": {
          "id": "Pc6ND4tAVak1lyyt",
          "name": "VaultRE Auth"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// SAFE MODE: HANDLE MISSING SUBURBS GRACEFULLY\n// 1. Get the target suburb name\nconst targetSuburb = $('Edit Fields').first().json.address_suburb.toLowerCase().trim();\n\n// 2. Get the list of suburbs from the VaultRE API response\nconst responseData = $input.first().json;\nlet suburbsList = [];\n\n// CHECK: Is the data wrapped in an \"items\" array?\nif (responseData.items && Array.isArray(responseData.items)) {\n    suburbsList = responseData.items;\n} else {\n    suburbsList = $input.all().map(i => i.json);\n}\n\n// 3. Find the ID where the name matches your text\nconst found = suburbsList.find(s => (s.name && s.name.toLowerCase() === targetSuburb));\n\n// 4. PREPARE OUTPUT (Do not throw error)\nif (found) {\n    // SCENARIO A: Found\n    return {\n        json: {\n            suburb_found: true,\n            suburb_id: found.id,\n            suburb_name_vault: found.name,\n            ...$('Edit Fields').first().json \n }\n };\n} else {\n // SCENARIO B: Not Found (Fail Gracefully)\n return {\n json: {\n suburb_found: false,\n suburb_id: null,\n error_details: `Suburb '${targetSuburb}' not found in state list.`,\n ...$('Edit Fields').first().json \n }\n };\n}"
},
"type": "n8n-nodes-base.code",
"typeVersion": 2,
"position": [
672,
0
],
"id": "6af41346-5750-4e59-906a-fa6a1960a0a6",
"name": "Match Suburb ID"
},
{
"parameters": {
"conditions": {
"options": {
"caseSensitive": true,
"leftValue": "",
"typeValidation": "strict",
"version": 3
},
"conditions": [
{
"id": "4bbf19d5-22fa-4189-9362-6da69ff41dcd",
"leftValue": "={{ $json.suburb_found }}",
"rightValue": true,
"operator": {
"type": "boolean",
"operation": "equals"
}
}
],
"combinator": "and"
},
"options": {}
},
"type": "n8n-nodes-base.if",
"typeVersion": 2.3,
"position": [
896,
0
],
"id": "f7c7c5ef-a6b3-4cfe-9431-cb2267dabc7f",
"name": "If1"
},
{
"parameters": {
"url": "https://ap-southeast-2.api.vaultre.com.au/api/v1.3/properties",
"authentication": "genericCredentialType",
"genericAuthType": "httpHeaderAuth",
"sendQuery": true,
"queryParameters": {
"parameters": [
{
"name": "suburbs",
"value": "={{ $('Match Suburb ID').item.json.suburb_id }}"
},
{
"name": "page",
"value": "={{ $json.page }}"
},
{
"name": "pagesize",
"value": "100"
}
]
},
"sendHeaders": true,
"headerParameters": {
"parameters": [
{
"name": "X-Api-Key",
"value": "mxnKSCMDtl8zChowPH21a6siiGqxbTJN5zm8u6jb"
},
{
"name": "Accept",
"value": "application/json"
}
]
},
"options": {}
},
"type": "n8n-nodes-base.httpRequest",
"typeVersion": 4.2,
"position": [
1568,
0
],
"id": "ac50603c-cb74-48d5-a563-3a597af84f39",
"name": "Get Properties Per Page",
"credentials": {
"httpHeaderAuth": {
"id": "Pc6ND4tAVak1lyyt",
"name": "VaultRE Auth"
}
}
},
{
"parameters": {
"jsCode": "// 1. Get the total number of pages from the previous node\n// (Default to 1 if the API doesn't return a count)\nconst totalPages = $input.first().json.totalPages || 1;\n\nconst pageList = [];\n\n// 2. Create a separate item for every page\n// Example: If totalPages is 3, this creates [{page: 1}, {page: 2}, {page: 3}]\nfor (let i = 1; i <= totalPages; i++) {\n pageList.push({\n json: {\n page: i\n }\n });\n}\n\n// 3. Output the list\n// n8n will now run the NEXT node once for every item in this list.\nreturn pageList;"
},
"type": "n8n-nodes-base.code",
"typeVersion": 2,
"position": [
1344,
0
],
"id": "dafc8a56-4564-46dd-a77f-a8c03423671d",
"name": "Pages"
}
],
"connections": {
"Get Properties": {
"main": [
[
{
"node": "Pages",
"type": "main",
"index": 0
}
]
]
},
"IsExist": {
"main": [
[
{
"node": "If",
"type": "main",
"index": 0
}
]
]
},
"If": {
"main": [
[],
[]
]
},
"Get Suburbs": {
"main": [
[
{
"node": "Match Suburb ID",
"type": "main",
"index": 0
}
]
]
},
"Match Suburb ID": {
"main": [
[
{
"node": "If1",
"type": "main",
"index": 0
}
]
]
},
"If1": {
"main": [
[
{
"node": "Get Properties",
"type": "main",
"index": 0
}
]
]
},
"Get Properties Per Page": {
"main": [
[
{
"node": "IsExist",
"type": "main",
"index": 0
}
]
]
},
"Pages": {
"main": [
[
{
"node": "Get Properties Per Page",
"type": "main",
"index": 0
}
]
]
}
},
"pinData": {},
"meta": {
"instanceId": "c9ddb60f06ad1ccfc6ce8013404853cf6efa7735a26b0e619a9a336dd607d044"
}
}
