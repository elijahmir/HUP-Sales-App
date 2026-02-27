{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "Image",
      "url": "https://tse4.mm.bing.net/th/id/OIP.jFKDzhWECzhnxtjsPTNCnAHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
      "size": "Medium",
      "horizontalAlignment": "Center",
      "altText": "Harcourts Logo"
    },
    {
      "type": "TextBlock",
      "text": "🎉 New Property Offer Received!",
      "weight": "Bolder",
      "size": "ExtraLarge",
      "color": "Good",
      "horizontalAlignment": "Center",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "✅ Offer Submitted | 📧 Notification sent to Agent | 🏠 Ready for Review",
      "wrap": true,
      "spacing": "Small",
      "horizontalAlignment": "Center"
    },
    {
      "type": "Container",
      "style": "emphasis",
      "items": [
        {
          "type": "FactSet",
          "facts": [
            { "title": "Property:", "value": "@{triggerBody()?['propertyAddress']}" },
            { "title": "Offer Price:", "value": "**@{triggerBody()?['offerPrice']}**" },
            { "title": "Purchaser:", "value": "@{triggerBody()?['purchaserName']}" },
            { "title": "Contact:", "value": "@{triggerBody()?['purchaserEmail']} | @{triggerBody()?['purchaserPhone']}" },
            { "title": "Deposit:", "value": "@{triggerBody()?['depositAmount']}" },
            { "title": "Settlement:", "value": "@{triggerBody()?['settlementPeriod']}" },
            { "title": "Finance Req:", "value": "@{triggerBody()?['financeRequired']}" },
            { "title": "Building/Pest:", "value": "@{triggerBody()?['buildingInspection']}" }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "📂 View in Dashboard",
      "url": "@{triggerBody()?['dashboardUrl']}",
      "style": "positive"
    }
  ]
}