# Traditional RSA PEM test fixtures

These keys were generated exclusively for tests and must never be used outside tests.
They are unrelated to user-provided keys. Fixture password: `fixture-only`.

Generated with OpenSSL:

```sh
openssl genrsa -traditional 1024 > plain.pem
openssl rsa -in plain.pem -traditional -des3 -passout pass:fixture-only -out des-ede3-cbc.pem
openssl rsa -in plain.pem -traditional -aes128 -passout pass:fixture-only -out aes-128-cbc.pem
openssl rsa -in plain.pem -traditional -aes192 -passout pass:fixture-only -out aes-192-cbc.pem
openssl rsa -in plain.pem -traditional -aes256 -passout pass:fixture-only -out aes-256-cbc.pem
```
