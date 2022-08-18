.PHONY: init candid build local cap-local start-replica stop-replica test format lint clean dfx-clean

LOCAL_CUSTODIAN_PRINCIPAL = $(shell dfx identity get-principal)
TEST_CUSTODIAN_PRINCIPAL = $(shell cat test/custodian-test-principal)
CAP_ID ?= $(shell cd cap && dfx canister id cap-router)

cap-local:
	# Verifying cap... $(shell [ -z "$(CAP_ID)" ] && cd cap && dfx deploy cap-router)
	@echo "cap local canister id: $(CAP_ID)"

init:
	git submodule update --init --recursive
	npm --prefix test i
	cargo check

candid:
	cargo run > nft.did
	didc bind -t ts nft.did > test/factory/idl.d.ts
	echo "// @ts-nocheck" > test/factory/idl.ts
	didc bind -t js nft.did >> test/factory/idl.ts

build: candid start-replica
	dfx canister create nft
	dfx build nft

local: build cap-local
	dfx deploy nft --argument '(opt record{custodians=opt vec{principal"$(LOCAL_CUSTODIAN_PRINCIPAL)"}; cap=opt principal"$(CAP_ID)"})'

start-replica:
	dfx ping local || dfx start --clean --background

stop-replica:
	dfx stop

test: clean-dfx build cap-local
	dfx canister install nft --argument '(opt record{custodians=opt vec{principal"$(TEST_CUSTODIAN_PRINCIPAL)"}; cap=opt principal"$(CAP_ID)"})'
	npm --prefix test t
	dfx stop

format:
	npm --prefix test run prettier
	npm --prefix test run lint
	cargo fmt --all

lint:
	npm --prefix test run prebuild
	cargo fmt --all -- --check
	cargo clippy --all-targets --all-features -- -D warnings -D clippy::all

clean: clean-dfx
	cargo clean
	npm --prefix test run clean

clean-dfx: stop-replica
	rm -rf .dfx cap/.dfx