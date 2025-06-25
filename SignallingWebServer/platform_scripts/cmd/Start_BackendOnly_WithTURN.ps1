# Copyright Epic Games, Inc. All Rights Reserved.
# Backend-only version that starts Cirrus, STUN, and TURN servers without frontend

. "$PSScriptRoot\Start_Common_BackendOnly.ps1" $args

set_start_default_values "y" "y" # Set both TURN and STUN server defaults
use_args($args)
print_parameters *> $null

Push-Location $PSScriptRoot

$pidFile = "$PSScriptRoot\coturn\coturn.pid"
if (Test-Path $pidFile) {
    Remove-Item $pidFile -Force
}

$turnProcess = Start-Process -FilePath "PowerShell" -ArgumentList ".\Start_TURNServer.ps1" -WorkingDirectory "$PSScriptRoot" -PassThru

while (-not (Test-Path $pidFile)) {
    Start-Sleep -Milliseconds 100
}
$turnServerPid = Get-Content $pidFile

$peerConnectionOptions = "{ \""iceServers\"": [{\""urls\"": [\""stun:" + $global:StunServer + "\"",\""turn:" + $global:TurnServer + "\""], \""username\"": \""PixelStreamingUser\"", \""credential\"": \""AnotherTURNintheroad\""}] }"

$ProcessExe = "platform_scripts\cmd\node\node.exe"
$Arguments = @("cirrus", "--peerConnectionOptions=""$peerConnectionOptions""", "--PublicIp=$global:PublicIp", "--UseFrontend=false")
# Add arguments passed to script to Arguments for executable
$Arguments += $args

Push-Location $PSScriptRoot\..\..\
Write-Output "Running: $ProcessExe $Arguments" *> $null
Write-Output "Backend-only mode: No frontend will be built or served" *> $null
$cirrusProcess = Start-Process -FilePath $ProcessExe -ArgumentList $Arguments -PassThru
Pop-Location

Pop-Location

Write-Output $turnServerPid
Write-Output $cirrusProcess.Id