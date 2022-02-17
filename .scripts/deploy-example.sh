#!/bin/bash

cd "$(dirname $BASH_SOURCE)" || exit 1

. "./dfx-identity.sh"
. "./token-defaults.sh"

if [[ -z $1 ]];
then
    printf "💎 DIP-721 Deploy example script:\n\n   usage: npm run dip721:deploy-example <local|ic|other> [reinstall]\n\n"

    exit 1;
fi

# Args
NETWORK=$1
MODE=$2

# Defaults
TOKENSTRING="$DEFAULT_TOKEN_SYMBOL"
TOKENNAME="$DEFAULT_TOKEN_NAME"

OWNER_PRINCIPAL_ID="$DEFAULT_PRINCIPAL_ID"
CAP_HISTORY_ROUTER_ID=lj532-6iaaa-aaaah-qcc7a-cai

printf "💎 DIP-721 Deploy\n\n"
printf "💡 Deploy to network (%s), the token (%s) with name (%s) of owner principal (%s)" "$NETWORK" "$TOKENSTRING" "$TOKENNAME" "$OWNER_PRINCIPAL_ID"

# Overrides default Canister Cap Id
if [[ $NETWORK == "local" ]]; then
    (
        cd ..
        . "./.scripts/required/cap-verification.sh"
    )
fi

if [[ "$MODE" == "reinstall" ]]; then
    printf "🤖 Reinstalling canister!\n\n"

    npm run dip721:deploy-nft "$NETWORK" "$OWNER_PRINCIPAL_ID" "$TOKENSTRING" "$TOKENNAME" "$CAP_HISTORY_ROUTER_ID" "reinstall"

    exit 0
fi

npm run dip721:deploy-nft "$NETWORK" "$OWNER_PRINCIPAL_ID" "$TOKENSTRING" "$TOKENNAME" "$CAP_HISTORY_ROUTER_ID"

NFT_CANISTER_ID=$(cd .. && dfx canister --network "$NETWORK" id nft)

printf "💡 The Non fungible token canister id is (%s)" "$NFT_CANISTER_ID"

npm run dip721:set-controllers "$NETWORK" "$OWNER_PRINCIPAL_ID" "$NFT_CANISTER_ID"