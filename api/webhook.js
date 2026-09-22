export default {
  async fetch(request) {
    // GET = kiểm tra webhook
    if (request.method === "GET") {
      return new Response("TradingView Telegram Webhook is running.", {
        status: 200,
      });
    }

    // Chỉ nhận POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
      });
    }

    try {
      const data = await request.json();

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
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const message = data.message || "Test message from Vercel";

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        }
      );

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
            headers: {
              "Content-Type": "application/json",
            },
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
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
