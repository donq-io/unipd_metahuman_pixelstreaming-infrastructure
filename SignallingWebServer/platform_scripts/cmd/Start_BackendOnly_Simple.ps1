# Copyright Epic Games, Inc. All Rights Reserved.
# Simple backend-only version that starts just the Cirrus signalling server

. "$PSScriptRoot\Start_Common_BackendOnly.ps1" $args

set_start_default_values "n" "n" # Don't set TURN and STUN server defaults
use_args($args)
print_parameters

$ProcessExe = "platform_scripts\cmd\node\node.exe"
$Arguments = @("cirrus", "--PublicIp=$global:PublicIp", "--UseFrontend=false")
# Add arguments passed to script to Arguments for executable
$Arguments += $args

Push-Location $PSScriptRoot\..\..\
Write-Output "Running: $ProcessExe $Arguments"
Write-Output "Backend-only mode: No frontend, TURN, or STUN servers"
Start-Process -FilePath $ProcessExe -ArgumentList $Arguments -Wait -NoNewWindow
Pop-Location 