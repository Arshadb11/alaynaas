import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
for (const [w,h,l] of [[1440,900,''],[390,800,''],[390,800,'/ar']]) { const pg = await b.newPage(); await pg.setViewport({ width: w, height: h });
await pg.goto(`http://localhost:3001${l}/story?x=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3500)); console.log(w,l,await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth)); await pg.screenshot({ path: `top_${w}${l.replace('/','_')}.png`, fullPage: w<500 ? false : false }); await pg.close(); }
await b.close();
