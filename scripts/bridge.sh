#!/bin/bash

# Verificare argumente
if [ $# -lt 4 ]; then
    echo "Argumente insuficiente!"
fi

action=$1
qty=$2
dest=$3
coin_id=$4

# Setari Ethereum
eth_url="http://127.0.0.1:8545"
deploy_to="0x5FbDB2315678afecb367f032d93F642f64180aa3"  # Adresa contractului deployment
anvil_pk="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Cheia privata cont Anvil

# Setari Sui, din obiectul publicat
pack_id="0x93fe10baea8f2442a06de6da331d9b09f69785d0fb51fba5be3efce5b533b51b"
admin_cap="0xd6bcac449c2931ecba4b336c29f8cb1102e1aa24558a4424a52205d2e7ef97ba"  # ID-ul obiectului de administrare

# Afisare dest
echo "Adresa destului: $dest"

# Actiuni posibile
case "$action" in
    "mint")
        echo "Crearea de $qty IBT pe Sui pentru Ethereum..."
        sui client call --package "$pack_id" --module IBTToken --function mint_to_destination --args "$admin_cap" "$dest" "$qty" --gas-budget 10000000
        ;;

    "burn")
        echo "Schimbarea la contul conectat: $dest"
        sui client switch --address "$dest"

        echo "Arderea a $qty IBT pe Sui pentru Ethereum..."
        sui client call --package "$pack_id" --module IBTToken --function burn_exact_for_bridge --args "$admin_cap" "$coin_id" "$qty" "\"Ethereum\"" --gas-budget 10000000
        ;;

    "eth")
        echo "Crearea de $qty IBT pe Ethereum pentru $dest..."
        wei_qty=$(cast --to-wei "$qty" ether)
        cast send --rpc-url "$eth_url" --private-key "$anvil_pk" "$deploy_to" "mintForBridge(address,uint256,string)" "$dest" "$wei_qty" "\"Sui\""
        ;;

    *)
        echo "err"
        exit 1
        ;;
esac
