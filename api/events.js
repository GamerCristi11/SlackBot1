import fetch from "node-fetch"; 

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const body = req.body;

  // ===Slack URL Verification===
  if (body?.type === "url_verification") {
    return res.status(200).send(body.challenge);
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

  // ===Slash Commands===
  if (body?.command) {
    const { command, user_name } = body;

    let message = "";

    switch (command) {
      case "/welcome":
        message = `Hey <@${user_name}>!`;
        break;
      case "/goodbye":
        message = `Bye <@${user_name}>!`;
        break;
      default:
        message = "Unknown command!";
    }

    // Respond immediately to Slack
    return res.status(200).send(message);
  }

  // Always respond 200 to Slack
  res.status(200).send("ok");
}