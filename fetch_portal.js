const axios = require('axios');
const fs = require('fs');

const URL = 'https://pncp.gov.br/app/editais';

async function fetchPortal() {
    try {
        console.log(`Fetching ${URL}...`);
        const res = await axios.get(URL);
        fs.writeFileSync('portal.html', res.data);
        console.log('Saved portal.html');


        const jsMatches = res.data.match(/src="[^"]+\.js"/g) || [];
        console.log('Found JS files:', jsMatches);

        for (const match of jsMatches) {
            const relativePath = match.match(/src="([^"]+)"/)[1];
            let fullJsUrl = relativePath;
            if (!relativePath.startsWith('http')) {
                fullJsUrl = 'https://pncp.gov.br' + (relativePath.startsWith('/') ? '' : '/') + relativePath;
            }

            console.log(`Fetching JS: ${fullJsUrl}`);
            try {
                const jsRes = await axios.get(fullJsUrl);
                const filename = relativePath.split('/').pop();
                fs.writeFileSync(filename, jsRes.data);
                console.log(`Saved ${filename}`);
            } catch (jsErr) {
                console.error(`Failed to fetch ${fullJsUrl}: ${jsErr.message}`);
            }
        }

    } catch (err) {
        console.error(err);
    }
}

fetchPortal();
