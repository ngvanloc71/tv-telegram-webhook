export default async function handler(request) {
  // Allow only POST requests
  if (request.method !== "POST") {
    return new Response("TradingView Telegram Webhook is running.", {
      status: 200,
    });
  }

  try {
    // Read the incoming data
    const contentType = request.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      data = {
        message: await request.text(),
      };
    }

    // Telegram credentials are stored in Vercel Environment Variables
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "BOT_TOKEN or CHAT_ID is not configured.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert TradingView data to a message
    let message;

    if (typeof data === "string") {
      message = data;
    } else if (data.message) {
      message = data.message;
    } else {
      message = JSON.stringify(data, null, 2);
    }

    // Send message to Telegram
    const telegramUrl =
      `https://api.telegram.org/bot${botToken}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramResult.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Telegram API error",
          telegram: telegramResult,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Telegram message sent successfully.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
