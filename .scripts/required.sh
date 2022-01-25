#!/bin/bash

if [ -d ./.dfx/local/canisters/nft ] && [[ ! SKIP_PROMPTS -eq 1 ]];
then
  printf "🚩 The process seem to have run before, it's probably best to reset the state and only after run the healthcheck, please!\n\n"  

  # The extra space is intentional, used for alignment
  read -r -p "🤖 Would you like me to reset it now (the local-replica will be stopped) [Y/n]? " CONT

  if [ "$CONT" = "Y" ]; then
    yarn reset

    printf "🙏 Remember to re-start the local-replica, before starting this process\n\n"  

    exit 0;
  fi
fi

TEMP_DIR="./.temp"

printf "🙏 Verifying the Cap Service status, please wait...\n\n"

CAP_ROUTER_ID_PATH="$TEMP_DIR/ic-history-router-id"

if [ ! -e "$CAP_ROUTER_ID_PATH" ];
then
  # The extra space is intentional, used for alignment
  printf "⚠️  Warning: The Cap Service is required.\n"

  # The extra space is intentional, used for alignment
  read -r -p "🤖 Would you like me to start the Cap Service for you [Y/n]? " CONT

  if [ "$CONT" = "Y" ]; then
    yarn cap:start
  else
    printf "🚩 The Cap Service is a requirement, I'm afraid.\n\n"

    exit 1;
  fi
fi

CANISTER_CAP_ID=$(cat "$CAP_ROUTER_ID_PATH")

IS_CAP_SERVICE_RUNNING=$(dfx canister id "$CANISTER_CAP_ID")

if [ -z "$IS_CAP_SERVICE_RUNNING" ];
then
  printf "🤖 Oops! The Cap Service Canister (%s) is not running...\n\n" "$CANISTER_CAP_ID"

  exit 1
fi

printf "🌈 Cap Service running as canister id (%s)\n\n" "$CANISTER_CAP_ID"

DFX_IDENTITY_PRINCIPAL=""

if [[ $NODE_ENV != "ci" ]] && [[ ! SKIP_PROMPTS -eq 1 ]];
then
  # The extra space is intentional, used for alignment
  read -r -p "🤖 Is it ok to set dfx to use the default identity (required) [Y/n]? " CONT

  if [ "$CONT" = "Y" ]; then
    dfx identity use default

    DFX_IDENTITY_PRINCIPAL=$(dfx identity get-principal)

    printf "🌈 The DFX Identity is set to (%s)\n\n" "$DFX_IDENTITY_PRINCIPAL"
  else
    printf "🚩 The default Identity is a requirement, I'm afraid.\n\n"

    exit 1;
  fi
else
  dfx identity use default

  DFX_IDENTITY_PRINCIPAL=$(dfx identity get-principal)
fi