#!/bin/bash

printf "🙏 Verifying the Cap Service status, please wait...\n\n"

CAP_HISTORY_ROUTER_ID=$(cd ./cap && dfx canister id ic-history-router)

if [ -z "$CAP_HISTORY_ROUTER_ID" ];
then
  # The extra space is intentional, used for alignment
  printf "⚠️  Warning: The Cap Service is required.\n"

  # The extra space is intentional, used for alignment
  read -r -p "🤖 Would you like me to start the Cap Service for you [Y/n]? " CONT

  if [ "$CONT" = "Y" ]; then
    npm run cap:start

    CAP_HISTORY_ROUTER_ID=$(cd ./cap && dfx canister id ic-history-router)
  else
    printf "🚩 The Cap Service is a requirement, I'm afraid.\n\n"

    exit 1;
  fi
fi

printf "🌈 Cap Service running as canister id (%s)\n\n" "$CAP_HISTORY_ROUTER_ID"
