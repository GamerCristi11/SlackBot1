import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, 
  },
};


function parseBody(bodyString) {
  return Object.fromEntries(new URLSearchParams(bodyString));
}

export default async function handler(req, res) {
  let body;

  // Check content type
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    // Parse raw body for slash commands
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();
    body = parseBody(rawBody);
  } else {

    body = req.body;
  }

  // ===Slack URL Verification===
  if (body?.type === "url_verification") {
    return res.status(200).send(body.challenge);
  }

  // ===Slash Commands===
  if (body?.command) {
    const { command, user_name } = body;
    let message = "";

    switch (command) {
      case "/welcome":
        message = `Hey <@${user_name}>!`;
        break;
      default:
        message = "Unknown command!";
    }

    return res.status(200).send(message);
  }

  // ===Member Joined Channel Event===
  const event = body?.event;
  if (event?.type === "member_joined_channel") {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: event.channel,
        text: `Hello <@${event.user}> :60fps_parrot:!\nWelcome to YappaVille!`,
      }),
    });
  }

  // Always respond 200 to Slack
  res.status(200).send("ok");
}