#!/bin/bash

# Verifică dacă cheia privată a fost oferită ca argument
if [ -z "$1" ]; then
    echo "Usage: $0 <PRIVATE_KEY>"
    exit 1
fi

pk=$1
url="http://127.0.0.1:8545"
contract_path="contracts/IBTToken.sol:MyToken"


echo "Deploying contract from private key: $pk..."
forge create  --broadcast  --rpc-url "$url" --private-key "$pk" "$contract_path"


if [ $? -eq 0 ]; then
    echo "Contract deployed successfully!"
else
    echo "Deployment failed! Please check the logs for errors."
    exit 1
fi
