param(
    [Parameter(Mandatory = $true)]
    [string] $RutaJson
)

$archivo = (Resolve-Path -LiteralPath $RutaJson -ErrorAction Stop).Path
$bytes = [System.IO.File]::ReadAllBytes($archivo)
$texto = [System.Text.Encoding]::UTF8.GetString($bytes)
$credencial = $texto | ConvertFrom-Json

if ($credencial.type -ne "service_account" -or
    [string]::IsNullOrWhiteSpace($credencial.project_id) -or
    [string]::IsNullOrWhiteSpace($credencial.private_key) -or
    [string]::IsNullOrWhiteSpace($credencial.client_email)) {
    throw "El archivo no es una credencial Firebase Admin SDK válida."
}

$valor = [Convert]::ToBase64String($bytes)
$valor | Set-Clipboard

Write-Host "Credencial codificada y copiada al portapapeles."
Write-Host "FIREBASE_PROJECT_ID:" $credencial.project_id
Write-Host "Pega el contenido del portapapeles solamente en FIREBASE_CREDENTIALS_B64 de Laravel en Render."
Write-Host "No subas el archivo ni la cadena codificada a GitHub."
