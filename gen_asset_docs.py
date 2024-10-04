import requests

url = "https://raw.githubusercontent.com/FuelLabs/verified-assets/main/ASSETS.md"

output_path = "./docs/src/assets.md"

try:
    response = requests.get(url)
    response.raise_for_status()

    content = "# Verified Assets\n\n" + response.text

    with open(output_path, 'w') as file:
        file.write(content)

    print(f"Content successfully written to {output_path}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred while fetching the file: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
