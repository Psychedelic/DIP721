#!/bin/bash

source "${BASH_SOURCE%/*}/.scripts/required.sh"

dfxDir="$HOME/.config/dfx"
NftCandidFile="./nft/candid/nft.did"

NftID=""

# PEM files
DefaultPem=""
AlicePem=""
BobPem=""

AlicePrincipalId=""
BobPrincipalId=""
CharliePrincipalId=""

AliceAccountId=""
BobAccountId=""
CharlieAccountId=""

IcxPrologueNft="--candid=${NftCandidFile}"

deploy() {
  printf "🤖 Deploying the NFT Canister\n"

  dfx deploy --no-wallet nft --argument "(principal \"$DFX_IDENTITY_PRINCIPAL\", \"tkn\", \"token\", principal \"$CANISTER_CAP_ID\")"

  printf "\n\n"
}

# deploy

init() {
  printf "🤖 Initialisation of environment process variables\n"

  DefaultPem="${dfxDir}/identity/default/identity.pem"

  NftID=$(dfx canister id nft)

  # ⚠️ Warning: This changes the identity state, set back to initial state afterwards
  AlicePrincipalId=$(dfx identity use Alice 2>/dev/null;dfx identity get-principal)
  BobPrincipalId=$(dfx identity use Bob 2>/dev/null;dfx identity get-principal)
  CharliePrincipalId=$(dfx identity use Charlie 2>/dev/null;dfx identity get-principal)

  AlicePem="${dfxDir}/identity/alice/identity.pem"
  BobPem="${dfxDir}/identity/bob/identity.pem"

  AliceAccountId=$(dfx identity use Alice 2>/dev/null;dfx ledger account-id)
  BobAccountId=$(dfx identity use Bob 2>/dev/null;dfx ledger account-id)
  CharlieAccountId=$(dfx identity use Charlie 2>/dev/null;dfx ledger account-id)

  # ⚠️ Warning: Resets the identity state
  dfx identity use default

  printf "\n"
}

info() {
  printf "🤖 Process Principal info\n"

  printf "🙋‍♀️ Principal ids\n"
  printf "Alice: %s\n" "$AlicePrincipalId"
  printf "Bob: %s \n" "$BobPrincipalId"
  printf "Charlie %s\n" "$CharliePrincipalId"

  printf "\n"

  printf "🙋‍♀️ Account ids\n"
  printf "Alice: %s\n" "$AliceAccountId"
  printf "Bob: %s\n" "$BobAccountId"
  printf "Charlie: %s\n" "$CharlieAccountId"

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

  mint_for="${AlicePrincipalId}"

  icx --pem="$DefaultPem" update "$NftID" mintDip721 "(principal \"$mint_for\", vec{})" "$IcxPrologueNft"

  printf "\n"
}

supportedInterfacesDip721() {
  printf "🤖 Call the supportedInterfacesDip721\n"

  icx --pem="$DefaultPem" query "$NftID" supportedInterfacesDip721 "()" $IcxPrologueNft
}

nameDip721() {
  printf "🤖 Call the nameDip721\n"
  
  icx --pem="$DefaultPem" query "$NftID" nameDip721 "()" $IcxPrologueNft
}

symbolDip721() {
  printf "🤖 Call the symbolDip721\n"
  
  icx --pem="$DefaultPem" query "$NftID" symbolDip721 "()" $IcxPrologueNft
}

balanceOfDip721() {
  printf "🤖 Call the balanceOfDip721\n"

  user="${AlicePrincipalId}"

  icx --pem="$DefaultPem" query "$NftID" balanceOfDip721 "(principal \"$user\")" $IcxPrologueNft
}

ownerOfDip721() {
  printf "🤖 Call the ownerOfDip721\n"

  token_id="0"
  icx --pem="$DefaultPem" query "$NftID" ownerOfDip721 "($token_id)" $IcxPrologueNft
}

safeTransferFromDip721() {
  printf "🤖 Call the safeTransferFromDip721\n"

  from_principal="${AlicePrincipalId}"
  to_principal="${BobPrincipalId}"
  token_id="0"
  
  icx --pem="$AlicePem" update "$NftID" safeTransferFromDip721 "(principal \"$from_principal\", principal \"$to_principal\", $token_id)" "$IcxPrologueNft"
}

transferFromDip721() {
  printf "🤖 Call the transferFromDip721\n"
  
  from_principal="${AlicePrincipalId}"
  to_principal="${BobPrincipalId}"
  token_id="0"

  icx --pem="$BobPem" update "$NftID" transferFromDip721 "(principal \"$from_principal\", principal \"$to_principal\", $token_id)" "$IcxPrologueNft"
}

logoDip721() {
  printf "🤖 Call the logoDip721\n"

  icx --pem="$DefaultPem" query "$NftID" logoDip721 "()" "$IcxPrologueNft"
}

totalSupplyDip721() {
  printf "🤖 Call the totalSupplyDip721\n"

  icx --pem="$DefaultPem" query "$NftID" totalSupplyDip721 "()" "$IcxPrologueNft"
}

getMetadataDip721() {
  printf "🤖 Call the getMetadataDip721\n"

  token_id="0"
  
  icx --pem="$DefaultPem" query "$NftID" getMetadataDip721 "($token_id)" "$IcxPrologueNft"
}

getMetadataForUserDip721() {
  printf "🤖 Call the getMetadataForUserDip721\n"

  user="${AlicePrincipalId}"

  icx --pem="$DefaultPem" query "$NftID" getMetadataForUserDip721 "(principal \"$user\")" "$IcxPrologueNft"
}

### END OF DIP-721 ###

mintNFT() {
  printf "🤖 Call the mintNFT\n"

  mint_for="${AlicePrincipalId}"

  icx --pem="$DefaultPem" update "$NftID" mintNFT "(record {metadata= opt variant {\"blob\" = vec{1;2;3}}; to= variant {\"principal\"= principal \"$mint_for\"}})" "$IcxPrologueNft"
}

metadata() {
  printf "🤖 Call the metadata\n"

  token_id="0"

  icx --pem="$DefaultPem" query "$NftID" metadata \"$token_id\" "$IcxPrologueNft"
}

bearer() {
  printf "🤖 Call the bearer\n"

  token_id="0"

  icx --pem="$DefaultPem" query "$NftID" bearer \"$token_id\" $IcxPrologueNft
}

supply() {
  printf "🤖 Call the supply\n"

  token_id="0"
  icx --pem="$DefaultPem" query "$NftID" supply \"$token_id\" "$IcxPrologueNft"
}

getAllMetadataForUser() {
  printf "🤖 Call the getAllMetadataForUser\n"

  user="${AlicePrincipalId}"
  icx --pem="$DefaultPem" query "$NftID" getAllMetadataForUser "(variant {\"principal\" = principal \"$user\"})" "$IcxPrologueNft"
}

transfer() {
  printf "🤖 Call the transfer\n"

  from_principal="${AlicePrincipalId}"
  from_pem="${AlicePem}"
  to_principal="${BobPrincipalId}"
  token_id="0"

  icx --pem="$from_pem" update "$NftID" transfer "(record {amount = 1; from = variant {\"principal\" = principal \"$from_principal\"}; memo = vec{}; notify = true; SubAccount = null; to = variant {\"principal\" = principal \"$to_principal\"}; token = \"$token_id\"})" "$IcxPrologueNft"
}

tests() {
  deploy
  init
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

  # TODO: [Canister rkp4c-7iaaa-aaaaa-aaaca-cai] Panicked at 'unable to find previous owner', nft/src/ledger.rs:121:14
  # transferFromDip721
  safeTransferFromDip721

  # TODO: throws not admin
  # transfer

  ### not testable
  # printf "Running mintNFT"
  # mintNFT
  # printf "Running logoDip721..."
  # logoDip721
  # printf "Running metadata...."
  # metadata
  # printf "Running getAllMetadataForUser..."
  # getAllMetadataForUser
}

tests

exit 0