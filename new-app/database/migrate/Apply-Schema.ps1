#Requires -Version 5.1
<#
.SYNOPSIS
  Apply SQL Server DDL in Phase 2 apply order (tables -> constraints -> indexes).

.DESCRIPTION
  Default is dry-run (prints files only). Pass -Server and -Database to execute via sqlcmd.
  Does NOT seed business/catalog data (app-layer Phase 3). See docs/31_Migration_Seed.md.

.EXAMPLE
  .\Apply-Schema.ps1
  .\Apply-Schema.ps1 -Server localhost -Database WarehouseErp -TrustedConnection
#>
[CmdletBinding()]
param(
    [string]$Server,
    [string]$Database,
    [switch]$TrustedConnection,
    [string]$Username,
    [securestring]$Password,
    [string]$DatabaseRoot
)

$ErrorActionPreference = "Stop"
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $DatabaseRoot) {
    $DatabaseRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
$orderFile = Join-Path $PSScriptRoot "00_apply_order.txt"
if (-not (Test-Path $orderFile)) { throw "Missing $orderFile" }

$files = Get-Content $orderFile |
    Where-Object { $_ -and ($_ -notmatch '^\s*#') } |
    ForEach-Object { $_.Trim() }

$execute = [bool]$Server -and [bool]$Database
Write-Host "DatabaseRoot: $DatabaseRoot"
Write-Host "Mode: $(if ($execute) { 'EXECUTE via sqlcmd' } else { 'DRY-RUN (pass -Server and -Database to apply)' })"
Write-Host ""

$n = 0
foreach ($rel in $files) {
    $n++
    $full = Join-Path $DatabaseRoot $rel
    if (-not (Test-Path $full)) { throw "Missing file: $full" }
    Write-Host ("[{0:D2}/{1:D2}] {2}" -f $n, $files.Count, $rel)

    if (-not $execute) { continue }

    $sqlcmdArgs = @("-S", $Server, "-d", $Database, "-b", "-i", $full)
    if ($TrustedConnection) {
        $sqlcmdArgs += "-E"
    } elseif ($Username) {
        $sqlcmdArgs += @("-U", $Username)
        if ($Password) {
            $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
            try {
                $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
                $sqlcmdArgs += @("-P", $plain)
            } finally {
                [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
            }
        }
    } else {
        throw "Provide -TrustedConnection or -Username (and -Password) when executing."
    }

    & sqlcmd @sqlcmdArgs
    if ($LASTEXITCODE -ne 0) { throw "sqlcmd failed on $rel (exit $LASTEXITCODE)" }
}

Write-Host ""
Write-Host "Done. Files processed: $($files.Count)."
if (-not $execute) {
    Write-Host "Dry-run only - no database changes."
}
