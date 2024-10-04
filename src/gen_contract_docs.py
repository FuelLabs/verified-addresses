import requests
import os

# GitHub repository information
owner = "FuelLabs"
repo = "fuel-bridge"
branch = "refs/heads/deficake/251-mainnet-deploy"
base_api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/packages/solidity-contracts/deployments"

# Output file path
output_file = "./docs/src/contracts.md"

# Folders to check within the repository
folders = ["mainnet", "testnet"]

# Start the markdown content with the main title
md_content = "# Verified Deployed Contracts\n\n"

# Loop through each folder (mainnet and testnet)
for folder in folders:
    # Add a section header for the Ethereum contracts
    md_content += f"## Ethereum {folder.capitalize()}\n\n"
    md_content += "Contract Name | Contract Address | Implementation Address\n"
    md_content += "--- | --- | ---\n"

    # URL to list files in the current folder
    folder_url = f"{base_api_url}/{folder}?ref={branch}"

    try:
        # Fetch the list of files in the directory
        response = requests.get(folder_url)
        response.raise_for_status()
        files = response.json()

        # Loop through each file in the directory
        for file in files:
            file_name = file['name']

            # Skip files starting with '.' or specifically named "FuelL2BridgeId"
            if file_name.startswith('.') or file_name == "FuelL2BridgeId.json":
                continue

            contract_name = os.path.splitext(file_name)[0]
            file_url = file['download_url']

            # Fetch the content of the JSON file using the download URL
            file_response = requests.get(file_url)
            file_response.raise_for_status()
            data = file_response.json()

            # Extract required fields
            contract_address = data.get('address', 'N/A')
            implementation_address = data.get('implementation', 'N/A')

            # Determine the Etherscan URL
            etherscan_base_url = "https://etherscan.io" if folder == "mainnet" else "https://sepolia.etherscan.io"

            # Create hyperlinks for addresses
            contract_address_link = f"[{contract_address}]({etherscan_base_url}/address/{contract_address})" if contract_address != 'N/A' else 'N/A'
            implementation_address_link = f"[{implementation_address}]({etherscan_base_url}/address/{implementation_address})" if implementation_address != 'N/A' else 'N/A'

            # Add to markdown content
            md_content += f"{contract_name} | {contract_address_link} | {implementation_address_link}\n"
        
        # Add a newline for separation between sections
        md_content += "\n"

        # Handle FuelL2BridgeId separately
        for file in files:
            if file['name'] == "FuelL2BridgeId.json":
                fuel_file_url = file['download_url']
                try:
                    # Fetch the FuelL2BridgeId file content using the download URL
                    fuel_response = requests.get(fuel_file_url)
                    fuel_response.raise_for_status()
                    fuel_data = fuel_response.json()
                    fuel_contract_address = fuel_data.get('address', 'N/A')
                    fuel_implementation_address = fuel_data.get('implementation', 'N/A')

                    # Add Fuel section
                    md_content += f"## Fuel {folder.capitalize()}\n\n"
                    md_content += "Contract Name | Contract Address | Implementation Address\n"
                    md_content += "--- | --- | ---\n"

                    if folder == "mainnet":
                        # Create hyperlinks for mainnet addresses
                        fuel_address_link = f"[{fuel_contract_address}](https://app.fuel.network/contract/{fuel_contract_address}/minted-assets)"
                        fuel_implementation_link = f"[{fuel_implementation_address}](https://app.fuel.network/contract/{fuel_implementation_address}/minted-assets)" if fuel_implementation_address != 'N/A' else 'N/A'
                    else:
                        # Just show the addresses for testnet
                        fuel_address_link = fuel_contract_address
                        fuel_implementation_link = fuel_implementation_address

                    # Add Fuel contract info to the markdown content
                    md_content += f"FuelL2BridgeId | {fuel_address_link} | {fuel_implementation_link}\n\n"

                except requests.exceptions.RequestException as e:
                    print(f"An error occurred while fetching FuelL2BridgeId.json from {folder}: {e}")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching files from {folder}: {e}")

# Write the markdown content to the output file
with open(output_file, 'w') as file:
    file.write(md_content)

print(f"Contracts summary successfully written to {output_file}")
