import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

// GitHub repository information
const owner = "FuelLabs";
const repo = "fuel-bridge";
const branch = "refs/heads/deficake/251-mainnet-deploy";
const baseApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/packages/solidity-contracts/deployments`;

// Output file path
const outputFile = "./docs/src/contracts.md";

// Folders to check within the repository
const folders = ["mainnet", "testnet"];

// Start the markdown content with the main title
let mdContent = "# Verified Contracts\n\n";

// Helper function to fetch JSON data from a URL
const fetchJson = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`An error occurred while fetching data from ${url}:`, error);
        return null;
    }
};

// Main function to generate markdown content
const generateMarkdown = async () => {
    for (const folder of folders) {
        // Add a section header for the Ethereum contracts
        mdContent += `## Ethereum ${folder.charAt(0).toUpperCase() + folder.slice(1)}\n\n`;
        mdContent += "Contract Name | Contract Address | Implementation Address\n";
        mdContent += "--- | --- | ---\n";

        // URL to list files in the current folder
        const folderUrl = `${baseApiUrl}/${folder}?ref=${branch}`;

        const files = await fetchJson(folderUrl);
        if (!files) continue;

        // Loop through each file in the directory
        for (const file of files) {
            const fileName = file.name;

            // Skip files starting with '.' or specifically named "FuelL2BridgeId"
            if (fileName.startsWith('.') || fileName === "FuelL2BridgeId.json") continue;

            const contractName = path.parse(fileName).name;
            const fileUrl = file.download_url;

            const data = await fetchJson(fileUrl);
            if (!data) continue;

            // Extract required fields
            const contractAddress = data.address || 'N/A';
            const implementationAddress = data.implementation || 'N/A';

            // Determine the Etherscan URL
            const etherscanBaseUrl = folder === "mainnet" ? "https://etherscan.io" : "https://sepolia.etherscan.io";

            // Create hyperlinks for addresses
            const contractAddressLink = contractAddress !== 'N/A' ? `[${contractAddress}](${etherscanBaseUrl}/address/${contractAddress})` : 'N/A';
            const implementationAddressLink = implementationAddress !== 'N/A' ? `[${implementationAddress}](${etherscanBaseUrl}/address/${implementationAddress})` : 'N/A';

            // Add to markdown content
            mdContent += `${contractName} | ${contractAddressLink} | ${implementationAddressLink}\n`;
        }

        // Add a newline for separation between sections
        mdContent += "\n";

        // Handle FuelL2BridgeId separately
        for (const file of files) {
            if (file.name === "FuelL2BridgeId.json") {
                const fuelFileUrl = file.download_url;
                const fuelData = await fetchJson(fuelFileUrl);
                if (!fuelData) continue;

                const fuelContractAddress = fuelData.address || 'N/A';
                const fuelImplementationAddress = fuelData.implementation || 'N/A';

                // Add Fuel section
                mdContent += `## Fuel ${folder.charAt(0).toUpperCase() + folder.slice(1)}\n\n`;
                mdContent += "Contract Name | Contract Address | Implementation Address\n";
                mdContent += "--- | --- | ---\n";

                if (folder === "mainnet") {
                    // Create hyperlinks for mainnet addresses
                    const fuelAddressLink = `[${fuelContractAddress}](https://app.fuel.network/contract/${fuelContractAddress}/minted-assets)`;
                    const fuelImplementationLink = fuelImplementationAddress !== 'N/A' ? `[${fuelImplementationAddress}](https://app.fuel.network/contract/${fuelImplementationAddress}/minted-assets)` : 'N/A';
                    mdContent += `FuelL2BridgeId | ${fuelAddressLink} | ${fuelImplementationLink}\n\n`;
                } else {
                    // Just show the addresses for testnet
                    mdContent += `FuelL2BridgeId | ${fuelContractAddress} | ${fuelImplementationAddress}\n\n`;
                }
            }
        }
    }

    // Write the markdown content to the output file
    try {
        fs.writeFileSync(outputFile, mdContent);
        console.log(`Contracts summary successfully written to ${outputFile}`);
    } catch (error) {
        console.error(`An error occurred while writing to the file:`, error);
    }
};

// Run the main function
generateMarkdown();
