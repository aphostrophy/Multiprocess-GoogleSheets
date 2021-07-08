const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');
const lockFile = require('lockfile');

const { google } = require('googleapis');
const keys = require('./keys.json');

const filePath = path.resolve(__dirname, 'shared.json');
const lockPath = path.resolve(__dirname, 'shared.json.lock');

/* Child Processes */
const childProcess0 = fork('./typer.js');
const childProcess1 = fork('./typer.js');
const childProcess2 = fork('./typer.js');
const childProcess3 = fork('./typer.js');

// Sent is relative to p0 dan active=true menandakan process belum resolve
const pool = [{ active: false, sent: false }, { active: false, sent: false }, { active: false, sent: false }, { active: false, sent: false }];

childProcess0.on("message", (message) => {
  console.log(message.status, "Message received successfully from bot 0");
  setTimeout(() => {
    sendProcess0();
  }, 1000 * (Math.floor(Math.random() * 6) + 1));
});

childProcess1.on("message", (message) => {
  console.log(message.status, "Message received successfully from bot 1");
  setTimeout(() => {
    sendProcess1();
  }, 1000 * (Math.floor(Math.random() * 6) + 1));
});

childProcess2.on("message", (message) => {
  console.log(message.status, "Message received successfully from bot 2");
  setTimeout(() => {
    sendProcess2();
  }, 1000 * (Math.floor(Math.random() * 6) + 1));
});

childProcess3.on("message", (message) => {
  console.log(message.status, "Message received successfully from bot 3");
  setTimeout(() => {
    sendProcess3();
  }, 1000 * (Math.floor(Math.random() * 6) + 1));
});

const sendProcess0 = () => {
  childProcess0.send("Bot 0");
}

const sendProcess1 = () => {
  childProcess1.send("Bot 1");
}

const sendProcess2 = () => {
  childProcess2.send("Bot 2");
}

const sendProcess3 = () => {
  childProcess3.send("Bot 3");
}

const main = async () => {
  const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);

  client.authorize(async (err, token) => {
    if (err) {
      console.log("Error during client authorization: ", err);
      return;
    } else {
      console.log("Connected!");

      const gsapi = google.sheets({ version: 'v4', auth: client });

      const opt = {
        spreadsheetId: '1VBbZop6BgUrR-zXVrYMttsgcKQZg6-95HQbUMleL7ac',
        range: 'A2:B7'
      }
      let { data: res } = await gsapi.spreadsheets.values.get(opt);
      let dataArray = res.values;
      let gsData = dataArray.map((data) => ({
        id: data[0],
        name: data[1],
      }))
      
      fs.writeFileSync(filePath, JSON.stringify({
        botFile: {
          bot0: false,
          bot1: false,
          bot2: false,
          bot3: false,
        },
        data: gsData
      }), 'utf8');

      gsrun(client, dataArray);
    }
  });
}

const gsrun = async()=>{
  try {
    sendProcess0();
    sendProcess1();
    sendProcess2();
    sendProcess3();
  } catch (err) {
    console.log(err);
  }
}

main();
