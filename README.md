## Introduction

DIP721 is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs.

[This branch](https://github.com/dfinance-tech/ic-token/tree/templates) contains code of several other token canister templates.


## Development

You need the latest DFINITY Canister SDK to be able to build and deploy a token canister:

```shell
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

Navigate to a the sub directory and start a local development network:

```shell
cd motoko
dfx start --background
```

Create canisters:

```shell
dfx canister create --all
```

Install code for token canister:

```
dfx build

dfx canister install token --argument="(\"<NAME>\", \"<SYMBOL>\", <DECIMALS>, <TOTAL_SUPPLY>, <YOUR_PRINCIPAL_ID>)"
e.g.:
dfx canister install token --argument="(\"DFinance Coin\", \"DFC\", 8, 10000000000000000, principal \"4qehi-lqyo6-afz4c-hwqwo-lubfi-4evgk-5vrn5-rldx2-lheha-xs7a4-gae\")"
```

Refer to `demo.sh` in the corresponding sub directory for more details.



## Contributing

We'd like to collaborate with the community to provide better token standard implementation for the developers on the IC, if you have some ideas you'd like to discuss, submit an issue, if you want to improve the code or you made a different implementation, make a pull request!

