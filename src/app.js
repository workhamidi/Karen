// const { google } = require('googleapis');
// const { GoogleAuth } = require('google-auth-library');
// const path = require('path');

// async function appendDataToSheet() {
//     const auth = new GoogleAuth({
//         keyFile: path.join(__dirname, 'credentials.json'),
//         scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     });

//     const authClient = await auth.getClient();

//     const sheets = google.sheets({ version: 'v4', auth: authClient });

//     const filePath = path.join(__dirname, 'sheetId.txt');

//     const spreadsheetId = fs.readFileSync(filePath, 'utf8').trim();

//     const values = [
//         ['John Doe', 'john.doe@example.com', '1234567890'],
//     ];

//     // Request to append data
//     const resource = {
//         values,
//     };

//     try {
//         const result = await sheets.spreadsheets.values.append({
//             spreadsheetId,
//             range: 'Sheet1!A1', // Replace 'Sheet1' with your sheet name
//             valueInputOption: 'RAW',
//             resource,
//         });

//         console.log(`${result.data.updates.updatedCells} cells appended.`);
//     } catch (err) {
//         console.error('Error appending data:', err);
//     }
// }

// appendDataToSheet();







const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

async function getAudioUrls(word) {
  const url = `https://fastdic.com/word/${word}`;
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const { window } = new JSDOM(html);
    const doc = window.document;
    
    const spansWithAudioIcon = doc.querySelectorAll('span.sicon-audio-am');
    const audioUrls = [];

    spansWithAudioIcon.forEach(iconSpan => {
      const audioSpan = iconSpan.closest('span.audio.js-audio[data-type="us"]') || 
                       iconSpan.querySelector('span.audio.js-audio[data-type="us"]');
      
      if (audioSpan) {
        const dataSrc = audioSpan.getAttribute('data-src');
        if (dataSrc) {
          const audioUrl = `https://cdn.fastdic.com/c-en-audios/us/mp3/${dataSrc}.mp3`;
          audioUrls.push(audioUrl);
        }
      }
    });

    return audioUrls.length > 0 ? audioUrls : ['No audio URL found'];
  } catch (error) {
    console.error('Error in request:', error);
    return ['Error fetching data'];
  }
}

getAudioUrls('serene').then(urls => {
  console.log(urls);
});
