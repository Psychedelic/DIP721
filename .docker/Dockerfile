FROM ubuntu:focal

LABEL org.opencontainers.image.source="https://github.com/psychedelic/DIP721"

ENV DFX_VERSION=0.8.4
ENV DFX_CANDID_RELEASE=2022-01-06

RUN mkdir -p /home/target

WORKDIR /home/target

RUN apt-get update \
  && apt-get install curl -y \
  && curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh \
  && bash nodesource_setup.sh \
  && apt install nodejs \
  && apt install build-essential -y \
  && npm install -g concurrently \
  && npm install -g yarn@1.22.4 \
  && node --version \
  && npm --version \
  && yarn --version

RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata

RUN apt install -y gconf-service \
                   libasound2 \
                   libatk1.0-0 \
                   libc6 \
                   libcairo2 \
                   libcups2 \
                   libdbus-1-3 \
                   libexpat1 \
                   libfontconfig1 \
                   libgcc1 \
                   libgconf-2-4 \
                   libgdk-pixbuf2.0-0 \
                   libglib2.0-0 \
                   libgtk-3-0 \
                   libnspr4 \
                   libpango-1.0-0 \
                   libpangocairo-1.0-0 \
                   libstdc++6 \
                   libx11-6 \
                   libx11-xcb1 \
                   libxcb1 \
                   libxcomposite1 \
                   libxcursor1 \
                   libxdamage1 \
                   libxext6 \
                   libxfixes3 \
                   libxi6 \
                   libxrandr2 \
                   libxrender1 \
                   libxss1 \
                   libxtst6 \
                   libgbm1 \
                   ca-certificates \
                   fonts-liberation \
                   libappindicator1 \
                   libnss3 \
                   lsb-release \
                   xdg-utils \
                   wget \
                   net-tools \
                   psmisc \
                   cmake \
                   git \
                   rsync

RUN yes Y | DFX_VERSION="$DFX_VERSION" sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Dfinity candid utils
RUN wget https://github.com/dfinity/candid/releases/download/"$DFX_CANDID_RELEASE"/didc-linux64

RUN chmod +x ./didc-linux64

RUN ln -s "$(pwd)/didc-linux64" /usr/local/bin/didc

# Rust (for building rust canisters)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Add .cargo/bin to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

RUN ln -s "/root/.cargo/bin" /home/.cargo

RUN cargo install ic-cdk-optimizer

RUN apt install -y pkg-config openssl libssl-dev

RUN git clone https://github.com/dfinity/agent-rs

RUN cd agent-rs && cargo build

ENV PATH="/home/target/agent-rs/target/debug:${PATH}"

RUN rustup install stable && rustup default stable

RUN rustup target add wasm32-unknown-unknown