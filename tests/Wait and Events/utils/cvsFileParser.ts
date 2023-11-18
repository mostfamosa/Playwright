import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import csvParser from 'csv-parser';

const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);

export async function readAndParseCSV(filePath: string): Promise<any[]> {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.error('File does not exist at:', filePath);
        return [];
    }

    try {
        // Read the content of the file
        const fileContent = await readFileAsync(filePath, 'utf-8');

        // Parse CSV content into a structured format
        const parsedData: any[] = [];
        const rows = fileContent.split('\n');
        for (const row of rows) {
            const columns = row.split(',');
            const rowData: Record<string, string> = {};
            for (let i = 0; i < columns.length; i++) {
                const header = `Column${i + 1}`;
                rowData[header] = columns[i];
            }
            parsedData.push(rowData);
        }

        return parsedData;
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        return [];
    }
}