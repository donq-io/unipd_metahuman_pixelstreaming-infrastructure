@Rem Copyright Epic Games, Inc. All Rights Reserved.

@echo off

@Rem Set script location as working directory for commands.
pushd "%~dp0"

@Rem Ensure we have NodeJs available for calling.
call setup_node.bat > nul

@Rem Ensure we have frontend built.
@Rem call setup_frontend.bat %*

@Rem Ensure we have CoTURN available for calling.
call setup_coturn.bat > nul

@Rem Move to cirrus.js directory and install its package.json
pushd %~dp0\..\..\
call platform_scripts\cmd\node\npm install --no-save > nul
popd

@Rem Pop working directory
popd 