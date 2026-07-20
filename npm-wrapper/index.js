#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const axios = require('axios');

const JAR_NAME = 'onyxdb-api-0.1.0-SNAPSHOT.jar';
const JAR_PATH = path.join(__dirname, JAR_NAME);
const DOWNLOAD_URL = `https://github.com/Bharath80988/OnyxDB/releases/download/v0.1.0/${JAR_NAME}`;

async function downloadJar() {
    console.log(`Downloading OnyxDB engine from ${DOWNLOAD_URL}...`);
    try {
        const response = await axios({
            method: 'GET',
            url: DOWNLOAD_URL,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(JAR_PATH);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (err) {
        console.error('Failed to download OnyxDB jar. Make sure the GitHub release exists!');
        console.error(err.message);
        process.exit(1);
    }
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
