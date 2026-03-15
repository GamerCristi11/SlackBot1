import fetch from "node-fetch";
// === IDK really===
export const config = {
  api: {
    bodyParser: false, 
  },
};

// === Main thingy===
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

  // ===Slash commands===
  if (body?.command) {
    const { command, user_name, ts } = body;
    let message = "";

    switch (command) {
      case "/help":
        message = "Commands:\n- /hello: Say hello\n- /hct {username}: Get your Hackatime stats";
        break;
      case "/hello":
        message = `Hi <@${user_name}> :60fps_parrot:!`;
        break;
      case "/hct":
        const username = body.text.trim();
        const data1 = await fetch(`https://hackatime.hackclub.com/api/v1/users/${username}/stats`);
        const info = await data1.json()

        const totaltime = info.data.human_readable_total;
        const streak = info.data.streak;

        message = `<@${user_name}> has spent ${totaltime} coding and has a ${streak}-day streak!`;

    }

    return res.status(200).json({response_type: "in_channel", text: message, thread_ts: ts});
  }

  // ===Join message thing===
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
        text: `Hello <@${user_name}> :60fps_parrot:!\nWelcome to YappaVille!`,
      }),
    });
  }

  // Always respond 200 to Slack
  res.status(200).send("ok");
}