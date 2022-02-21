# 👩‍🎤 NFT Implementation example

An NFT (non-fungible token) implementation which follows the [DIP-721](spec.md) specification is available and can be used as a base for your projects.

### ⚙️ Requirements

TLDR; We're providing implementation examples and related test or use-cases for your convinence, if you are just interested in the specifications find it [here](spec.md).

The requirements listed here are for running the [DIP-721](spec.md) example implementations that are available in this repository. If you are just interested in the specification for [DIP-721](spec.md) followed the link [here](spec.md).

-   Nodejs
-   Yarn or NPM
-   The [DFX SDK](https://smartcontracts.org/) to run the CLI

💡 During the guide we'll be using `yarn`, but this can be easily replaced by `npm`, if that's your preference.

### 🤔 Getting started

We'll use Nodejs `package.json` to provide and describe convenient methods to bootstrap, build or reset the state of the provided test cases.

We'll be using [Cap](https://github.com/Psychedelic/cap), an Open Internet Service to store transaction history for NFTs/Tokens on the Internet Computer. If you haven't learn about it yet, find about [here](https://github.com/Psychedelic/cap).

The `DIP-721 example` runs against the CAP canister within the local replica network, as such you have [CAP](https://github.com/psychedelic/cap) as a submodule (if you're already running the Service separatily on your own, feel free to skip these steps).

You have to pull the `CAP` submodule content as follows:

```sh
yarn cap:init
```

You only need to do it once, for example, after you cloned the `CAP Explorer` repository.

> Note: Make sure you have the [DFX SDK](https://smartcontracts.org/) installed to run the DFX cli, otherwise visit the [Dfinity](https://dfinity.org/) for instructions

Launch the local replica in the foreground (you're advised to do it, to monitor the service, otherwise feel free to add the --background flag). You can open a new shell session afterwards while monitoring the local replica network.

```sh
dfx start --clean
```

Once ready, launch the healtcheck for our Nft implementation example by running the command:

```sh
yarn dip721:healthcheck
```

💡 Optionally, skip some prompts, such as the reset request, by prefixing the command with `SKIP_PROMPTS=1`

Through the process the [Cap Service](https://github.com/Psychedelic/cap) is deployed to your local replica. Depending on your needs, this can be useful, so the service can be started separately by running:

```sh
yarn cap:start
```

✨ If everything goes well, you should see the output for a generalist flow, where a user mints a DIP-721 token, gets metadata, get balance, transfers, etc.

### 🌈 Deploying the NFT canister

You can manually deploy the NFT canister by running:

```sh
yarn dip721:deploy-example <local|ic> [reinstall]
```

The command will deploy (and optionally `reinstall`) an hypothetical example DIP-721 Token "¥" of name "Yuppi".

💡 On the creation of a new canister, the controllers have to be set to the owners principal and the canister id, as required by the ownership and approvals handling - the script automatically sets that up; And can also redeploy or reinstalls, if the canister already exists. Check the [/.scripts/dip721/deploy-nft.sh](/.scripts/dip721/deploy-nft.sh) to learn about it!

💡 Only use the reinstall if you want the state of the canister completely reset

Custom tokens can be deployed by executing the following command, with the required arguments (optional `reinstall`):

```sh
yarn dip721:deploy-nft <local|ic> <Owner Principal Id> <Token Symbol> <Token Name> <Cap History Router Id> [reinstall]
```

### 👨🏾‍💻 Development

A develop watcher is available, that builds and runs the healthcheck for any NFT source file changes.

```sh
yarn dev:watch
```

This is useful if you are interested in providing features or changes to the code base.

Also, check our [contributing guidelines](/docs/contributing.md).
