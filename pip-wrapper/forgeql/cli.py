import os
import sys
import subprocess
import urllib.request

JAR_NAME = 'forgeql-api-0.2.0.jar'
JAR_PATH = os.path.join(os.path.dirname(__file__), JAR_NAME)
DOWNLOAD_URL = f"https://github.com/Bharath80988/ForgeQL/releases/download/v0.2.0/{JAR_NAME}"

def download_jar():
    print(f"Downloading ForgeQL engine from {DOWNLOAD_URL}...")
    try:
        req = urllib.request.Request(DOWNLOAD_URL, headers={'User-Agent': 'ForgeQL-Pip'})
        with urllib.request.urlopen(req) as response, open(JAR_PATH, 'wb') as out_file:
            out_file.write(response.read())
    except Exception as e:
        print("Failed to download ForgeQL jar. Make sure the GitHub release exists!")
        print(e)
        sys.exit(1)

def check_java():
    try:
        subprocess.run(['java', '-version'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def main():
    if not check_java():
        print("Java 21+ is not installed or not in PATH! Please install Java to run ForgeQL.")
        sys.exit(1)

    if not os.path.exists(JAR_PATH):
        print("First time setup: downloading required Java binaries...")
        download_jar()
        print("Download complete!")

    print("Starting ForgeQL...")
    try:
        subprocess.run(['java', '-jar', JAR_PATH])
    except KeyboardInterrupt:
        print("ForgeQL shut down.")

if __name__ == '__main__':
    main()
