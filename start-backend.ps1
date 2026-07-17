$ErrorActionPreference = "Stop"

$MavenVersion = "3.9.6"
$MavenDir = "apache-maven-$MavenVersion"
$MavenZip = "maven.zip"
$MavenPath = Join-Path $PWD ".maven"
$MvnCmd = Join-Path $MavenPath "$MavenDir\bin\mvn.cmd"

if (-not (Test-Path $MvnCmd)) {
    Write-Host "Maven not found locally. Downloading Apache Maven $MavenVersion..."
    if (-not (Test-Path $MavenPath)) {
        New-Item -ItemType Directory -Path $MavenPath | Out-Null
    }
    $ZipPath = Join-Path $MavenPath $MavenZip
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip" -OutFile $ZipPath
    
    Write-Host "Extracting Maven..."
    Expand-Archive -Path $ZipPath -DestinationPath $MavenPath -Force
    Remove-Item -Path $ZipPath -Force
    
    Write-Host "Maven downloaded and extracted successfully."
}

Write-Host "Building OnyxDB multi-module project..."
& $MvnCmd clean install -DskipTests

Write-Host "Starting OnyxDB API..."
cd onyxdb-api
& $MvnCmd spring-boot:run
