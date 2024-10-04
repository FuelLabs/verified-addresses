import fs from 'fs';
import fetch from 'node-fetch';

const url = "https://raw.githubusercontent.com/FuelLabs/verified-assets/main/ASSETS.md";
const outputPath = "./docs/src/assets.md";

// Main function to fetch and write content
const fetchAndWriteContent = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        const content = "# Verified Assets\n\n" + text;

        // Write the content to the specified file
        fs.writeFileSync(outputPath, content);
        console.log(`Content successfully written to ${outputPath}`);
        
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
};

// Run the main function
fetchAndWriteContent();
