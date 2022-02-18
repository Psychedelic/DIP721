#!/bin/bash

cd "$(dirname $BASH_SOURCE)" || exit 1

cd ../../ || exit 1

# Args
NETWORK=$1
CONTROLLER_MAIN=$2
DIP721_TOKEN_CONTRACT_ID=$3

printf "🤖 Set controllers of main (%s) and 
DIP-721 Contract id (%s)" "$CONTROLLER_MAIN" "$DIP721_TOKEN_CONTRACT_ID"

dfx canister --no-wallet \
--network "$NETWORK" \
call aaaaa-aa \
update_settings "(
  record {
    canister_id=principal \"$DIP721_TOKEN_CONTRACT_ID\";
    settings=record {
      controllers=opt vec{
        principal \"$CONTROLLER_MAIN\";
        principal \"$DIP721_TOKEN_CONTRACT_ID\";
      }
    }
  }
)"