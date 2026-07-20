import os
import sys
import subprocess
import requests

JAR_NAME = 'onyxdb-api-0.1.3.jar'
JAR_PATH = os.path.join(os.path.dirname(__file__), JAR_NAME)
DOWNLOAD_URL = f"https://github.com/Bharath80988/OnyxDB/releases/download/v0.1.3/{JAR_NAME}"

def download_jar():
    print(f"Downloading OnyxDB engine from {DOWNLOAD_URL}...")
    try:
        response = requests.get(DOWNLOAD_URL, stream=True)
        response.raise_for_status()
        with open(JAR_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    except Exception as e:
        print("Failed to download OnyxDB jar. Make sure the GitHub release exists!")
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
        print("Java 21+ is not installed or not in PATH! Please install Java to run OnyxDB.")
        sys.exit(1)

    if not os.path.exists(JAR_PATH):
        print("First time setup: downloading required Java binaries...")
        download_jar()
        print("Download complete!")

    print("Starting OnyxDB...")
    try:
        subprocess.run(['java', '-jar', JAR_PATH])
    except KeyboardInterrupt:
        print("OnyxDB shut down.")

if __name__ == '__main__':
    main()
