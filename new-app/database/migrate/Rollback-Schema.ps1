#Requires -Version 5.1
<#
.SYNOPSIS
  Rollback Phase 2 schema: indexes -> constraints -> tables.

.DESCRIPTION
  Default dry-run. Pass -Server and -Database to execute via sqlcmd.
  Order: ddl/indexes/91_drop_indexes.sql, ddl/constraints/90_drop_constraints.sql, migrate/92_drop_tables.sql

.EXAMPLE
  .\Rollback-Schema.ps1
  .\Rollback-Schema.ps1 -Server localhost -Database WarehouseErp -TrustedConnection
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

$files = @(
    "ddl/indexes/91_drop_indexes.sql",
    "ddl/constraints/90_drop_constraints.sql",
    "migrate/92_drop_tables.sql"
)

$execute = [bool]$Server -and [bool]$Database
Write-Host "DatabaseRoot: $DatabaseRoot"
Write-Host "Mode: $(if ($execute) { 'EXECUTE via sqlcmd' } else { 'DRY-RUN' })"
Write-Host ""

$n = 0
foreach ($rel in $files) {
    $n++
    $full = Join-Path $DatabaseRoot $rel
    if (-not (Test-Path $full)) { throw "Missing file: $full" }
    Write-Host ("[{0}/{1}] {2}" -f $n, $files.Count, $rel)

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
        throw "Provide -TrustedConnection or -Username when executing."
    }

    & sqlcmd @sqlcmdArgs
    if ($LASTEXITCODE -ne 0) { throw "sqlcmd failed on $rel (exit $LASTEXITCODE)" }
}

Write-Host ""
Write-Host "Done. Rollback files processed: $($files.Count)."
if (-not $execute) {
    Write-Host "Dry-run only - no database changes."
}
