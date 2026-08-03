#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn, execSync } = require('child_process');

const JAR_NAME = 'onyxdb-api-0.1.3.jar';
const JAR_PATH = path.join(__dirname, JAR_NAME);
const DOWNLOAD_URL = `https://github.com/Bharath80988/OnyxDB/releases/download/v0.1.3/${JAR_NAME}`;

function downloadJar() {
    return new Promise((resolve, reject) => {
        console.log(`Downloading OnyxDB engine from ${DOWNLOAD_URL}...`);
        const file = fs.createWriteStream(JAR_PATH);
        
        function handleResponse(response) {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                https.get(response.headers.location, handleResponse).on('error', reject);
                return;
            }
            if (response.statusCode !== 200) {
                fs.unlink(JAR_PATH, () => {});
                reject(new Error(`Failed to download OnyxDB jar (HTTP ${response.statusCode}). Make sure the GitHub release exists!`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }

        https.get(DOWNLOAD_URL, handleResponse).on('error', (err) => {
            fs.unlink(JAR_PATH, () => {});
            reject(err);
        });
    });
}

function checkJava() {
    try {
        execSync('java -version', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

async function startOnyxDB() {
    if (!checkJava()) {
        console.error("Java 21+ is not installed or not in PATH! Please install Java to run OnyxDB.");
        process.exit(1);
    }

    if (!fs.existsSync(JAR_PATH)) {
        console.log('First time setup: downloading required Java binaries...');
        await downloadJar();
        console.log('Download complete!');
    }

    console.log('Starting OnyxDB...');
    const javaProcess = spawn('java', ['-jar', JAR_PATH], { stdio: 'inherit' });

    javaProcess.on('close', (code) => {
        console.log(`OnyxDB exited with code ${code}`);
    });
}

startOnyxDB();
