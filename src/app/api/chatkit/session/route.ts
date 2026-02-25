import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");
      return NextResponse.json(
        { error: "Internal Server Error: Missing API Key" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: "wf_690093e47e5c819085296b39562f39cd06388b3756f719d9" },
        user: "user_dashboard_v1", // Using a static user for initial version, can be upgraded to unique user ID later
        chatkit_configuration: {
          file_upload: {
            enabled: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI ChatKit API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to create ChatKit session", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating ChatKit session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
