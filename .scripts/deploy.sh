#!/bin/bash

source "./.scripts/dfx-identity.sh"

if [[ -z $1 ]];
then
    printf "💎 DIP-721 Deploy Script:\n\n   usage: npm run dip721:deploy <local|ic|other> [reinstall]\n\n"

    exit 1;
fi

# Args
NETWORK=$1
MODE=$2

# Defaults
TOKENSTRING="TKN"
TOKENNAME="Non Fungible Token"

OWNER_PRINCIPAL_ID="$DEFAULT_PRINCIPAL_ID"
CAP_HISTORY_ROUTER_ID=lj532-6iaaa-aaaah-qcc7a-cai

printf "💎 DIP-721 Deploy\n\n"
printf "💡 Deploy to network (%s), the token (%s) with name (%s) of owner principal (%s)" "$NETWORK" "$TOKENSTRING" "$TOKENNAME" "$OWNER_PRINCIPAL_ID"

# Overrides default Canister Cap Id
if [[ $NETWORK == "local" ]]; then
    source "./.scripts/required/cap-verification.sh"
fi

if [[ "$MODE" == "reinstall" ]]; then
    printf "🤖 Reinstalling canister!\n\n"

    npm run dip721:deploy-nft "$NETWORK" "$OWNER_PRINCIPAL_ID" "$TOKENSTRING" "$TOKENNAME" "$CAP_HISTORY_ROUTER_ID" "reinstall"

    exit 0
fi

npm run dip721:deploy-nft "$NETWORK" "$OWNER_PRINCIPAL_ID" "$TOKENSTRING" "$TOKENNAME" "$CAP_HISTORY_ROUTER_ID"

NFT_CANISTER_ID=$(dfx canister --network "$NETWORK" id nft)

printf "💡 The Non fungible token canister id is (%s)" "$NFT_CANISTER_ID"

npm run dip721:set-controllers "$NETWORK" "$OWNER_PRINCIPAL_ID" "$NFT_CANISTER_ID"