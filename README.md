# Vault Wallet

## Transaction Steps
- Craft tx Model
- Encode
- Sign
- Attach Signature
- Re-Encode
- POST

## Conceptual Architecture

```mermaid
    C4Context
        title "Isolation Wallet & KMS"
        Boundary(b0, "Run-time", "OS") {
            Boundary(b1, "Wallet", "Docker") {
                System(app, "Wallet CLI", "wallet")
            }

            Boundary(b2, "KMS", "Docker") {
                System(kms, "Hashicorp Vault", "Key Management Service")
            }

            BiRel(app, kms, "uses", "REST")
        }

        UpdateRelStyle(app, kms, $textColor="green", $lineColor="blue", $offsetX="0")
        UpdateLayoutConfig($c4ShapeInRow="1", $c4BoundaryInRow="0")

```

## Wallet Components
- Local State
- Networking
- KMS
- Data Models
- Encoding
- API


## How to run

```bash
# Install local deps
$ yarn

# Launch Vault
$ docker-compose up -d vault

# Configure Vault at http://localhost:8200
# Then configure VAULT_TOKEN in .env

# Init and unseal Vault
$ yarn run vault:init

# Run the wallet REPL / CLI
yarn start:dev -- --entryFile repl
``` 
