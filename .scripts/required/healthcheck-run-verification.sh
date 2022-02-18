#!/bin/bash

if [ -d ./.dfx/local/canisters/nft ] && [[ ! SKIP_PROMPTS -eq 1 ]] && [[ ! CI -eq 1 ]];
then
  printf "🚩 The process seem to have run before, it's probably best to reset the state and only after run the healthcheck, please!\n\n"  

  # The extra space is intentional, used for alignment
  read -r -p "🤖 Would you like me to reset it now (the local-replica will be stopped) [Y/n]? " CONT

  if [ "$CONT" = "Y" ]; then
    npm run dip721:reset

    printf "🙏 Remember to re-start the local-replica, before starting this process\n\n"  

    exit 0;
  fi
fi
