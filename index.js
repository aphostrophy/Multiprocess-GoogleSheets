const { google } = require('googleapis');
const keys = require('./keys.json');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);

client.authorize((err,token) => {
  if (err) {
    console.log("Error during client authorization: ",err);
    return;
  } else {
    console.log("Connected!");
    gsrun(client);
  }
})


const gsrun = async(client)=>{
  try {
    const gsapi = google.sheets({ version: 'v4', auth: client });

    const opt = {
      spreadsheetId: '1VBbZop6BgUrR-zXVrYMttsgcKQZg6-95HQbUMleL7ac',
      range: 'A2:B5'
    }
  
    let {data:res} = await gsapi.spreadsheets.values.get(opt);

    let dataArray = res.values;
    dataArray.push(['6', 'Marcello']);

    console.log(dataArray);

    const updateOpt = {
      spreadsheetId: '1VBbZop6BgUrR-zXVrYMttsgcKQZg6-95HQbUMleL7ac',
      range: 'A2',
      valueInputOption: 'USER_ENTERED',
      resource: { values : dataArray}
    }

    res = await gsapi.spreadsheets.values.update(updateOpt);
    console.log(res);

  } catch (err) {
    console.log(err);
  }
}

