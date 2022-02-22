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

NFT_CANISTER_ID=$(dfx canister --network "$NETWORK" id nft)
NFT_CANISTER_ID_EXIST_STATUS=$?

# If a NFT Canister has not yet been deployed
# create canister with required controllers
if [[ "$NFT_CANISTER_ID_EXIST_STATUS" -ne 0 ]];
then
  dfx canister --no-wallet \
    create nft --controller "$OWNER_PRINCIPAL_ID"

  # Assign the Canister Id
  NFT_CANISTER_ID=$(dfx canister --network "$NETWORK" id nft)

  # Note that the controller settings is important
  # you should have at least an identity you control
  # and the canister itself as controllers
  dfx canister --no-wallet \
    --network "$NETWORK" \
    update-settings \
      --controller "$OWNER_PRINCIPAL_ID" \
      --controller "$NFT_CANISTER_ID" \
    "$NFT_CANISTER_ID"

elif [[ "$MODE" == "reinstall" ]]; then
  OPTIONAL+=(--mode reinstall)
fi

printf "🤖 The created NFT Canster id is %s" "$NFT_CANISTER_ID"

dfx deploy --no-wallet \
  --network "$NETWORK" \
  nft --argument "(
  principal \"$OWNER_PRINCIPAL_ID\",
  \"$DIP721_TOKEN_SHORT\",
  \"$DIP721_TOKEN_NAME\",
  principal \"$IC_HISTORY_ROUTER_ID\"
)" \
"${OPTIONAL[@]}"

printf "🌈 Deployed NFT Canister ID (%s)\n" "$NFT_CANISTER_ID"