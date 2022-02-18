#!/bin/bash

cd "$(dirname $BASH_SOURCE)" || exit 1

cd ../../ || exit 1

# Args
NETWORK=$1
OWNER_PRINCIPAL_ID=$2
DIP721_TOKEN_CONTRACT_ID=$3

printf "🤖 Set controllers of owner (%s) and 
DIP-721 Contract id (%s)" "$OWNER_PRINCIPAL_ID" "$DIP721_TOKEN_CONTRACT_ID"

# Note that the controller settings is important
# you should have at least an identity you control
# and the canister itself as controllers
dfx canister --no-wallet \
  --network "$NETWORK" \
  update-settings \
    --controller "$OWNER_PRINCIPAL_ID" \
    --controller "$DIP721_TOKEN_CONTRACT_ID" \
  "$DIP721_TOKEN_CONTRACT_ID"