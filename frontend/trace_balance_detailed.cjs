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

        // Naive regex again
        const openCount = (line.match(/<div\b/g) || []).length;
        const closeCount = (line.match(/<\/div\s*>/g) || []).length;
        // self closing <div /> logic: subtract from openCount
        const selfCloseCount = (line.match(/<div\b[^>]*\/>/g) || []).length;

        const prevBalance = balance;
        balance += (openCount - closeCount - selfCloseCount);

        // Check if we are inside main div block (after line 1182)
        if (i > 1182) {
            if (balance === 1 && prevBalance > 1) {
                console.log(`Line ${i + 1}: Balance returned to 1. Content: ${line.trim().substring(0, 50)}...`);
            }
            if (balance > 1 && i % 100 === 0) {
                // Check if we are stuck at high balance
                // console.log(`Line ${i+1}: Balance high (${balance})`);
            }

            // If balance drops to 0, main div closed!
            if (balance === 0 && prevBalance === 1) {
                console.log(`Line ${i + 1}: Main div closed! Content: ${line.trim().substring(0, 50)}...`);
            }
        }
    }
    console.log('Final Balance:', balance);
});
