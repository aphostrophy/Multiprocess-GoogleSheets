const { google } = require('googleapis');
const keys = require('./keys.json');

process.on("message", (message) => {
  if (message.exit) {
    console.log("Exit");
    writeGSMessage(message.dataArray,true)
  } else {
    console.log("No exit");
    writeGSMessage(message.dataArray,false);
  }
})

const writeGSMessage = async (dataArray,close) => {
  const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);

  client.authorize(async (err, token) => {
    if (err) {
      console.log("Error during client authorization: ",err);
      return;
    } else {
      const gsapi = google.sheets({ version: 'v4', auth: client });
      dataArray.push([parseInt(dataArray[dataArray.length - 1][0]) + 1, 'Marcello']);

      const updateOpt = {
        spreadsheetId: '1VBbZop6BgUrR-zXVrYMttsgcKQZg6-95HQbUMleL7ac',
        range: 'A2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: dataArray }
      }
      res = await gsapi.spreadsheets.values.update(updateOpt);

      process.send({ "status": "ok", "data": dataArray });
      if (close) {
        console.log("closing");
        process.exit();
      }
    }
  })
}