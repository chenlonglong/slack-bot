const {
  IncomingWebhook,
  RtmClient,
  CLIENT_EVENTS,
  RTM_EVENTS,
} = require('@slack/client');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const server = new Koa();
const adapter = new FileSync('db.json');
const db = low(adapter);

const {
  slack_webhook_url: webhookUrl = '',
  slack_bot_token: botToken = '',
} = process.env;

const webhook = new IncomingWebhook(webhookUrl);
const rtm = new RtmClient(botToken);

let channel;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  channel = rtmStartData.channels.find((c) => {
    return c.is_member && c.name === 'general';
  });
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  const { text = '', user = '', channel = '' } = message;
  if (db.get(`user.${user}.name`).value() === 'boss') {
    rtm.sendMessage('Fuck Tony ^^', channel);
  }
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  console.log(message);
  const { text = '', user = '', channel = '' } = message;
  if (text === '幹') {
    rtm.sendMessage(`<@${user}> 我幹你娘`, channel);
  } else if (text === 'e04') {
    rtm.sendMessage(`<@${user}> 我 e04 你`, channel);
  }
});

server.use(bodyParser());
server.use(async (ctx) => {
  console.log(ctx.request.body);
  const { command = '', text = '' } = ctx.request.body;
  if (command === '/catch') {
    const [ mentioned, point = '1'] = text.trim().split(' ');
    const user = mentioned.match(/<@(.{9})/)[1];
    if (db.has(`user.${user}`).value()) {
      const newPenalty = Math.max(0, db.get(`user.${user}.penalty`).value() + parseInt(point));
      db.set(`user.${user}.penalty`, newPenalty).write();
      ctx.body = {
        "response_type": "in_channel",
        "text": `<@${user}> 你有 ${db.get(`user.${user}.penalty`).value()} 點唷 雷包`,
      };
    } else {
      ctx.body = {
        "response_type": "in_channel",
        "text": '沒有這個人唷 雷包',
      };
    }
  } else if (command === '/list') {
    const user = db.get('user').value();
    const users = Object.keys(user).map((k) => Object.assign(user[k], { id: k }));
    const list = users.reduce((t, u) => `${t}<@${u.id}>: ${u.penalty}\n`, '');
    ctx.body = {
      "response_type": "in_channel",
      "text": list,
    };
  } else if (command === '/shutup') {
    const [ mentioned ] = text.trim().split(' ');
    const user = mentioned.match(/<@(.{9})/)[1];
    ctx.body = {
      "response_type": "in_channel",
      "text": `<@${user}>
░░░░░░░░░░░░░░░░▄░█▄░█▄▄▄░░
█▀▀█░░█▀▀█░█▀▀█▄█▄█▄░█▄▄▄█░
█▀▀█░░█▀▀█░█░░█░░▄█▄▄▄░░░░░
█▀▀▀░░▀▀▀█░█░░█░▀▄▄▄█▄▄▄░░░
█░▄▄▄▄█▄░█░▀▀▀▀░░█▄▄█▄▄█░░░
█░░░▄▀█░░█░░░░░░░█▄▄█▄▄█░░░
█░▄▀░▄█░▄█░░░░░░▄▀░░░░▄█░░░
      `,
    };
  }
  ctx.status = 200;
});

rtm.start();
server.listen(5000);
