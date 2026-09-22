export default {
  fetch(request) {
    return new Response("TradingView Telegram Webhook is running.", {
      status: 200,
    });
  },
};
