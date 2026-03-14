export default async function handler(req, res) {

  const body = req.body;

  // ===Slack Verification===
  if (body?.type === "url_verification") {
    return res.status(200).send(body.challenge);
  }

  const event = body?.event;

  if (event?.type === "member_joined_channel") {

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({
        channel: event.channel,
        text: `Hello <@${event.user}> :60fps_parrot:!\nWelcome to YappaVille!`
      })
    });

  }

  // ===Slash Commands===
  if (body?.command) {
    const { command, user_name } = body;

    let message = "";

    switch(command) {
      case "/welcome":
        message = `Hey <@${user_name}>!`;
        break;
      case "/goodbye":
        message = `Bye <@${user_name}>!`;
        break;
        break;
      default:
        message = "Unknown command!";
    }

    return res.send(message);
  }


  res.status(200).send("ok");
}