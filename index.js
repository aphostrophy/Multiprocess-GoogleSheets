const { fork } = require('child_process')

const { google } = require('googleapis');
const keys = require('./keys.json');

const ipc = require('')

const childProcess0 = fork('./typer.js');
const childProcess1 = fork('./typer.js');
const childProcess2 = fork('./typer.js');
const childProcess3 = fork('./typer.js');

// Sent is relative to p0 dan active=true menandakan process belum resolve
const pool = [{ active: false, sent: false }, { active: false, sent: false }, { active: false, sent: false }, { active: false, sent: false }];

childProcess0.on("message", (message) => {
  console.log(message.status, "Message received successfully");
  console.log(message.data);
});

const sendProcess0 = (dataArray,exit) => {
  childProcess0.send({ "dataArray": dataArray, "exit": exit });
}

const sendProcess1 = (dataArray,exit) => {
  childProcess1.send({ "dataArray": dataArray, "exit": exit });
}

const sendProcess2 = (dataArray,exit) => {
  childProcess2.send({ "dataArray": dataArray, "exit": exit });
}

const sendProcess3 = (dataArray,exit) => {
  childProcess3.send({ "dataArray": dataArray, "exit": exit });
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
        range: 'A2:B5'
      }
      let { data: res } = await gsapi.spreadsheets.values.get(opt);
      let dataArray = res.values;

      gsrun(client, dataArray);
    }
  });
}

const gsrun = async(client,dataArray)=>{
  try {
    sendProcess0(dataArray, false);
    sendProcess0(dataArray, false);
    sendProcess0(dataArray, false);
    sendProcess0(dataArray, true);
  } catch (err) {
    console.log(err);
  }
}

main();
