const cheerio = require('cheerio');
const playwright = require('playwright');
const userAgent = require('user-agents');

const LoadHTMLFromPage = async (regnr) => {

    try {
            let html = "";
        
            await playwright.chromium.launch({headless: true}).then(async (browser) => {
                const context = await browser.newContext({
                    userAgent: userAgent.toString()
                });
                
                const page = await context.newPage()
        
                await page.goto('https://fu-regnr.transportstyrelsen.se/extweb/UppgifterAnnatFordon')
            
                await page.waitForTimeout(500);
            
                await page.fill('#ts-regnr-sok', regnr);
            
                await page.locator('#btnSok').click();
        
                await page.waitForURL('https://fu-regnr.transportstyrelsen.se/extweb/UppgifterAnnatFordon/Fordonsuppgifter');
                
                await page.locator('#expand_button').click();
        
                html = await page.content();
            
                await browser.close();
                
            });
        
            return html;
        
    } catch (error) {
        
        throw "Error loading webpage";

    }
}



const CrawlHTMLEn = (html) => {
    try {

        const $ = cheerio.load(html);
        const mainDiv = $("#accordion");
        
        let model = getData($,mainDiv);
             
        return model;

    } catch (error) {

        throw "Error crawling html";
    }
   
}

function getData($, $mainDiv) {
    const $panels = $($mainDiv).children(".panel.panel-default");
    const model = []
    for (const $panel of $panels) {
        const $head = $($panel).children(".panel-heading")
        const head = toPascalCase(Shead.text().trim());
        const $body = $($panel).children(".panel-collapse")
        const $subPanel = $($panel).find(".panel-group")
        if ($($subPanel), length !== 0 && head !== "") {
            console.log("$$$5", head);
            model.push({
                [head]: getData($, $subPane1)
            })
        } else {
            const obj = {}
            const $items = $(".col-sa-6.col-xx-12", $body)
            for (const $item of $items) {
                if ($($item).children().length == 0) return;
                let $p = $($item).find("p");
                let title = $($p).find("strong").text()
                $($p.find('strong')).remove()
                $($p.find('br')).remove()
                title = toPascalCase(replaceSpecialCharacters(title))
                var value = $($p).text().replace(/\s+|([.,])(?=\S)/g, '$1 ').replace(/^\s|\s$/g, '');
                let h2 = $($item).parent().prev(".ts-h2").text().trim();
                h2 = toPascalCase(replaceSpecialCharacters(h2));
                if (title && value) {
                    if (h2 !== "" && obj[h2] == undefined) obj[h2] = {}
                    if (h2 !== "") {
                        obj[h2][title] = value;
                    } else {
                        obj[title] = value;
                    }
                }
            }

            model.push({
                [head]: obj
            })
        }
    }
    return model;
}


function toPascalCase(str){
    return `${str}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}

function replaceSpecialCharacters(str){

    let finalStr = "";

    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        
        switch (char) {
            case 'Ö':
                char = 'O'
                break;
            case 'Ä':
                char = 'A'
                break;
            case 'ö':
                char = 'o'
                break;
            case 'ä':
                char = 'a'
                break;
            case 'å':
                char = 'a'
                break;
            case 'Å':
                char = 'A'
                break;
            default:
                break;
        }

        finalStr += char;
    }

    return finalStr;
}




const ValidateRegNr = (regnr) => {
    return regnr.match(/[a-zA-ZåäöÅÄÖ\d\s]{2,7}/g).length == 1;
}

exports.TestValidateReg = (regnr) => {
    return ValidateRegNr(regnr)
}


exports.GetVehicleInformationEnglish = async (regnr) => {
    if(!regnr) return "no registration number attached";
    if(!ValidateRegNr(regnr)) return "not a valid registration number"

    const html = await LoadHTMLFromPage(regnr);
    return CrawlHTMLEn(html);
}

