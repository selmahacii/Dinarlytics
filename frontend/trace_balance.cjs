const fs = require('fs');
const path = 'c:\\Users\\ZBOOK\\Documents\\dinarlytics\\Dinarlytics\\frontend\\src\\pages\\crm\\Fournisseurs.tsx';

fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const lines = data.split('\n');
    let balance = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const openCount = (line.match(/<div\b/g) || []).length;
        const closeCount = (line.match(/<\/div\s*>/g) || []).length;
        // self closing <div />
        const selfCloseCount = (line.match(/<div\s+[^>]*\/>/g) || []).length;
        // Wait, regex for self closing is tricky. <div />.
        // <div className="..." />.

        // Let's assume standard formatting. 
        // If line has <div ... />, it increments openCount but we should subtract 1.
        // Actually, let's just count <div and </div.
        // Self closing <div /> has both <div and />? No.
        // A self closing div is <div ... />. It usually doesn't have </div.
        // So it increases openCount by 1. We need to decrease it back.

        // Refined regex for self-closing div
        const selfCloseMatch = line.match(/<div\b[^>]*\/>/g);
        const selfClose = selfCloseMatch ? selfCloseMatch.length : 0;

        balance += (openCount - closeCount - selfClose);

        // Print balance at key points
        if (i === 1185) console.log(`Line ${i + 1} Balance: ${balance}`); // Start of main div
        if (i === 1345) console.log(`Line ${i + 1} Balance: ${balance}`); // Start of Commandes?
        if (i === 1420) console.log(`Line ${i + 1} Balance: ${balance}`); // Start of Factures?
        if (i === 1480) console.log(`Line ${i + 1} Balance: ${balance}`); // Start of Paiements?
        if (i === 1584) console.log(`Line ${i + 1} Balance: ${balance}`); // Start of Modal
        if (i === 2928) console.log(`Line ${i + 1} Balance: ${balance}`); // End of file

        // Detect sudden jump?
        // Detect if balance doesn't return to 1 before Modal start.
    }
});
