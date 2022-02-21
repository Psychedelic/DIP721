#!/bin/bash

cd "$(dirname $BASH_SOURCE)" || exit 1

IC_HISTORY_ROUTER_ID=$(cd ../../cap && dfx canister id ic-history-router)

cd ../../ || exit 1

NETWORK=$1
OWNER_PRINCIPAL_ID=$2
DIP721_TOKEN_SHORT=$3
DIP721_TOKEN_NAME=$4
IC_HISTORY_ROUTER_ID=$5
MODE=$6

if [[ "$MODE" == "reinstall" ]]; then
  OPTIONAL+=(--mode reinstall)
fi

dfx canister --no-wallet \
  create nft --controller "$OWNER_PRINCIPAL_ID"

CREATED_NFT_CANISTER_ID=$(dfx canister  --network "$NETWORK" id nft)

printf "🤖 The created NFT Canster id is %s" "$CREATED_NFT_CANISTER_ID"

# Note that the controller settings is important
# you should have at least an identity you control
# and the canister itself as controllers
dfx canister --no-wallet \
  --network "$NETWORK" \
  update-settings \
    --controller "$OWNER_PRINCIPAL_ID" \
    --controller "$CREATED_NFT_CANISTER_ID" \
  "$CREATED_NFT_CANISTER_ID"

dfx deploy --no-wallet \
  --network "$NETWORK" \
  nft --argument "(
  principal \"$OWNER_PRINCIPAL_ID\",
  \"$DIP721_TOKEN_SHORT\",
  \"$DIP721_TOKEN_NAME\",
  principal \"$IC_HISTORY_ROUTER_ID\"
)" \
"${OPTIONAL[@]}"

printf "🌈 Deployed NFT Canister ID (%s)\n" "$(dfx canister id nft)"