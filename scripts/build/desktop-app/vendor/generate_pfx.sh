openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 3650
openssl pkcs12 -inkey key.pem -in cert.pem -export -out cert.pfx