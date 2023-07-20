
const pageScraper = require('./pageScraper')
const fs = require('fs');

async function scrapeAll(browserInstance){
    let browser;
    try {
        browser = await browserInstance;
        let scrapedData = {};
        scrapedData['Travel'] = await pageScraper.scraper(browser, 'Travel');
        scrapedData['HistoricalFiction'] = await pageScraper.scraper(browser, 'Historical Fiction');
		scrapedData['Mystery'] = await pageScraper.scraper(browser, 'Mystery');
		await browser.close();
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The data has been scraped and saved successfully! View it at './data.json'");
		});
        console.log(scrapedData);
    } catch(err) {
        console.log('Could not reolve the browser insatnce = ', err)
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)