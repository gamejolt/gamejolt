$ErrorActionPreference = "Stop"

$projectDir = (Join-Path -Path $PSScriptRoot -ChildPath ".." | Resolve-Path).Path
New-Item -ItemType SymbolicLink -Path "$projectDir\.git\hooks\pre-commit" -Target "$projectDir\git-hooks\pre-commit" -Force
