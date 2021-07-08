const { google } = require('googleapis');
const keys = require('./keys.json');
const lockFile = require('lockfile');
const fs = require('fs');
const path = require('path');

// Fungsi utilitas untuk memaksa bot menunggu
const delay = ms => new Promise(res => setTimeout(res, ms)); 

const filePath = path.resolve(__dirname, 'shared.json');
const lockPath = path.resolve(__dirname, 'shared.json.lock');

const lockOptions = {
  wait: 1000,
  stale: 5000,
  retries: 100,
  retryWait: 1000
};

process.on("message", (message) => {
  writeGSMessage(message);
})

const writeGSMessage = async (message) => {
  const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);

  client.authorize(async (err, token) => {
    if (err) {
      console.log("Error during client authorization: ",err);
      return;
    } else {
      const gsapi = google.sheets({ version: 'v4', auth: client });

      let botList = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      botList = botList.botFile;

      if (message === "Bot 0") {
        while (botList.bot1 !== true || botList.bot3 !== true) {
          delay(1000);
          if (!fs.existsSync(lockPath)) {
            try {
              botList = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              botList = botList.botFile;
            } catch (err) {
              console.error(err);
            }
          }
        }
      }

      while (fs.existsSync(lockPath)) {
        delay(1000);
      }

      lockFile.lock(lockPath, lockOptions, async (error) => {

        if (error) { console.error(error); }
          console.log(message + " is trying to write");

        // // Code ini seharusnya ke run kalo bot sudah pasti menulis
        let oldJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
        // Save new data to the existing JSON file
        fs.writeFileSync(filePath, JSON.stringify(oldJson), 'utf8');

        oldJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let dataArray = oldJson.data.map((data) => {
          return [data.id, data.name];
        })
        let botFile = oldJson.botFile;
  
        dataArray.push([parseInt(dataArray[dataArray.length - 1][0]) + 1, Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),message]);
  
        const updateOpt = {
          spreadsheetId: '1VBbZop6BgUrR-zXVrYMttsgcKQZg6-95HQbUMleL7ac',
          range: 'A2',
          valueInputOption: 'USER_ENTERED',
          resource: { values: dataArray }
        }
        res = await gsapi.spreadsheets.values.update(updateOpt);

        let gsData = dataArray.map((data) => ({
          id: data[0],
          name: data[1],
        }))

        oldJson.data = gsData;

        oldJson.botFile = botFile;

        if (message === "Bot 0") {
          botFile.bot1 = false;
          botFile.bot2 = false;
          botFile.bot3 = false;
        } else if (message === "Bot 1") {
          botFile.bot1 = true;
        } else if (message === "Bot 2") {
          botFile.bot1 = false;
          botFile.bot3 = false;
        } else if (message === "Bot 3") {
          botFile.bot3 = true;
        }

        fs.writeFileSync(filePath, JSON.stringify(oldJson), 'utf8');
    
        lockFile.unlock(lockPath, (error) => {
    
          if (error) { console.error(error); }
          // console.log(message + " finished with shared file");
          else {
            process.send({ "status": "ok", "data": dataArray });
          }
        });
      });
    }
  })
}