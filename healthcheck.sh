#!/bin/bash

[ "$DEBUG" == 1 ] && set -x

source "${BASH_SOURCE%/*}/.scripts/required.sh"
source "${BASH_SOURCE%/*}/.scripts/dfx-identity.sh"

NftCandidFile="./nft/candid/nft.did"
IcxPrologueNft="--candid=${NftCandidFile}"

nonFungibleContractAddress=""
nft_token_id_for_alice=""

deployDip721() {
  printf "🤖 Call deployDip721\n"

  ownerPrincipalId=$1
  tokenSymbol=$2
  tokenName=$3

  printf "🤖 Deploying DIP721 NFT with %s %s %s\n" "$ownerPrincipalId" "$tokenSymbol" "$tokenName"

  yarn dip721:deploy-nft "$ownerPrincipalId" "$tokenSymbol" "$tokenName"

  nonFungibleContractAddress=$(dfx canister id nft)

  printf "NFT Contract address has nonFungibleContractAddress (%s)\n" "$nonFungibleContractAddress"
}

updateControllers() {
  printf "🤖 Call updateControllers\n"

  ownerPrincipalId=$1
  nonFungibleContractAddress=$2

  printf "🤖 Set contract (%s) controller as (%s)\n" "$nonFungibleContractAddress" "$ownerPrincipalId"

  yarn dip721:set-controllers "$ownerPrincipalId" "$nonFungibleContractAddress"
}

mintDip721() {
  printf "🤖 Call the mintDip721\n"

  # Args
  name="$1"
  mint_for="$2"

  printf "🤖 The mintDip721 has nonFungibleContractAddress (%s), mint_for user (%s) (%s)\n" "$nonFungibleContractAddress" "$name" "$mint_for"

  result=$(
    icx --pem="$DEFAULT_PEM" \
      update "$nonFungibleContractAddress" \
      mintDip721 "(
        principal \"$mint_for\",
        vec{}
      )" \
    "$IcxPrologueNft"
  )

  nft_token_id_for_alice=$(echo "$result" | pcregrep -o1  'token_id = ([0-9]*)')

  printf "🤖 Minted Dip721 for user %s, has token ID (%s)\n" "$name" "$nft_token_id_for_alice"

  printf "🤖 The Balance for user %s of id (%s)\n" "$name" "$mint_for"

  icx --pem="$DEFAULT_PEM" \
    query "$nonFungibleContractAddress" \
    balanceOfDip721 "(
      principal \"$mint_for\"
    )" \
  "$IcxPrologueNft"

  printf "🤖 User %s getMetadataForUserDip721 is\n" "$name"

  icx --pem="$DEFAULT_PEM" \
    query "$nonFungibleContractAddress" \
    getMetadataForUserDip721 "(
      principal \"$mint_for\"
    )" \
  "$IcxPrologueNft"

  printf "\n"
}

supportedInterfacesDip721() {
  printf "🤖 Call the supportedInterfacesDip721\n"

  pem=$1
  nonFungibleContractAddress=$2

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    supportedInterfacesDip721 "()" \
  $IcxPrologueNft
}

nameDip721() {
  printf "🤖 Call the nameDip721\n"
  
  pem=$1
  nonFungibleContractAddress=$2

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    nameDip721 "()" \
  $IcxPrologueNft
}

symbolDip721() {
  printf "🤖 Call the symbolDip721\n"
  
  pem=$1

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    symbolDip721 "()" \
  $IcxPrologueNft
}

balanceOfDip721() {
  printf "🤖 Call the balanceOfDip721\n"

  pem=$1
  user=$2

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    balanceOfDip721 "(
      principal \"$user\"
    )" \
  $IcxPrologueNft
}

ownerOfDip721() {
  printf "🤖 Call the ownerOfDip721\n"

  pem=$1
  nonFungibleContractAddress=$2
  token_id=$3

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    ownerOfDip721 "($token_id)" \
  $IcxPrologueNft
}

safeTransferFromDip721() {
  printf "🤖 Call the safeTransferFromDip721\n"

  pem=$1
  from_principal=$2
  to_principal=$3
  token_id=$4

  icx --pem="$pem" \
    update "$nonFungibleContractAddress" \
    safeTransferFromDip721 "(
      principal \"$from_principal\",
      principal \"$to_principal\",
      $token_id
    )" \
  "$IcxPrologueNft"
}

transferFromDip721() {
  printf "🤖 Call the transferFromDip721\n"

  pem=$1
  from_principal=$2
  to_principal=$3
  token_id=$4

  icx --pem="$pem" \
    update "$nonFungibleContractAddress" \
    transferFromDip721 "(
      principal \"$from_principal\",
      principal \"$to_principal\",
      $token_id
    )" \
  "$IcxPrologueNft"
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

totalSupplyDip721() {
  printf "🤖 Call the totalSupplyDip721\n"

  pem=$1
  nonFungibleContractAddress=$2

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    totalSupplyDip721 "()" \
  "$IcxPrologueNft"
}

getMetadataDip721() {
  printf "🤖 Call the getMetadataDip721\n"

  pem=$1
  nonFungibleContractAddress=$2
  token_id=$3
  
  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    getMetadataDip721 "($token_id)" \
  "$IcxPrologueNft"
}

getMetadataForUserDip721() {
  printf "🤖 Call the getMetadataForUserDip721\n"

  pem=$1
  nonFungibleContractAddress=$2
  user=$3

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    getMetadataForUserDip721 "(
      principal \"$user\"
    )" \
  "$IcxPrologueNft"
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

  pem=$1
  nonFungibleContractAddress=$2
  token_id=$3

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    bearer "(\"$token_id\")" \
  $IcxPrologueNft
}

supply() {
  printf "🤖 Call the supply\n"

  pem=$1
  nonFungibleContractAddress=$2
  token_id=$3

  icx --pem="$pem" \
    query "$nonFungibleContractAddress" \
    supply "(\"$token_id\")" \
  "$IcxPrologueNft"
}

transfer() {
  printf "🤖 Call the transfer\n"

  pem=$1
  from_principal=$2
  to_principal=$3
  token_id=$4

  icx --pem="$pem" \
    update "$nonFungibleContractAddress" \
    transfer "(
      record {
        amount = 1;
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
    )" \
  "$IcxPrologueNft"
}

tests() {
  deployDip721 "$DEFAULT_PRINCIPAL_ID" "¥" "Yuppi"

  updateControllers "$DEFAULT_PRINCIPAL_ID" "$nonFungibleContractAddress"

  mintDip721 "Alice" "$ALICE_PRINCIPAL_ID"

  supportedInterfacesDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress"

  nameDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress"

  symbolDip721 "$DEFAULT_PEM"

  getMetadataDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress" "$nft_token_id_for_alice"

  getMetadataForUserDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress" "$ALICE_PRINCIPAL_ID" 

  bearer "$DEFAULT_PEM" "$nonFungibleContractAddress" "$nft_token_id_for_alice"

  supply "$DEFAULT_PEM" "$nonFungibleContractAddress" "$ALICE_PRINCIPAL_ID"

  totalSupplyDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress"

  balanceOfDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress"
  
  ownerOfDip721 "$DEFAULT_PEM" "$nonFungibleContractAddress" "$nft_token_id_for_alice"

  safeTransferFromDip721 "$ALICE_PEM" "$ALICE_PRINCIPAL_ID" "$BOB_PRINCIPAL_ID" "$nft_token_id_for_alice"

  transferFromDip721 "$BOB_PEM" "$BOB_PRINCIPAL_ID" "$ALICE_PRINCIPAL_ID" "$nft_token_id_for_alice"

  transfer "$ALICE_PEM" "$ALICE_PRINCIPAL_ID" "$BOB_PRINCIPAL_ID" "$nft_token_id_for_alice"

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

exit 0