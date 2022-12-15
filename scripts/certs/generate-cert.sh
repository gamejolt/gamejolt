#!/bin/bash -e

CERTS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd "$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")" && pwd)

# Generate root CA key
openssl genrsa -out "${PROJECT_ROOT}/gamejoltCA.key" 2048

# Generate root CA cert
openssl req -x509 -new -nodes -days 365 \
    -key "${PROJECT_ROOT}/gamejoltCA.key" \
    -out "${PROJECT_ROOT}/gamejoltCA.crt" \
    -subj "/C=US/O=Game Jolt/OU=Development/CN=Game Jolt Dev CA"

# Generate development.gamejolt.com key
openssl genrsa -out "${PROJECT_ROOT}/development.gamejolt.com.key" 2048

# Generate CSR for development.gamejolt.com
openssl req -new \
    -key "${PROJECT_ROOT}/development.gamejolt.com.key" \
    -out "${PROJECT_ROOT}/development.gamejolt.com.csr" \
    -config "${CERTS_DIR}/ssl-req.conf" \
	`# This is needed to satisfy Mac security policy https://support.apple.com/en-il/HT210176` \
	-sha256

# Sign the CSR for development.gamejolt.com using the root CA
openssl x509 -req \
    -in "${PROJECT_ROOT}/development.gamejolt.com.csr" \
    -out "${PROJECT_ROOT}/development.gamejolt.com.crt" \
    -CA "${PROJECT_ROOT}/gamejoltCA.crt" \
    -CAkey "${PROJECT_ROOT}/gamejoltCA.key" \
    `# https://stackoverflow.com/questions/66357451/why-does-signing-a-certificate-require-cacreateserial-argument` \
    -CAcreateserial \
    -days 365 \
	`# This is needed to satisfy Mac security policy https://support.apple.com/en-il/HT210176` \
	-sha256 \
    `# Looks like the SAN isnt taken from the csr, so need to specify it like this again` \
    -extfile "${CERTS_DIR}/v3.ext"

# Bundle as pfx
openssl pkcs12 -export \
	-in "${PROJECT_ROOT}/development.gamejolt.com.crt" \
	-inkey "${PROJECT_ROOT}/development.gamejolt.com.key" \
	-out "${PROJECT_ROOT}/development.gamejolt.com.pfx" \
	-passout pass:"yame yolt"
