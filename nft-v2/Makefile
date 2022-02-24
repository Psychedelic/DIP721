.PHONY: candid build local test

OWNER_CANISTER_PRINCIPAL=$(shell cat canister-owner-test-principal.txt)

candid:
	cargo run > nft-v2.did
	didc bind -t ts nft-v2.did  > test/factory/idl.d.ts
	echo "// @ts-nocheck" > test/factory/idl.ts
	didc bind -t js nft-v2.did  >> test/factory/idl.ts

build: candid
	dfx stop
	dfx start --clean --background
	dfx canister create nft-v2
	dfx build nft-v2

local: build
	dfx canister install nft-v2  --argument '()'

test: build
	dfx canister install nft-v2  --argument '(opt record{owners=opt vec{principal"$(OWNER_CANISTER_PRINCIPAL)"}})'
	npm t
	dfx stop
