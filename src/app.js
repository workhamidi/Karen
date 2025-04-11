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
