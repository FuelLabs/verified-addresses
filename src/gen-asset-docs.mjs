import fs from 'fs';

const assetsMarkdownUrl = "https://raw.githubusercontent.com/FuelLabs/verified-assets/main/ASSETS.md";
const assetsJsonUrl = "https://raw.githubusercontent.com/FuelLabs/verified-assets/main/assets.json";
const outputPath = "./docs/src/assets.md";

const intro = `# Verified Assets

## Using this section

You can find the current list of verified assets maintained by Fuel here: [verified-assets.json](https://verified-assets.fuel.network/assets.json)

Projects are welcome to use this information, but please note that it is provided at your own risk.

Additionally, you can download the latest asset information and icons in a single archive. This is useful if you want to locally cache the list or include it in a release pipeline for your tools and libraries: [verified-assets.zip](https://github.com/FuelLabs/verified-assets/)

For more information, please visit the verified assets repository [here](https://github.com/FuelLabs/verified-assets/).`;

const bscAssets = `### Binance Smart Chain

| Name | Address | Decimals |
|------|---------|----------|
| \`Fuel\` | [\`0x5c8daEabc57E9249606D3bD6d1E097eF492eA3C5\`](https://bscscan.com/address/0x5c8daEabc57E9249606D3bD6d1E097eF492eA3C5) | \`9\` |
| \`USDT\` | [\`0x55d398326f99059ff775485246999027b3197955\`](https://bscscan.com/address/0x55d398326f99059ff775485246999027b3197955) | \`18\` |
| \`USDC\` | [\`0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d\`](https://bscscan.com/address/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d) | \`18\` |`;

const fetchResource = async (url, responseType) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error fetching ${url}: ${response.status}`);
    }

    return response[responseType]();
};

const extractSection = (markdown, heading) => {
    const marker = `## ${heading}\n`;
    const start = markdown.indexOf(marker);
    if (start === -1) {
        throw new Error(`Missing section in ASSETS.md: ${marker}`);
    }

    const contentStart = start + marker.length;
    const nextSection = markdown.indexOf("\n## ", contentStart);
    return markdown.slice(contentStart, nextSection === -1 ? undefined : nextSection).trim();
};

const withoutFastBridgeRows = (section) => section
    .split("\n")
    .filter((line) => !/^\| `uw/.test(line))
    .join("\n")
    .replace("Contract Address", "Contract ID")
    .replace("|------|----------|------------------|----------|", "|------|----------|-------------|----------|");

const createFastBridgeSection = (assets, chain) => {
    const networks = assets
        .filter(({ symbol }) => symbol.startsWith("uw"))
        .flatMap((asset) => asset.networks
            .filter((network) => network.type === "fuel" && network.chain === chain)
            .map((network) => ({ symbol: asset.symbol, ...network })))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));

    const explorer = chain === "mainnet" ? "https://app.fuel.network" : "https://app-testnet.fuel.network";
    const rows = networks.map(({ symbol, assetId, contractId, decimals }) =>
        `| \`${symbol}\` | \`${assetId}\` | \`${contractId}\` | \`${decimals}\` |`
    ).join("\n");

    const networkName = chain === "mainnet" ? "Mainnet" : "Testnet";

    return `### ${networkName} Fast Bridge asset IDs

Minted on Fuel by the [WrappedAssetsMinter contract](${explorer}/contract/${networks[0].contractId}/minted-assets) when assets are deposited through the Fast Bridge.

| Name | Asset ID | Contract ID | Decimals |
|------|----------|-------------|----------|
${rows}`;
};

const fetchAndWriteContent = async () => {
    try {
        const [assetsMarkdown, assets] = await Promise.all([
            fetchResource(assetsMarkdownUrl, "text"),
            fetchResource(assetsJsonUrl, "json"),
        ]);

        const content = [
            intro,
            "## Mainnet",
            `### Ethereum\n\n${extractSection(assetsMarkdown, "Ethereum L1")}`,
            `### Base\n\n${extractSection(assetsMarkdown, "Ethereum base")}`,
            bscAssets,
            `### Mainnet Fuel asset IDs\n\nMinted when depositing through [\`FuelERC20GatewayV4\`](https://etherscan.io/address/0xa4cA04d02bfdC3A2DF56B9b6994520E69dF43F67)\n\n${withoutFastBridgeRows(extractSection(assetsMarkdown, "Fuel Mainnet"))}`,
            createFastBridgeSection(assets, "mainnet"),
            "## Testnet",
            `### Ethereum Sepolia\n\n${extractSection(assetsMarkdown, "Ethereum Sepolia Testnet")}`,
            `### Base Sepolia\n\n${extractSection(assetsMarkdown, "Ethereum baseSepolia")}`,
            `### Testnet Fuel asset IDs\n\n${withoutFastBridgeRows(extractSection(assetsMarkdown, "Fuel Testnet"))}`,
            createFastBridgeSection(assets, "testnet"),
        ].join("\n\n") + "\n";

        fs.writeFileSync(outputPath, content);
        console.log(`Content successfully written to ${outputPath}`);
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        process.exitCode = 1;
    }
};

fetchAndWriteContent();
