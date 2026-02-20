const fs = require('fs');
const path = 'c:\\Users\\ZBOOK\\Documents\\dinarlytics\\Dinarlytics\\frontend\\src\\pages\\crm\\Fournisseurs.tsx';

fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Count occurrences of <div and </div
    // Note: this is a simple string search, won't account for comments or strings perfectly but usually good enough for JSX
    // We should also check for self-closing <div /> though rare.

    const openDivs = (data.match(/<div\b/g) || []).length;
    const closeDivs = (data.match(/<\/div\s*>/g) || []).length;

    console.log('Open divs:', openDivs);
    console.log('Close divs:', closeDivs);

    // Find where imbalance might be?
    // We can scan line by line and keep a stack trace.

    const lines = data.split('\n');
    let stack = [];
    let balance = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Simple regex for tags
        // This is very naive and will break on complex JSX, but might give a hint
        // We ignore <br/>, <input/> etc.
        // We care about block tags: div, Modal, Card, form, Table, thead, tbody, tr, td, th, ul, li

        const tagsToCheck = ['div', 'Modal', 'Card', 'form', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'ul', 'li'];

        tagsToCheck.forEach(tag => {
            const openRegex = new RegExp(`<${tag}\\b`, 'g');
            const closeRegex = new RegExp(`<\/${tag}\\s*>`, 'g');
            const selfCloseRegex = new RegExp(`<${tag}(\\s+[^>]*)?/>`, 'g'); // Simplified self closing

            const openCount = (line.match(openRegex) || []).length;
            const closeCount = (line.match(closeRegex) || []).length;
            const selfCloseCount = (line.match(selfCloseRegex) || []).length; // These count as both or neither

            const netChange = openCount - closeCount - selfCloseCount; // Self closing matches openRegex too? Yes.
            // Wait, <div /> matches <div\b. So openCount includes self-closing.
            // So we subtract selfCloseCount to ignore them.

            if (tag === 'div') {
                balance += (openCount - closeCount - selfCloseCount);
            }
        });
    }
    console.log('Final div balance (naive):', balance);
});
