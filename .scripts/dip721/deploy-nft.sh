#!/bin/bash

cd $(dirname $BASH_SOURCE) || exit 1

IC_HISTORY_ROUTER_ID=$(cd ../../cap && dfx canister id ic-history-router)

cd ../../ || exit 1

# Args
OWNER_PRINCIPAL_ID=$1
DIP721_TOKEN_SHORT=$2
DIP721_TOKEN_NAME=$3

dfx deploy --no-wallet nft --argument "(
  principal \"$OWNER_PRINCIPAL_ID\",
  \"$DIP721_TOKEN_SHORT\",
  \"$DIP721_TOKEN_NAME\",
  principal \"$IC_HISTORY_ROUTER_ID\"
)"
