import { spawnSync } from 'child_process';

// Paths to the scripts to run
const scripts = ["src/gen-contract-docs.mjs", "src/gen-asset-docs.mjs"];

for (const script of scripts) {
    try {
        console.log(`Running ${script}...`);

        // Execute the script
        const result = spawnSync('node', [script], { stdio: 'inherit' });

        if (result.error) {
            throw result.error;
        }
        
        if (result.status !== 0) {
            throw new Error(`Script exited with status code: ${result.status}`);
        }

        console.log(`${script} completed successfully.\n`);
    } catch (error) {
        console.error(`An error occurred while running ${script}: ${error}`);
    }
}
