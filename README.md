![Group 5982](https://user-images.githubusercontent.com/73345016/144523337-fe7d6b49-d0a7-4621-852d-daeee344d4e2.png)

# 💎 DIP-721
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org) [![Healthcheck](https://github.com/Psychedelic/DIP721/actions/workflows/pr-healthcheck-runner.yml/badge.svg)](https://github.com/Psychedelic/DIP721/actions/workflows/pr-healthcheck-runner.yml)

[DIP-721](spec.md) is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs and expanding/building upon the EXT standard with partial compatibility.

## 📒 Table of Contents 

- [Specification](#-specification)
- [NFT Implementation example](#-nft-implementation-example)
  - [Requirements](#-requirements)
  - [Getting started](#-getting-started)
- [Contribution guideline](#-contributing)

## 🎓 Specification

The document for the [DIP-721](spec.md) is available [here](spec.md).

⚠️ This is an an in-development standard, consider it a work in progress as we finalize details in its design and gather feedback from the community.

## 👋 Community

We'd like to collaborate with the community to provide a better [token standard implementation](spec.md) for the developers on the IC, if you have some ideas you'd like to discuss, submit an issue, if you want to improve the code or you made a different implementation, make a pull request by following our [contribution guideline](#-Contributing), please!

Check the [roadmap](docs/roadmap.md)

## 👩‍🎤 NFT Implementation example

An NFT (non-fungible token) implementation which follows the [DIP-721](spec.md) specification is available and can be used as a base for your projects.

Find more about it [here](docs/nft-example.md)

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
