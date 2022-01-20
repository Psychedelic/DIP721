![Group 5982](https://user-images.githubusercontent.com/73345016/144523337-fe7d6b49-d0a7-4621-852d-daeee344d4e2.png)

## 💎 DIP-721
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)

[DIP-721](docs/spec.md) is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs and expanding/building upon the EXT standard with partial compatibility.

## 👋 Community

We'd like to collaborate with the community to provide a better [token standard implementation](docs/spec.md) for the developers on the IC, if you have some ideas you'd like to discuss, submit an issue, if you want to improve the code or you made a different implementation, make a pull request by following our [contribution guideline](#-Contributing), please!

## ⚙️ Requirements

TLDR; We're providing implementation examples and related test or use-cases for your convinence, if you are just interested in the specifications find it [here](docs/spec.md).

The requirements listed here are for running the [DIP-721](docs/spec.md) example implementations that are available in this repository. If you are just interested in the specification for [DIP-721](docs/spec.md) followed the link [here](docs/spec.md).

- Nodejs
- Yarn or NPM
- The [DFX SDK](https://smartcontracts.org/) to run the CLI

💡 During the guide we'll be using `yarn`, but this can be easily replaced by `npm`, if that's your preference.

## 🤔 Getting started

We'll use Nodejs `package.json` to provide and describe convenient methods to bootstrap, build or reset the state of the provided test cases.

We'll be using [Cap](https://github.com/Psychedelic/cap), an Open Internet Service to store transaction history for NFTs/Tokens on the Internet Computer. If you haven't learn about it yet, find about [here](https://github.com/Psychedelic/cap).

>Note: Make sure you have the [DFX SDK](https://smartcontracts.org/) installed to run the DFX cli, otherwise visit the [Dfinity](https://dfinity.org/) for instructions

Launch the local replica in the foreground (you're advised to do it, to monitor the service, otherwise feel free to add the --background flag). You can open a new shell session afterwards while monitoring the local replica network.

```sh
dfx start --clean
```

Once ready, start a local replica  by deploying [Cap Service](https://github.com/Psychedelic/cap) to your local replica.

```sh
yarn cap:start
```

You can complete by doing a healthcheck for the implementation by running the command

```sh
yarn healthcheck
```

✨ If everything goes well, you should see the output for a generalist flow, where a user mints a DIP-721 token, gets metadata, get balance, transfers, etc.

## 🎓 Specification

The document for the [DIP-721](docs/spec.md) is available [here](docs/spec.md).

⚠️ This is an an in-development standard, consider it a work in progress as we finalize details in its design and gather feedback from the community.

## 🙏 Contributing

Create branches from the `main` branch and name it in accordance to **conventional commits** [here](https://www.conventionalcommits.org/en/v1.0.0/), or follow the examples bellow:

```txt
test: 💍 Adding missing tests
feat: 🎸 A new feature
fix: 🐛 A bug fix
chore: 🤖 Build process or auxiliary tool changes
docs: ✏️ Documentation only changes
refactor: 💡 A code change that neither fixes a bug or adds a feature
style: 💄 Markup, white-space, formatting, missing semi-colons...
```

Find more about contributing [here](docs/contributing.md), please!
