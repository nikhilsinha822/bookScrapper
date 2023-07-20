const scraperObject = {
    url : 'http://books.toscrape.com',
    async scraper(browser, category){ 
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}`);
        await page.goto(this.url);

        let selectedCategory = await page.$$eval('.side_categories > ul > li > ul > li > a', (links, _category)=>{
            links = links.map(a => a.textContent.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "") === _category ? a : null);
			let link = links.filter(tx => tx !== null)[0];
			return link.href;
        }, category);
        await page.goto(selectedCategory);

        let scrapedData = [];
        async function scrapeCurrentPage(){
            await page.waitForSelector('.page_inner');
            let urls = await page.$$eval('section ol > li', links => {
                links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
                links = links.map(el => el.querySelector('h3 > a').href);
                return links
            });
            console.log(urls);
            let pagePromise = (link) => new Promise(async(resolve, reject)=> {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                dataObj['bookTitle'] = await newPage.$eval('.product_main > h1', text => text.textContent);
                dataObj['bookPrice'] = await newPage.$eval('.price_color', text => text.textContent);
                dataObj['noAvailable'] = await newPage.$eval('.instock.availability', text => {
                    // Strip new line and tab spaces
                    text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                    // Get the number of stock available
                    let regexp = /^.*\((.*)\).*$/i;
                    let stockAvailable = regexp.exec(text)[1].split(' ')[0];
                    return stockAvailable;
                })
                dataObj['imageUrl'] = await newPage.$eval('#product_gallery img', img => img.src);
                dataObj['bookDescription'] = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent);
                dataObj['upc'] = await newPage.$eval('.table.table-striped > tbody > tr > td', table => table.textContent);
                resolve(dataObj);
                await newPage.close();
            })
            for(link in urls){
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
                console.log(currentPageData);
            }
            let nextButtonExist = false;
            try {
                const nextButton = await page.$eval('.next > a', a => a.textContent);
                nextButtonExist = true;
            } catch(err) {
                nextButtonExist = false;
            }
            if(nextButtonExist){
                await page.click('.next > a');
                return scrapeCurrentPage();
            }
            await page.close();
            return scrapedData;
        }
        
    let data = await scrapeCurrentPage();
    console.log(data);
    return data;
}
}

module.exports = scraperObject;