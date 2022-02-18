#!/bin/bash

DFX_IDENTITY_PRINCIPAL=""

if [[ $NODE_ENV != "ci" ]] && [[ ! SKIP_PROMPTS -eq 1 ]];
then
  # The extra space is intentional, used for alignment
  read -r -p "🤖 Is it ok to set dfx to use the default identity (required) [Y/n]? " CONT

  if [ "$CONT" = "Y" ]; then
    dfx identity use default

    DFX_IDENTITY_PRINCIPAL=$(dfx identity get-principal)
  else
    printf "🚩 The default Identity is a requirement, I'm afraid.\n\n"

    exit 1;
  fi
else
  dfx identity use default

  DFX_IDENTITY_PRINCIPAL=$(dfx identity get-principal)
fi

printf "🌈 The DFX Identity is set to (%s)\n\n" "$DFX_IDENTITY_PRINCIPAL"