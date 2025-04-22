# PowerShell script to start development servers

# Function to print colored status messages
function Write-Status {
    param([string]$Message)
    Write-Host ">>> $Message" -ForegroundColor Blue
}

# Function to check if a port is in use
function Test-PortInUse {
    param([int]$Port)
    $inUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($inUse) {
        Write-Host "Port $Port is already in use. Please free it up first." -ForegroundColor Red
        exit 1
    }
}

# Helper to safely pop location
function Safe-PopLocation {
    try { Pop-Location -ErrorAction Stop } catch { }
}

# Check if required ports are available
Test-PortInUse -Port 3000  # Frontend port
Test-PortInUse -Port 3001  # Backend port

# Save initial location
$initialLocation = Get-Location

# Start backend server
Write-Status "Starting backend server..."
if (-not (Test-Path "cipherx-backend")) {
    Write-Host "Backend directory 'cipherx-backend' not found!" -ForegroundColor Red
    exit 1
}
Push-Location -Path "cipherx-backend"
Start-Process -FilePath "npm" -ArgumentList "install" -NoNewWindow -Wait
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow
if (-not $backendProcess) {
    Write-Host "Failed to start backend process." -ForegroundColor Red
    Safe-PopLocation
    exit 1
}
Safe-PopLocation

# Start frontend development server
Write-Status "Starting frontend development server..."
if (-not (Test-Path "package.json")) {
    Write-Host "Frontend directory (current) does not contain package.json!" -ForegroundColor Red
    exit 1
}
Start-Process -FilePath "npm" -ArgumentList "install" -NoNewWindow -Wait
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
if (-not $frontendProcess) {
    Write-Host "Failed to start frontend process." -ForegroundColor Red
    exit 1
}

# Display status information
Write-Status "Development servers are running..."
Write-Status "Frontend: http://localhost:3000"
Write-Status "Backend:  http://localhost:3001"
Write-Status "Press Ctrl+C to stop both servers"

# Set up cleanup on script termination
$scriptCleanup = {
    Write-Status "Stopping servers..."
    if ($backendProcess) { $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue }
    if ($frontendProcess) { $frontendProcess | Stop-Process -Force -ErrorAction SilentlyContinue }
    Set-Location $initialLocation
}

try {
    # Wait for both processes (wait for either to exit)
    while ($true) {
        if ($backendProcess.HasExited -or $frontendProcess.HasExited) { break }
        Start-Sleep -Seconds 2
    }
} finally {
    # Run cleanup when the script exits
    & $scriptCleanup
}