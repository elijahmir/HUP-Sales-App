# Landlord Expense Approval — n8n HTTP Request Body (Maestro Trigger)

Copy and paste this JSON body into the n8n HTTP Request node that triggers DocuSign Maestro.

**URL:** `https://api.docusign.com/v1/accounts/a07219b4-d1d8-4f3b-a151-a602b7a8db79/workflows/{WORKFLOW_ID}/actions/trigger`
**Method:** POST
**Auth:** OAuth2 (DocuSign)
**Body type:** JSON

```
={
  "instance_name": "Expense Approval for {{$json.body.property_address_full || 'Not Applicable'}}",
  "trigger_inputs": {
    "startDate": "{{ $now.toISO() }}",
    "doc_routing": "{{$json.body.doc_routing || 'rates_only'}}",
    "service_combo": "{{$json.body.service_combo || 'C'}}",
    "property_street": "{{$json.body.property_street || 'Not Applicable'}}",
    "property_suburb": "{{$json.body.property_suburb || 'Not Applicable'}}",
    "property_state": "{{$json.body.property_state || 'Not Applicable'}}",
    "property_postcode": "{{$json.body.property_postcode || 'Not Applicable'}}",
    "property_address_full": "{{$json.body.property_address_full || 'Not Applicable'}}",
    "property_pid": "{{$json.body.property_pid || 'Not Applicable'}}",
    "council_rates": "{{$json.body.council_rates || 'Not Applicable'}}",
    "land_tax": "{{$json.body.land_tax || 'Not Applicable'}}",
    "taswater": "{{$json.body.taswater || 'Not Applicable'}}",
    "has_rates": "{{$json.body.has_rates || ''}}",
    "has_land": "{{$json.body.has_land || ''}}",
    "has_second_authorisation": "{{$json.body.has_second_authorisation || ''}}",
    "has_change_ownership": "{{$json.body.has_change_ownership || ''}}",
    "trade_waste_information_only": "{{$json.body.trade_waste_information_only || ''}}",
    "authorisation_account_holder_1": "{{$json.body.authorisation_account_holder_1 || ''}}",
    "authorisation_other_1": "{{$json.body.authorisation_other_1 || ''}}",
    "authorisation_other_details_1": "{{$json.body.authorisation_other_details_1 || ''}}",
    "authorisation_account_holder_2": "{{$json.body.authorisation_account_holder_2 || ''}}",
    "authorisation_other_2": "{{$json.body.authorisation_other_2 || ''}}",
    "authorisation_other_details_2": "{{$json.body.authorisation_other_details_2 || ''}}",
    "ownership_structure": "{{$json.body.ownership_structure || 'Not Applicable'}}",
    "ownership_type": "{{$json.body.ownership_type || 'Not Applicable'}}",
    "ownership_subtype": "{{$json.body.ownership_subtype || 'Not Applicable'}}",
    "owner_count": "{{$json.body.owner_count || '1'}}",
    "trust_name": "{{$json.body.trust_name || 'Not Applicable'}}",
    "company_name": "{{$json.body.company_name || 'Not Applicable'}}",
    "company_acn": "{{$json.body.company_acn || 'Not Applicable'}}",
    "company_name_acn": "{{$json.body.company_name_acn || 'Not Applicable'}}",
    "all_owners_names": "{{$json.body.all_owners_names || 'Not Applicable'}}",
    "all_owners_names_trust": "{{$json.body.all_owners_names_trust || 'Not Applicable'}}",
    "all_owners_first_names": "{{$json.body.all_owners_first_names || 'Not Applicable'}}",
    "all_owners_email": "{{$json.body.all_owners_email || 'Not Applicable'}}",
    "owner_1_full_name": "{{$json.body.owner_1.full_name || 'Not Applicable'}}",
    "owner_1_full_name_id": "{{$json.body.owner_1.full_name_id || 'Not Applicable'}}",
    "owner_1_full_name_trustee": "{{$json.body.owner_1.full_name_trustee || 'Not Applicable'}}",
    "owner_1_full_name_val": "{{$json.body.owner_1.full_name_val || 'Not Applicable'}}",
    "owner_1_email": "{{$json.body.owner_1.email || 'Not Applicable'}}",
    "owner_1_email_val": "{{$json.body.owner_1.email_val || 'Not Applicable'}}",
    "owner_1_mobile": "{{$json.body.owner_1.mobile || 'Not Applicable'}}",
    "owner_1_mobile_countrycode": "{{$json.body.owner_1.mobile_countrycode || ''}}",
    "owner_1_mobile_number": "{{$json.body.owner_1.mobile_number || ''}}",
    "owner_1_phone": "{{$json.body.owner_1.phone || 'Not Applicable'}}",
    "owner_1_street": "{{$json.body.owner_1.street || 'Not Applicable'}}",
    "owner_1_suburb": "{{$json.body.owner_1.suburb || 'Not Applicable'}}",
    "owner_1_state": "{{$json.body.owner_1.state || 'NA'}}",
    "owner_1_postcode": "{{$json.body.owner_1.postcode || 'NA'}}",
    "owner_1_address_full": "{{$json.body.owner_1.address_full || 'Not Applicable'}}",
    "owner_2_full_name": "{{$json.body.owner_2.full_name || 'Not Applicable'}}",
    "owner_2_full_name_id": "{{$json.body.owner_2.full_name_id || 'Not Applicable'}}",
    "owner_2_full_name_trustee": "{{$json.body.owner_2.full_name_trustee || 'Not Applicable'}}",
    "owner_2_full_name_val": "{{$json.body.owner_2.full_name_val || 'Not Applicable'}}",
    "owner_2_email": "{{$json.body.owner_2.email || 'Not Applicable'}}",
    "owner_2_email_val": "{{$json.body.owner_2.email_val || 'Not Applicable'}}",
    "owner_2_mobile": "{{$json.body.owner_2.mobile || 'Not Applicable'}}",
    "owner_2_mobile_countrycode": "{{$json.body.owner_2.mobile_countrycode || ''}}",
    "owner_2_mobile_number": "{{$json.body.owner_2.mobile_number || ''}}",
    "owner_2_phone": "{{$json.body.owner_2.phone || 'Not Applicable'}}",
    "owner_2_street": "{{$json.body.owner_2.street || 'Not Applicable'}}",
    "owner_2_suburb": "{{$json.body.owner_2.suburb || 'Not Applicable'}}",
    "owner_2_state": "{{$json.body.owner_2.state || 'NA'}}",
    "owner_2_postcode": "{{$json.body.owner_2.postcode || 'NA'}}",
    "owner_2_address_full": "{{$json.body.owner_2.address_full || 'Not Applicable'}}",
    "owner_3_full_name": "{{$json.body.owner_3.full_name || 'Not Applicable'}}",
    "owner_3_full_name_id": "{{$json.body.owner_3.full_name_id || 'Not Applicable'}}",
    "owner_3_full_name_trustee": "{{$json.body.owner_3.full_name_trustee || 'Not Applicable'}}",
    "owner_3_full_name_val": "{{$json.body.owner_3.full_name_val || 'Not Applicable'}}",
    "owner_3_email": "{{$json.body.owner_3.email || 'Not Applicable'}}",
    "owner_3_email_val": "{{$json.body.owner_3.email_val || 'Not Applicable'}}",
    "owner_3_mobile": "{{$json.body.owner_3.mobile || 'Not Applicable'}}",
    "owner_3_mobile_countrycode": "{{$json.body.owner_3.mobile_countrycode || ''}}",
    "owner_3_mobile_number": "{{$json.body.owner_3.mobile_number || ''}}",
    "owner_3_phone": "{{$json.body.owner_3.phone || 'Not Applicable'}}",
    "owner_3_street": "{{$json.body.owner_3.street || 'Not Applicable'}}",
    "owner_3_suburb": "{{$json.body.owner_3.suburb || 'Not Applicable'}}",
    "owner_3_state": "{{$json.body.owner_3.state || 'NA'}}",
    "owner_3_postcode": "{{$json.body.owner_3.postcode || 'NA'}}",
    "owner_3_address_full": "{{$json.body.owner_3.address_full || 'Not Applicable'}}",
    "owner_4_full_name": "{{$json.body.owner_4.full_name || 'Not Applicable'}}",
    "owner_4_full_name_id": "{{$json.body.owner_4.full_name_id || 'Not Applicable'}}",
    "owner_4_full_name_trustee": "{{$json.body.owner_4.full_name_trustee || 'Not Applicable'}}",
    "owner_4_full_name_val": "{{$json.body.owner_4.full_name_val || 'Not Applicable'}}",
    "owner_4_email": "{{$json.body.owner_4.email || 'Not Applicable'}}",
    "owner_4_email_val": "{{$json.body.owner_4.email_val || 'Not Applicable'}}",
    "owner_4_mobile": "{{$json.body.owner_4.mobile || 'Not Applicable'}}",
    "owner_4_mobile_countrycode": "{{$json.body.owner_4.mobile_countrycode || ''}}",
    "owner_4_mobile_number": "{{$json.body.owner_4.mobile_number || ''}}",
    "owner_4_phone": "{{$json.body.owner_4.phone || 'Not Applicable'}}",
    "owner_4_street": "{{$json.body.owner_4.street || 'Not Applicable'}}",
    "owner_4_suburb": "{{$json.body.owner_4.suburb || 'Not Applicable'}}",
    "owner_4_state": "{{$json.body.owner_4.state || 'NA'}}",
    "owner_4_postcode": "{{$json.body.owner_4.postcode || 'NA'}}",
    "owner_4_address_full": "{{$json.body.owner_4.address_full || 'Not Applicable'}}",
    "asic_register_file_name": "{{$json.body.asic_register_file_name || ''}}",
    "asic_register_file_base64": "{{$json.body.asic_register_file_base64 || ''}}",
    "trust_schedule_file_name": "{{$json.body.trust_schedule_file_name || ''}}",
    "trust_schedule_file_base64": "{{$json.body.trust_schedule_file_base64 || ''}}",
    "taswater_account_no": "{{$json.body.taswater_account_no || 'Not Applicable'}}",
    "taswater_account_name": "{{$json.body.taswater_account_name || 'Not Applicable'}}",
    "taswater_postal_street": "{{$json.body.taswater_postal_street || 'Not Applicable'}}",
    "taswater_postal_suburb": "{{$json.body.taswater_postal_suburb || 'Not Applicable'}}",
    "taswater_postal_state": "{{$json.body.taswater_postal_state || 'Not Applicable'}}",
    "taswater_postal_postcode": "{{$json.body.taswater_postal_postcode || 'Not Applicable'}}",
    "taswater_cancel_bpay": "{{$json.body.taswater_cancel_bpay || ''}}",
    "taswater_cancel_direct_debit": "{{$json.body.taswater_cancel_direct_debit || ''}}",
    "taswater_change_ownership": "{{$json.body.taswater_change_ownership || ''}}",
    "taswater_settlement_date": "{{$json.body.taswater_settlement_date || 'Not Applicable'}}",
    "owner_1_mobile_no": {
      "countryCode": "{{$json.body.owner_1.mobile_countrycode || ''}}",
      "number": "{{$json.body.owner_1.mobile_number || ''}}"
    },
    "owner_2_mobile_no": {
      "countryCode": "{{$json.body.owner_2.mobile_countrycode || ''}}",
      "number": "{{$json.body.owner_2.mobile_number || ''}}"
    },
    "owner_3_mobile_no": {
      "countryCode": "{{$json.body.owner_3.mobile_countrycode || ''}}",
      "number": "{{$json.body.owner_3.mobile_number || ''}}"
    },
    "owner_4_mobile_no": {
      "countryCode": "{{$json.body.owner_4.mobile_countrycode || ''}}",
      "number": "{{$json.body.owner_4.mobile_number || ''}}"
    }
  }
}
```

## Notes

- **`instance_name`** and **`startDate`** are permanent Maestro fields (same as SAA)
- All other `trigger_inputs` map to the Maestro workflow variables you defined
- **Mobile number pattern**: Each owner has 3 mobile fields:
  - `owner_X_mobile` — combined string like `+61 412345678` (used for text display fields)
  - `owner_X_mobile_countrycode` — area code only like `61` (used for text display fields)
  - `owner_X_mobile_number` — number only like `412345678` (used for text display fields)
  - `owner_X_mobile_no` — **object** with `countryCode` + `number` (used by DocuSign SMS delivery)
- The webhook body (`$json.body`) sends owners as **nested objects** (`owner_1.mobile_countrycode`), which get **flattened** into Maestro trigger_inputs (`owner_1_mobile_countrycode`)
