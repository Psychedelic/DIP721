# 🤖 Dockerfile for CI

## ⚙️ Requirements

💡 Make sure that you have the required permissions for @Psychedelic. If you are part of the organisation, you can add the correct permissions to yourself by setting it via [Github settings](https://github.com/settings/tokens). For more detailed information, you'll need to check the original documentation in [ghcr.io](https://github.com/features/packages).

## 🤔 How to use

In the Dockerfile directory, build an instance:

```sh
docker build . -t psychedelic/ci-dip-721
```

For testing, you can attach a `tty` to the new Docker container. Here's an example:

```sh
docker run -it psychedelic/ci-dip-721 /bin/bash
```

To push to the Github container registry

You'd start by tagging the previous build:

```sh
docker tag psychedelic/ci-dip-721:latest ghcr.io/psychedelic/ci-dip-721:latest
```

Which then you could push to ghcr as:

```sh
docker push ghcr.io/psychedelic/ci-dip-721:latest
```

If all went well, you should find the latest release in [ci-dip-721 package](https://github.com/Psychedelic/DIP721/pkgs/container/ci-dip-721)

👏 That's it!