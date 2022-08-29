$ErrorActionPreference = "Stop"

# Abort if the certificates already exist.
if (Get-ChildItem -Path "Cert:\CurrentUser\Root" | Where-Object { $_.DnsNameList -contains "Game Jolt Dev CA" }) {
	Write-Output "'Game Jolt Dev CA' certificate already installed. Aborting"
	Exit
}

if (Get-ChildItem -Path "Cert:\CurrentUser\My" | Where-Object { $_.DnsNameList -contains "development.gamejolt.com" }) {
	Write-Output "'development.gamejolt.com' certificate already installed. Aborting"
	Exit
}

$projectDir = (Join-Path -Path $PSScriptRoot -ChildPath "..\.." | Resolve-Path).Path

# Create trusted root certificate.
# This should be manually installed in Trusted Root Certification Authorities store for the user.
$rootCert = New-SelfSignedCertificate `
	-Subject "C=US,O=Game Jolt,OU=Development,CN=Game Jolt Dev CA" `
	-NotAfter (Get-Date).AddYears(10) `
	-CertStoreLocation "Cert:\CurrentUser\My" `
	-DnsName "Game Jolt Dev CA" `
	-TextExtension @("2.5.29.19={text}CA=true") `
	-KeyUsage CertSign, CrlSign, DigitalSignature

[String]$rootCertPath = Join-Path -Path 'Cert:\CurrentUser\My\' -ChildPath "$($rootCert.Thumbprint)"
Export-Certificate -Cert $rootCertPath -FilePath "$projectDir\gamejoltCA.crt"

# Create a cert signed by our trusted root store.
# This is what our devserver will use to do https.
$testCert = New-SelfSignedCertificate `
	-Subject "C=US,O=Game Jolt,OU=Development,CN=*.development.gamejolt.com" `
	-NotAfter (Get-Date).AddYears(10) `
	-CertStoreLocation "Cert:\CurrentUser\My" `
	-DnsName "development.gamejolt.com", "*.devleopment.gamejolt.com" `
	-KeyExportPolicy Exportable `
	-KeyLength 2048 `
	-KeyUsage DigitalSignature, KeyEncipherment `
	-Signer $rootCert

[String]$testCertPath = Join-Path -Path 'Cert:\CurrentUser\My\' -ChildPath "$($testCert.Thumbprint)"
[System.Security.SecureString]$testCertPassword = ConvertTo-SecureString -String "yame yolt" -Force -AsPlainText
Export-PfxCertificate -Cert $testCertPath -FilePath "$projectDir\development.gamejolt.com.pfx" -Password $testCertPassword
Export-Certificate -Cert $testCertPath -FilePath "$projectDir\development.gamejolt.com.crt"

# Remove from CurrentUser\My store because we need this to be in trusted root store anyways.
# I don't want to automate this step.
Remove-Item -Path $rootCertPath
