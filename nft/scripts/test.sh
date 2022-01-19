#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")" || exit;

dfxDir="$HOME/.config/dfx"
candidDir="../../nft/candid"

NftID=""
DefaultPem=""
AlicePem=""
BobPem=""

NftCandidFile="${candidDir}/nft.did"
DefaultPrincipalId=$(dfx identity use Default 2>/dev/null;dfx identity get-principal)
AlicePrincipalId=""
BobPrincipalId=""
CharliePrincipalId=""

AliceAccountId=""
BobAccountId=""
CharlieAccountId=""
IcxPrologueNft="--candid=${NftCandidFile}"
dfx identity use default 2>/dev/null

nameToPrincipal=""

deploy() {
  eval "dfx deploy cap"
  principal=$(dfx identity get-principal)
  cap_principal=$(cat .dfx/local/canister_ids.json | jq ".cap.local" -r)
  
  echo "principal: $principal"
  echo "cap_principal: $cap_principal"
  #fn init(owner: Principal, symbol: String, name: String, history: Principal)
  eval "dfx deploy nft --argument '(principal \"$principal\", \"tkn\", \"token\", principal \"$cap_principal\")'"
}

# deploy

init() {
  # DefaultAccountId=$(dfx identity use default 2>/dev/null;dfx ledger account-id)

  DefaultPem="${dfxDir}/identity/default/identity.pem"

  NftID=$(dfx canister id nft)

  AlicePrincipalId=$(dfx identity use Alice 2>/dev/null;dfx identity get-principal)
  BobPrincipalId=$(dfx identity use Bob 2>/dev/null;dfx identity get-principal)
  CharliePrincipalId=$(dfx identity use Charlie 2>/dev/null;dfx identity get-principal)

  AlicePem="${dfxDir}/identity/Alice/identity.pem"
  BobPem="${dfxDir}/identity/Bob/identity.pem"
  # CharliePem="${dfxDir}/identity/Charlie/identity.pem"

  AliceAccountId=$(dfx identity use Alice 2>/dev/null;dfx ledger account-id)
  BobAccountId=$(dfx identity use Bob 2>/dev/null;dfx ledger account-id)
  CharlieAccountId=$(dfx identity use Charlie 2>/dev/null;dfx ledger account-id)

  nameToPrincipal=( ["Alice"]="$AlicePrincipalId" ["Bob"]="$BobPrincipalId" ["Charlie"]="$CharliePrincipalId" ["default"]="$DefaultPrincipalId")
  # nameToPem=( ["Alice"]="$AlicePem" ["Bob"]="$BobPem" ["Charlie"]="$CharliePem" ["Default"]="$DefaultPem")
}

info() {
  printf "\n\nPrincipal ids\n"
  printf "Alice: ${AlicePrincipalId}\n"
  printf "Bob: ${BobPrincipalId}\n"
  printf "Charlie: ${CharliePrincipalId}\n"

  printf "\n\nAccount ids\n"
  printf "Alice: ${AliceAccountId}\n"
  printf "Bob: ${BobAccountId}\n"
  printf "Charlie: ${CharlieAccountId}\n\n\n"

  printf "Principal ids: ${nameToPrincipal}\n\n\n"
  # printf "Name PEMs in order Alice, Bob, Charlie and Default \n"
  # for each in "${nameToPem[@]}"
  # do
  #   echo "$each"
  # done
}

### BEGIN OF DIP-721 ###
mintDip721() {
  mint_for="${AlicePrincipalId}"

  echo "🤖 [debug] $mint_for"

  icx --pem=$DefaultPem update $NftID mintDip721 "(principal \"$mint_for\", vec{})" $IcxPrologueNft
}

balanceOfDip721() {
  user="${AlicePrincipalId}"
  icx --pem=$DefaultPem query $NftID balanceOfDip721 "(principal \"$user\")" $IcxPrologueNft
}

ownerOfDip721() {
  token_id="0"
  icx --pem=$AlicePem query $NftID ownerOfDip721 "($token_id)" $IcxPrologueNft
}

safeTransferFromDip721() {
  from_principal="${BobPrincipalId}"
  to_principal="${AlicePrincipalId}"
  token_id="0"
  icx --pem=$BobPem update $NftID safeTransferFromDip721 "(principal \"$from_principal\", principal \"$to_principal\", $token_id)" $IcxPrologueNft
}

transferFromDip721() {
  from_principal="${AlicePrincipalId}"
  to_principal="${BobPrincipalId}"
  token_id="0"
  icx --pem=$AlicePem update $NftID transferFromDip721 "(principal \"$from_principal\", principal \"$to_principal\", $token_id)" $IcxPrologueNft
}

supportedInterfacesDip721() {
  icx --pem=$DefaultPem query $NftID supportedInterfacesDip721 "()" $IcxPrologueNft
}

logoDip721() {
  icx --pem=$DefaultPem query $NftID logoDip721 "()" $IcxPrologueNft
}

nameDip721() {
  icx --pem=$DefaultPem query $NftID nameDip721 "()" $IcxPrologueNft
}

symbolDip721() {
  icx --pem=$DefaultPem query $NftID symbolDip721 "()" $IcxPrologueNft
}

totalSupplyDip721() {
  icx --pem=$DefaultPem query $NftID totalSupplyDip721 "()" $IcxPrologueNft
}

getMetadataDip721() {
  token_id="0"
  icx --pem=$DefaultPem query $NftID getMetadataDip721 "($token_id)" $IcxPrologueNft
}

getMetadataForUserDip721() {
  user="${AlicePrincipalId}"
  icx --pem=$DefaultPem query $NftID getMetadataForUserDip721 "(principal \"$user\")" $IcxPrologueNft
}

### END OF DIP-721 ###

mintNFT() {
  mint_for="${AlicePrincipalId}"
  icx --pem=$DefaultPem update $NftID mintNFT "(record {metadata= opt variant {\"blob\" = vec{1;2;3}}; to= variant {\"principal\"= principal \"$mint_for\"}})" $IcxPrologueNft
}

metadata() {
  token_id="0"
  icx --pem=$DefaultPem query $NftID metadata \"$token_id\" $IcxPrologueNft
}

bearer() {
  token_id="0"
  icx --pem=$DefaultPem query $NftID bearer \"$token_id\" $IcxPrologueNft
}

supply() {
  token_id="0"
  icx --pem=$DefaultPem query $NftID supply \"$token_id\" $IcxPrologueNft
}

getAllMetadataForUser() {
  user="${AlicePrincipalId}"
  icx --pem=$DefaultPem query $NftID getAllMetadataForUser "(variant {\"principal\" = principal \"$user\"})" $IcxPrologueNft
}

transfer() {
  from_principal="${AlicePrincipalId}"
  from_pem="${AlicePem}"
  to_principal="${BobPrincipalId}"
  token_id="0"
  icx --pem=$from_pem update $NftID transfer "(record {amount = 1; from = variant {\"principal\" = principal \"$from_principal\"}; memo = vec{}; notify = true; SubAccount = null; to = variant {\"principal\" = principal \"$to_principal\"}; token = \"$token_id\"})" $IcxPrologueNft
}

tests() {
  printf "Running deploy..."
  deploy
  printf "Init..."
  init
  printf "info..."
  info
  printf "Running mintDip721..."
  mintDip721
  printf "Running supportedInterfacesDip721..."
  supportedInterfacesDip721
  printf "Running nameDip721..."
  nameDip721
  printf "Running symbolDip721..."
  symbolDip721
  printf "Running getMetadataDip721..."
  getMetadataDip721
  printf "Running getMetadataForUserDip721 for Alice..."
  getMetadataForUserDip721
  printf "Running bearer..."
  bearer
  printf "Running supply..."
  supply
  printf "Running totalSupply..."
  totalSupplyDip721
  printf "Running balanceOfDip721..."
  balanceOfDip721
  printf "Rinning ownerOfDip721..."
  ownerOfDip721
  printf "Running transferFromDip721 Alice to Bob..."
  transferFromDip721
  printf "Running safeTransferFromDip721 Bob to Alice..."
  safeTransferFromDip721
  printf "Running transfer Alice to Bob..."
  transfer

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