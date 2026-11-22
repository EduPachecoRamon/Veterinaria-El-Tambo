$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot

function PuertoOcupado([int]$puerto) {
    return [bool](Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue)
}

function IniciarServicio($nombre, $carpeta, $comando, $puerto) {
    if (PuertoOcupado $puerto) {
        Write-Host "[ACTIVO] Puerto $puerto ocupado. No se inicia otra instancia de $nombre."
        return
    }

    $script = @"
Set-Location -LiteralPath '$carpeta'
`$Host.UI.RawUI.WindowTitle = '$nombre'
$comando
"@

    Start-Process powershell.exe -ArgumentList @(
        "-NoExit",
        "-NoProfile",
        "-Command",
        $script
    )

    Write-Host "[INICIANDO] $nombre en puerto $puerto"
}

Write-Host "=================================="
Write-Host " CLINICA VETERINARIA EL TAMBO"
Write-Host "=================================="

$api = Join-Path $raiz "api"
$frontend = Join-Path $raiz "frontend"
$spring = Join-Path $raiz "spring-estadisticas"

foreach ($carpeta in @($api, $frontend, $spring)) {
    if (-not (Test-Path $carpeta)) {
        throw "No existe la carpeta: $carpeta"
    }
}

$variables = @{}

Get-Content (Join-Path $api ".env") | ForEach-Object {
    if ($_ -match '^\s*(DB_URI|DB_DATABASE|SPRING_INTERNAL_KEY)=(.*)$') {
        $variables[$matches[1]] = $matches[2].Trim().Trim('"', "'")
    }
}

foreach ($nombre in @("DB_URI", "DB_DATABASE", "SPRING_INTERNAL_KEY")) {
    if ([string]::IsNullOrWhiteSpace($variables[$nombre])) {
        throw "Falta configurar $nombre en api/.env"
    }
}

$env:MONGODB_URI = $variables["DB_URI"]
$env:SPRING_DATA_MONGODB_DATABASE = $variables["DB_DATABASE"]
$env:SPRING_INTERNAL_KEY = $variables["SPRING_INTERNAL_KEY"]

$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue

if (-not $maven) {
    $maven = Get-Command mvn -ErrorAction SilentlyContinue
}

if (-not $maven) {
    throw "No se encontró Maven."
}

IniciarServicio "Laravel API" $api "php artisan serve --host=127.0.0.1 --port=8000" 8000

IniciarServicio "Spring Estadisticas" $spring "mvn spring-boot:run" 8081

IniciarServicio "React Frontend" $frontend "npm.cmd run dev -- --strictPort" 5173

Write-Host ""
Write-Host "Arranque solicitado."
Write-Host "Abre http://127.0.0.1:5173/"
Write-Host "Cada servidor permanece en su propia terminal."
