const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');

const { slack_bot_token: botToken = '' } = process.env;

const rtm = new RtmClient(botToken);

let channel;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  channel = rtmStartData.channels.find((c) => {
    return c.is_member && c.name === 'general';
  });
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  if (message.user === 'U7QB75MFD') {
    rtm.sendMessage('Fuck Tony ^^', message.channel);
  }
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  if (message.text === '幹' || message.text === 'e04') {
    rtm.sendMessage(`<@${message.user}> 我幹你娘`, message.channel);
  }
});

rtm.start();
