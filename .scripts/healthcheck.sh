#!/bin/bash


printf "💎 DIP-721 Healthcheck\n\n"

CANISTER_NAME="nft"
ALICE_HOME="./temp/alice-home"
BOB_HOME="./temp/bob-home"
mkdir $ALICE_HOME &>/dev/null
mkdir $BOB_HOME &>/dev/null
ALICE_PRINCIPAL_ID=$(HOME=$ALICE_HOME dfx identity get-principal)
BOB_PRINCIPAL_ID=$(HOME=$BOB_HOME dfx identity get-principal)

deploy() {
  printf "🤖 Deploying the Dip721 canister\n\n"

  ./deploy.sh local
  
  printf "\n\n"
}

info() {
  printf "🤖 Process Principal info\n"

  printf "🙋‍♀️ Principal ids\n"
  printf "Alice: %s\n" "$ALICE_PRINCIPAL_ID"
  printf "Bob: %s \n" "$BOB_PRINCIPAL_ID"

  printf "\n"
}

####################################
#
# BEGIN OF DIP-721
# Find the specification in https://github.com/Psychedelic/DIP721/main/docs/spec.md
#
####################################

mintDip721() {
  printf "🤖 Call the mintDip721\n"

  mint_for="$ALICE_PRINCIPAL_ID"

  dfx canister --no-wallet call $CANISTER_NAME mintDip721 "(principal \"$mint_for\", vec{})"

  printf "\n"
}

supportedInterfacesDip721() {
  printf "🤖 Call the supportedInterfacesDip721\n"

  dfx canister --no-wallet call $CANISTER_NAME supportedInterfacesDip721
}

nameDip721() {
  printf "🤖 Call the nameDip721\n"
  
  dfx canister --no-wallet call $CANISTER_NAME nameDip721
}

symbolDip721() {
  printf "🤖 Call the symbolDip721\n"
  
  dfx canister --no-wallet call $CANISTER_NAME symbolDip721
}

balanceOfDip721() {
  printf "🤖 Call the balanceOfDip721\n"

  user="$ALICE_PRINCIPAL_ID"

  dfx canister --no-wallet call $CANISTER_NAME balanceOfDip721 "(principal \"$user\")"
}

ownerOfDip721() {
  printf "🤖 Call the ownerOfDip721\n"

  token_id="0"
  dfx canister --no-wallet call $CANISTER_NAME ownerOfDip721 "($token_id)"
}

safeTransferFromDip721() {
  printf "🤖 Call the safeTransferFromDip721\n"

  from_principal="$ALICE_PRINCIPAL_ID"
  to_principal="$BOB_PRINCIPAL_ID"
  token_id="0"

  HOME=$ALICE_HOME dfx canister --no-wallet call $CANISTER_NAME safeTransferFromDip721 "(principal \"$from_principal\", principal \"$to_principal\", $token_id)"
}

transferFromDip721() {
  printf "🤖 Call the transferFromDip721\n"
  
  from_principal="$BOB_PRINCIPAL_ID"
  to_principal="$ALICE_PRINCIPAL_ID"
  token_id="0"

  HOME=$BOB_HOME dfx canister --no-wallet call $CANISTER_NAME transferFromDip721 "(principal \"$from_principal\", principal \"$to_principal\", $token_id)"
}

logoDip721() {
  printf "🤖 Call the logoDip721\n"

  dfx canister --no-wallet call $CANISTER_NAME logoDip721
}

totalSupplyDip721() {
  printf "🤖 Call the totalSupplyDip721\n"

  dfx canister --no-wallet call $CANISTER_NAME totalSupplyDip721
}

getMetadataDip721() {
  printf "🤖 Call the getMetadataDip721\n"

  token_id="0"
  
  dfx canister --no-wallet call $CANISTER_NAME getMetadataDip721 "($token_id)"
}

getMetadataForUserDip721() {
  printf "🤖 Call the getMetadataForUserDip721\n"

  user="$ALICE_PRINCIPAL_ID"

  dfx canister --no-wallet call $CANISTER_NAME getMetadataForUserDip721 "(principal \"$user\")"
}

### END OF DIP-721 ###

metadata() {
  printf "🤖 Call the metadata\n"

  token_id="0"

  dfx canister --no-wallet call $CANISTER_NAME metadata "(\"$token_id\")"
}

bearer() {
  printf "🤖 Call the bearer\n"

  token_id="0"

  dfx canister --no-wallet call $CANISTER_NAME bearer "(\"$token_id\")"
}

supply() {
  printf "🤖 Call the supply\n"

  token_id="0"
  dfx canister --no-wallet call $CANISTER_NAME supply "(\"$token_id\")"
}

getAllMetadataForUser() {
  printf "🤖 Call the getAllMetadataForUser\n"

  user="$ALICE_PRINCIPAL_ID"
  dfx canister --no-wallet call $CANISTER_NAME getAllMetadataForUser "(variant {\"principal\" = principal \"$user\"})"
}

transfer() {
  printf "🤖 Call the transfer\n"

  from_principal="$ALICE_PRINCIPAL_ID"
  to_principal="$BOB_PRINCIPAL_ID"
  token_id="0"

  HOME=$ALICE_HOME dfx canister --no-wallet call $CANISTER_NAME transfer "(record {amount = 1; from = variant {\"principal\" = principal \"$from_principal\"}; memo = vec{}; notify = true; SubAccount = null; to = variant {\"principal\" = principal \"$to_principal\"}; token = \"$token_id\"})"
}

tests() {
  deploy
  info
  mintDip721
  supportedInterfacesDip721
  nameDip721
  symbolDip721
  getMetadataDip721
  getMetadataForUserDip721
  bearer
  supply
  totalSupplyDip721
  balanceOfDip721
  ownerOfDip721
  safeTransferFromDip721
  transferFromDip721
  transfer
}

tests

exit 0