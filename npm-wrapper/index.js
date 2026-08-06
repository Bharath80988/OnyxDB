#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { spawn, execSync } = require('child_process');

const JAR_NAME = 'onyxdb-api-0.2.0.jar';
const JAR_PATH = path.join(__dirname, JAR_NAME);
const DOWNLOAD_URL = `https://github.com/Bharath80988/OnyxDB/releases/download/v0.2.0/${JAR_NAME}`;

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

class OnyxClient {
    constructor(host = 'http://localhost:8080', token = 'admin-secret-key') {
        this.host = host.replace(/\/$/, '');
        this.token = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    async _request(payload) {
        const url = new URL(`${this.host}/api/query`);
        const bodyStr = JSON.stringify(payload);

        return new Promise((resolve, reject) => {
            const req = http.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token,
                    'Content-Length': Buffer.byteLength(bodyStr)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({ status: 'error', raw: data });
                    }
                });
            });

            req.on('error', reject);
            req.write(bodyStr);
            req.end();
        });
    }

    get(table, id) {
        return this._request({ action: 'select', table, id });
    }

    find(table, where) {
        return this._request({ action: 'select', table, where });
    }

    insert(table, id, data = {}) {
        return this._request({ action: 'insert', table, data: { id, ...data } });
    }

    update(table, id, updates = {}) {
        return this._request({ action: 'update', table, data: { id, ...updates } });
    }

    delete(table, id) {
        return this._request({ action: 'delete', table, id });
    }

    createIndex(table, field) {
        return this._request({ action: 'create_index', table, field });
    }

    vectorSearch(table, vector, k = 5) {
        return this._request({ action: 'vector_search', table, vector, k });
    }

    oqs(queryString) {
        /** Execute a string query in Onyx Query Syntax (e.g. 'GET users 101'). */
        return this._request({ oqs: queryString });
    }

    explain(queryString) {
        /** Return the Cost-Based Optimizer (CBO) execution plan for an OQS query string. */
        return this._request({ oqs: `EXPLAIN ${queryString}` });
    }

    hybridSearch(table, vector, where = null, k = 5) {
        /** KNN Cosine Similarity vector search combined with a relational field filter.
         *  @param {string}   table  - Target table name.
         *  @param {number[]} vector - Float array embedding.
         *  @param {object}   where  - Optional field filter object applied after vector ranking.
         *  @param {number}   k      - Number of nearest neighbors to return.
         */
        const payload = { action: 'hybrid_search', table, vector, k };
        if (where) payload.where = where;
        return this._request(payload);
    }
}

if (require.main === module) {
    startOnyxDB();
}

module.exports = { OnyxClient, startOnyxDB };
