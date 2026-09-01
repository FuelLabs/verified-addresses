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

const fastBridgeDeployments = [
    {
        network: "Ethereum",
        explorer: "https://etherscan.io/address",
        contracts: [
            ["Messenger", "0x2B1c1E133F832EFB1e168dE6102304B03C4ba653", "0xD64f2719705E5aA9b49A65285eA067aed1e6c942"],
            ["Outpost", "0x4D70851bC1C59a27af4a14342cb4CCC96c0ae563", "0x496449691d8F6b14a58ecf46c96Fe72a4f408B89"],
        ],
    },
    {
        network: "Base",
        explorer: "https://basescan.org/address",
        contracts: [
            ["Messenger", "0x2B1c1E133F832EFB1e168dE6102304B03C4ba653", "0x957c64084e13109AE5fFE86cEe399D9071Ded1fD"],
            ["Outpost", "0x4D70851bC1C59a27af4a14342cb4CCC96c0ae563", "0x69CbFc5C46FaE7BC28708268edCbDC09ac0818E7"],
        ],
    },
    {
        network: "BNB Smart Chain",
        explorer: "https://bscscan.com/address",
        contracts: [
            ["Messenger", "0x2B1c1E133F832EFB1e168dE6102304B03C4ba653", "0x8d75BaC30BeF77E5F6c70a6891c8d2cA6De3fAd1"],
            ["Outpost", "0x4D70851bC1C59a27af4a14342cb4CCC96c0ae563", "0x42Ca7A28f044AB727dFcF5fA49B9e770Dc067Ac3"],
        ],
    },
    {
        network: "HyperEVM",
        explorer: "https://hyperevmscan.io/address",
        contracts: [
            ["Messenger", "0x2B1c1E133F832EFB1e168dE6102304B03C4ba653", "0x8d75BaC30BeF77E5F6c70a6891c8d2cA6De3fAd1"],
            ["Outpost", "0x4D70851bC1C59a27af4a14342cb4CCC96c0ae563", "0xa1a9e55DEBF00bCF7b167F50D89AA0D59cCfa906"],
        ],
    },
];

const fastBridgeFuelDeployments = [
    ["AssetRegistry", "0x91cfcbef2caad02996cdcb5b897222170e85a91cd2db8f23f07ea7d9ca030c19", "0xb0d9f3e0689447632ac4dbfbbefaca7d4ff0bc580b468dd279167a07a4803724"],
    ["FastBridge", "0x12a1cf2d5b5b4eb7ece675b9d84f450fd49dfb969b46687627841a81c4ffb91f", "0xd585c1a5f3f225a2e1b967eff9614c7bcdee7860fd4b2de6a9c4583a2d62f287"],
    ["GasOracle", "0x3d20e5a675c5fa1053fba11e176099711ba2f23112e385a7f6e2e759eca84f94", "0x801af4ee92bd9e64ac16b65f490d4cd7dae791662ffbc8f70e20cdb7a6b7fa8c"],
    ["RateLimiter", "0x5d0b627f8192aee05c43ef53c1a12c054488cb6257f1dcf9e802b640b36722a7", "0x6060e4d0f3c8272ebc982706667827c119bcc821d35f349c92a18ef11d2585a3"],
    ["WrappedAssetsMinter", "0x0f9f509374c2da68997a3a1ad6d85be3f351c2f5f3da4c65bdbfad9b0bb25504", "0x4c00c2297bc4532e74e9ef8bee4a3bdb7e8ccb84ef5aecc56f845c23e475856e"],
];

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
        mdContent += "Contract Name | Contract Address\n";
        mdContent += "--- | ---\n";

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

            // Determine the Etherscan URL
            const etherscanBaseUrl = folder === "mainnet" ? "https://etherscan.io" : "https://sepolia.etherscan.io";

            // Create hyperlinks for addresses
            const contractAddressLink = contractAddress !== 'N/A' ? `[\`${contractAddress}\`](${etherscanBaseUrl}/address/${contractAddress})` : 'N/A';

            // Add to markdown content
            mdContent += `${contractName} | ${contractAddressLink}\n`;
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

                // Add Fuel section
                mdContent += `## Fuel ${folder.charAt(0).toUpperCase() + folder.slice(1)}\n\n`;
                mdContent += "Contract Name | Contract Address\n";
                mdContent += "--- | ---\n";

                if (folder === "mainnet") {
                    // Create hyperlinks for mainnet addresses
                    const fuelAddressLink = `[\`${fuelContractAddress}\`](https://app.fuel.network/contract/${fuelContractAddress}/minted-assets)`;
                    mdContent += `FuelL2BridgeId | ${fuelAddressLink}\n\n`;
                } else {
                    // Just show the addresses for testnet
                    mdContent += `FuelL2BridgeId | \`${fuelContractAddress}\`\n\n`;
                }
            }
        }
    }

    mdContent += "## Fast Bridge contracts\n\n";
    mdContent += "The proxy address or contract ID is the deployment entry point. Implementation addresses and IDs identify the code currently used by each proxy.\n\n";

    for (const deployment of fastBridgeDeployments) {
        mdContent += `### ${deployment.network}\n\n`;
        mdContent += "Contract Name | Proxy Address | Implementation Address\n";
        mdContent += "--- | --- | ---\n";

        for (const [name, proxy, implementation] of deployment.contracts) {
            mdContent += `${name} | [\`${proxy}\`](${deployment.explorer}/${proxy}) | [\`${implementation}\`](${deployment.explorer}/${implementation})\n`;
        }

        mdContent += "\n";
    }

    mdContent += "### Fuel\n\n";
    mdContent += "Contract Name | Proxy Contract ID | Implementation Contract ID\n";
    mdContent += "--- | --- | ---\n";

    for (const [name, proxy, implementation] of fastBridgeFuelDeployments) {
        mdContent += `${name} | [\`${proxy}\`](https://app.fuel.network/contract/${proxy}/code) | [\`${implementation}\`](https://app.fuel.network/contract/${implementation}/code)\n`;
    }

    mdContent += "\n";

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
