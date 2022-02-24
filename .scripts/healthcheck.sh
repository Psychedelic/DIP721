#!/bin/bash

printf "DIP721 Copyright (C) 2022 Fleek LLC
    This program comes with ABSOLUTELY NO WARRANTY
    This is free software, and you are welcome to redistribute it
    under certain conditions;\n\n"

(cd "$(dirname $BASH_SOURCE)" && cd ..) || exit 1

set -e # exit when a command fails

[ "$DEBUG" == 1 ] && set -x

. ".scripts/required/healthcheck-run-verification.sh"
. ".scripts/required/cap-verification.sh"
. ".scripts/dfx-identity.sh"
. ".scripts/token-defaults.sh"

NftCandidFile="./nft/candid/nft.did"
IcxPrologueNft="--candid=${NftCandidFile}"
DEFAULT_PRINCIPAL_ID=$(dfx identity get-principal)

nonFungibleContractAddress=""
nft_token_id_for_alice=""

deployDip721() {
  printf "🤖 Call deployDip721\n"

  callerHome=$1
  ownerPrincipalId=$2
  tokenSymbol=$3
  tokenName=$4

  printf "🤖 Deploying DIP721 NFT with %s %s %s\n" "$ownerPrincipalId" "$tokenSymbol" "$tokenName"

  npm run dip721:deploy-nft "local" "$ownerPrincipalId" "$tokenSymbol" "$tokenName" "$CAP_HISTORY_ROUTER_ID"

  nonFungibleContractAddress=$(dfx canister id nft)

  printf "NFT Contract address has nonFungibleContractAddress (%s)\n" "$nonFungibleContractAddress"
}

verifiyControllers() {
  printf "🤖 Call verifiyControllers\n"

  callerHome=$1
  ownerPrincipalId=$2
  nonFungibleContractAddress=$3

  result=$(dfx canister --no-wallet status "$nonFungibleContractAddress" 2>&1)

  if [[ ! $result =~ $ownerPrincipalId ]] || [[ ! $result =~ $nonFungibleContractAddress ]]; then
    printf "👹 Oops! Missing controllers..."

    exit 1
  fi
}

mintDip721() {
  printf "🤖 Call the mintDip721\n"

  callerHome=$1
  name=$2
  mint_for=$3

  printf "🤖 The mintDip721 has nonFungibleContractAddress (%s), mint_for user (%s) (%s)\n" "$nonFungibleContractAddress" "$name" "$mint_for"

  result=$(
    HOME=$callerHome \
    dfx canister --no-wallet \
      call "$nonFungibleContractAddress" \
      mintDip721 "(
        principal \"$mint_for\",
        vec{}
      )"
  )

  nft_token_id_for_alice=$(echo "$result" | pcregrep -o1  'token_id = ([0-9]*)')

  printf "🤖 Minted Dip721 for user %s, has token ID (%s)\n" "$name" "$nft_token_id_for_alice"

  printf "🤖 The Balance for user %s of id (%s)\n" "$name" "$mint_for"

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    balanceOfDip721 "(
      principal \"$mint_for\"
    )"

  printf "🤖 User %s getMetadataForUserDip721 is\n" "$name"

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    getMetadataForUserDip721 "(
      principal \"$mint_for\"
    )"

  printf "\n"
}

supportedInterfacesDip721() {
  printf "🤖 Call the supportedInterfacesDip721\n"

  callerHome=$1
  nonFungibleContractAddress=$2

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    supportedInterfacesDip721 "()"
}

nameDip721() {
  printf "🤖 Call the nameDip721\n"
  
  callerHome=$1
  nonFungibleContractAddress=$2

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    nameDip721 "()"
}

symbolDip721() {
  printf "🤖 Call the symbolDip721\n"
  
  callerHome=$1

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    symbolDip721 "()"
}

balanceOfDip721() {
  printf "🤖 Call the balanceOfDip721\n"

  callerHome=$1
  user=$2

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    balanceOfDip721 "(
      principal \"$user\"
    )"
}

ownerOfDip721() {
  printf "🤖 Call the ownerOfDip721\n"

  callerHome=$1
  nonFungibleContractAddress=$2
  token_id=$3

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    ownerOfDip721 "($token_id)" 
}

safeTransferFromDip721() {
  printf "🤖 Call the safeTransferFromDip721\n"

  callerHome=$1
  from_principal=$2
  to_principal=$3
  token_id=$4

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    safeTransferFromDip721 "(
      principal \"$from_principal\",
      principal \"$to_principal\",
      $token_id
    )"
}

transferFromDip721() {
  printf "🤖 Call the transferFromDip721\n"

  callerHome=$1
  from_principal=$2
  to_principal=$3
  token_id=$4

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    transferFromDip721 "(
      principal \"$from_principal\",
      principal \"$to_principal\",
      $token_id
    )"
}

logoDip721() {
  printf "🤖 Call the logoDip721\n"

  pem=$1
  nonFungibleContractAddress=$2

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    logoDip721 "()" \
  "$IcxPrologueNft"
}

getMetadataDip721() {
  printf "🤖 Call the getMetadataDip721\n"

  callerHome=$1
  nonFungibleContractAddress=$2
  token_id=$3
  
  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    getMetadataDip721 "($token_id)"
}

getMetadataForUserDip721() {
  printf "🤖 Call the getMetadataForUserDip721\n"

  callerHome=$1
  nonFungibleContractAddress=$2
  user=$3

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    getMetadataForUserDip721 "(
      principal \"$user\"
    )"
}

metadata() {
  printf "🤖 Call the metadata\n"

  pem=$1
  nonFungibleContractAddress=$2
  token_id=$3

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    metadata "(\"$token_id\")" \
  "$IcxPrologueNft"
}

bearer() {
  printf "🤖 Call the bearer\n"

  callerHome=$1
  nonFungibleContractAddress=$2
  token_id=$3

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    bearer "(\"$token_id\")"
}

supply() {
  printf "🤖 Call the supply\n"

  callerHome=$1
  nonFungibleContractAddress=$2
  token_id=$3

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    supply "(\"$token_id\")"
}

totalSupplyDip721() {
  printf "🤖 Call the totalSupplyDip721\n"

  callerHome=$1
  nonFungibleContractAddress=$2

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    totalSupplyDip721 "()" 
}

transfer() {
  printf "🤖 Call the transfer\n"

  callerHome=$1
  from_principal=$2
  to_principal=$3
  token_id=$4
  amount=$5

  HOME=$callerHome \
  dfx canister --no-wallet \
    call "$nonFungibleContractAddress" \
    transfer "(
      record {
        amount = $amount;
        from = variant {
          \"principal\" = principal \"$from_principal\"
        };
        memo = vec{};
        notify = true;
        SubAccount = null;
        to = variant {
         \"principal\" = principal \"$to_principal\"
        };
        token = \"$token_id\"
      }
    )"
}

tests() {
  deployDip721 "$DEFAULT_HOME" "$DEFAULT_PRINCIPAL_ID" "$DEFAULT_TOKEN_SYMBOL" "$DEFAULT_TOKEN_NAME"

  verifiyControllers "$DEFAULT_HOME" "$DEFAULT_PRINCIPAL_ID" "$nonFungibleContractAddress"

  mintDip721 "$DEFAULT_HOME" "Alice" "$ALICE_PRINCIPAL_ID"

  supportedInterfacesDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress"

  nameDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress"

  symbolDip721 "$DEFAULT_HOME"

  getMetadataDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress" "$nft_token_id_for_alice"

  getMetadataForUserDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress" "$ALICE_PRINCIPAL_ID" 

  bearer "$DEFAULT_HOME" "$nonFungibleContractAddress" "$nft_token_id_for_alice"

  supply "$DEFAULT_HOME" "$nonFungibleContractAddress" "$ALICE_PRINCIPAL_ID"

  totalSupplyDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress"

  balanceOfDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress"
  
  ownerOfDip721 "$DEFAULT_HOME" "$nonFungibleContractAddress" "$nft_token_id_for_alice"

  safeTransferFromDip721 "$ALICE_HOME" "$ALICE_PRINCIPAL_ID" "$BOB_PRINCIPAL_ID" "$nft_token_id_for_alice"

  transferFromDip721 "$BOB_HOME" "$BOB_PRINCIPAL_ID" "$ALICE_PRINCIPAL_ID" "$nft_token_id_for_alice"

  transfer "$ALICE_HOME" "$ALICE_PRINCIPAL_ID" "$BOB_PRINCIPAL_ID" "$nft_token_id_for_alice" 1

  ### not testable
  # printf "Running mintNFT"
  # mintNFT
  # printf "Running logoDip721..."
  # logoDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress"
  # printf "Running metadata...."
  # metadata "$DEFAULT_PEM" "$nonFungibleContractAddress" "$nft_token_id_for_alice"
  # printf "Running getAllMetadataForUser..."
  # getAllMetadataForUser
}

tests