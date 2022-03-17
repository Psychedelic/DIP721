.PHONY: init candid build local test format lint clean

LOCAL_CUSTODIAN_PRINCIPAL=$(shell dfx identity get-principal)
TEST_CUSTODIAN_PRINCIPAL=$(shell cat test/custodian-test-principal)

init:
	npm --prefix test i
	cargo check

candid:
	cargo run > nft.did
	didc bind -t ts nft.did > test/factory/idl.d.ts
	echo "// @ts-nocheck" > test/factory/idl.ts
	didc bind -t js nft.did >> test/factory/idl.ts

build: candid
	dfx ping local || dfx start --clean --background
	dfx canister create nft
	dfx build nft

local: build
	dfx deploy nft --argument '(opt record{custodians=opt vec{principal"$(LOCAL_CUSTODIAN_PRINCIPAL)"}})'

stop-replica:
	dfx stop

test: stop-replica build
	dfx canister install nft --argument '(opt record{custodians=opt vec{principal"$(TEST_CUSTODIAN_PRINCIPAL)"}})'
	npm --prefix test t
	dfx stop

format:
	npm --prefix test run prettier
	cargo fmt --all

lint:
	npm --prefix test run prebuild
	cargo fmt --all -- --check
	cargo clippy --all-targets --all-features -- -D warnings -D clippy::all

clean:
	cargo clean
	npm --prefix test run clean
