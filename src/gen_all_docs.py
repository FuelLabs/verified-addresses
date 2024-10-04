import subprocess

# Paths to the scripts to run
scripts = ["src/gen_contract_docs.py", "src/gen_asset_docs.py"]

for script in scripts:
    try:
        print(f"Running {script}...")
        # Execute the script
        subprocess.run(["python3", script], check=True)
        print(f"{script} completed successfully.\n")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running {script}: {e}")
