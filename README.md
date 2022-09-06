![Group 5982](https://user-images.githubusercontent.com/73345016/144523337-fe7d6b49-d0a7-4621-852d-daeee344d4e2.png)

# 💎 DIP-721
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org) [![Healthcheck](https://github.com/Psychedelic/DIP721/actions/workflows/pr-healthcheck-runner.yml/badge.svg)](https://github.com/Psychedelic/DIP721/actions/workflows/pr-integration-test-runner.yml)

[DIP-721](spec.md) is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs

## 📒 Table of Contents

- [💎 DIP-721](#-dip-721)
  - [📒 Table of Contents](#-table-of-contents)
  - [🎓 Specification](#-specification)
  - [👋 Community](#-community)
  - [👩 NFT Implementation example](#-nft-implementation-example)
  - [🙏 Contributing](#-contributing)

## 🎓 Specification

The document for the [DIP-721](spec.md) is available [here](spec.md).

There are 2 versions of the v2 spec. One with namespace and snakecase, and one non namespaced and camel case. The legacy.rs provides the initial v2 spec without namespace, but the final version that should be used and integrated against has the namespace.

⚠️ This is an an in-development standard, consider it a work in progress as we finalize details in its design and gather feedback from the community.

## 👋 Community

We'd like to collaborate with the community to provide a better [token standard implementation](spec.md) for the developers on the IC, if you have some ideas you'd like to discuss, submit an issue, if you want to improve the code or you made a different implementation, make a pull request by following our [contribution guideline](#-Contributing), please!

## 👩 NFT Implementation example

An NFT (non-fungible token) implementation which follows the [DIP-721](spec.md) specification is available and can be used as a base for your projects.

Checkout our [implementation example (Rust)](./src/main.rs)

Mokoto implementation example will be available soon.

Checkout our [installation example](Makefile)

Checkout our [test and usage example](./test/integration)

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
