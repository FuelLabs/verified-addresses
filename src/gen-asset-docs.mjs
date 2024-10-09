import fs from 'fs';
import fetch from 'node-fetch';

const url = "https://raw.githubusercontent.com/FuelLabs/verified-assets/main/ASSETS.md";
const outputPath = "./docs/src/assets.md";

// The custom section to be included
const customSection = `
# Verified Assets

## Using this section

You can find the current list of verified assets maintained by Fuel here: [verified-assets.json](https://verified-assets.fuel.network/assets.json)

Projects are welcome to use this information, but please note that it is provided at your own risk.

Additionally, you can download the latest asset information and icons in a single archive. This is useful if you want to locally cache the list or include it in a release pipeline for your tools and libraries: [verified-assets.zip](https://github.com/FuelLabs/verified-assets/)

For more information, please visit the verified assets repository [here](https://github.com/FuelLabs/verified-assets/).
`;

// Main function to fetch and write content
const fetchAndWriteContent = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        // Prepend the custom section to the fetched content
        const content = customSection + '\n' + text;

        // Write the content to the specified file
        fs.writeFileSync(outputPath, content);
        console.log(`Content successfully written to ${outputPath}`);
        
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
};

// Run the main function
fetchAndWriteContent();
