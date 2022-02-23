mod legacy;

use ic_cdk::api::{caller, time};
use ic_cdk::export::candid::{candid_method, export_service, CandidType, Deserialize, Nat};
use ic_cdk::export::Principal;
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize)]
struct InitArgs {
    name: Option<String>,
    logo: Option<String>,
    symbol: Option<String>,
    owner: Option<Principal>,
}

#[derive(CandidType, Default, Clone)]
struct Metadata {
    name: Option<String>,
    logo: Option<String>,
    symbol: Option<String>,
    owner: Option<Principal>,
    tx_size: Nat,
    created_at: u64,
    upgraded_at: u64,
}

type TokenIdentifier = String;
type TokenMetadataPropertyKey = String;

#[derive(CandidType, Clone)]
enum TokenMetadataPropertyValue {
    TextContent(String),
    BlobContent(Vec<u8>),
    NatContent(Nat),
    Nat8Content(u8),
    Nat16Content(u16),
    Nat32Content(u32),
    Nat64Content(u64),
}

#[derive(CandidType, Clone)]
struct TokenMetadata {
    token_identifier: TokenIdentifier,
    owner: Principal,
    properties: Vec<(TokenMetadataPropertyKey, TokenMetadataPropertyValue)>,
    minted_at: u64,
    minted_by: Principal,
    transferred_at: u64,
    transferred_by: Principal,
}

#[derive(Default)]
struct Ledger<'a> {
    tokens: HashMap<TokenIdentifier, TokenMetadata>,
    owners: HashMap<Principal, Vec<&'a TokenMetadata>>,
}

thread_local!(
    static METADATA: RefCell<Metadata> = RefCell::new(Metadata::default());
    static LEDGER: RefCell<Ledger<'static>> = RefCell::new(Ledger::default());
);

#[init]
#[candid_method(init)]
fn init(args: Option<InitArgs>) {
    METADATA.with(|metadata| {
        if let Some(args) = args {
            *metadata.borrow_mut() = Metadata {
                name: args.name,
                logo: args.logo,
                symbol: args.symbol,
                owner: args.owner.or(Some(caller())), // Default as caller when owner is None
                tx_size: Nat::from(0),
                created_at: time(),
                upgraded_at: time(),
            }
        } else {
            metadata.borrow_mut().owner = Some(caller()) // Default as caller when args is None
        }
    });
}

fn is_canister_owner() -> Result<(), String> {
    METADATA.with(|metadata| {
        metadata
            .borrow()
            .owner
            .eq(&Some(caller()))
            .then(|| ())
            .ok_or_else(|| "Caller is not an owner of canister".into())
    })
}

#[query(name = "metadata")]
#[candid_method(query, rename = "metadata")]
fn metadata() -> Metadata {
    METADATA.with(|metadata| metadata.borrow().clone())
}

#[query(name = "name")]
#[candid_method(query, rename = "name")]
fn name() -> Option<String> {
    METADATA.with(|metadata| metadata.borrow().name.clone())
}

#[update(name = "setName", guard = "is_canister_owner")]
#[candid_method(update, rename = "setName")]
fn set_name(name: String) {
    METADATA.with(|metadata| metadata.borrow_mut().name = Some(name));
}

#[query(name = "logo")]
#[candid_method(query, rename = "logo")]
fn logo() -> Option<String> {
    METADATA.with(|metadata| metadata.borrow().logo.clone())
}

#[update(name = "setLogo", guard = "is_canister_owner")]
#[candid_method(update, rename = "setLogo")]
fn set_logo(logo: String) {
    METADATA.with(|metadata| metadata.borrow_mut().logo = Some(logo));
}

#[query(name = "symbol")]
#[candid_method(query, rename = "symbol")]
fn symbol() -> Option<String> {
    METADATA.with(|metadata| metadata.borrow().symbol.clone())
}

#[update(name = "setSymbol", guard = "is_canister_owner")]
#[candid_method(update, rename = "setSymbol")]
fn set_symbol(symbol: String) {
    METADATA.with(|metadata| metadata.borrow_mut().symbol = Some(symbol))
}

#[query(name = "totalSupply")]
#[candid_method(query, rename = "totalSupply")]
fn total_supply() -> Nat {
    LEDGER.with(|ledger| ledger.borrow().tokens.len().into())
}

#[derive(CandidType)]
enum SupportedInterface {
    Approval,
    Mint,
    Burn,
    TransactionHistory,
}

#[query(name = "supportedInterfaces")]
#[candid_method(query, rename = "supportedInterfaces")]
fn supported_interfaces() -> Vec<SupportedInterface> {
    vec![
        SupportedInterface::Approval,
        SupportedInterface::Mint,
        SupportedInterface::Burn,
        SupportedInterface::TransactionHistory,
    ]
}

#[derive(CandidType)]
enum NftError {
    Common(CommonError),
    Approve(ApproveError),
    Other(String),
}

#[derive(CandidType)]
enum ApproveError {
    Test,
}

#[derive(CandidType)]
enum CommonError {
    OwnerNotFound,
    TokenNotFound,
    Unauthorized,
}

#[query(name = "balanceOf")]
#[candid_method(query, rename = "balanceOf")]
fn balance_of(owner: Principal) -> Result<Nat, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .owners
            .get(&owner)
            .map(|token_metadata| token_metadata.len().into())
            .ok_or(NftError::Common(CommonError::OwnerNotFound))
    })
}

#[query(name = "ownerOf")]
#[candid_method(query, rename = "ownerOf")]
fn owner_of(token_identifier: TokenIdentifier) -> Result<Principal, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .tokens
            .get(&token_identifier)
            .map(|token_metadata| token_metadata.owner)
            .ok_or(NftError::Common(CommonError::TokenNotFound))
    })
}

#[query(name = "tokenMetadata")]
#[candid_method(query, rename = "tokenMetadata")]
fn token_metadata(token_identifier: TokenIdentifier) -> Result<TokenMetadata, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .tokens
            .get(&token_identifier)
            .map(|token_metadata| token_metadata.clone())
            .ok_or(NftError::Common(CommonError::TokenNotFound))
    })
}

#[query(name = "ownerTokenMetadata")]
#[candid_method(query, rename = "ownerTokenMetadata")]
fn owner_token_metadata(owner: Principal) -> Result<Vec<TokenMetadata>, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .owners
            .get(&owner)
            .map(|token_metadata| {
                token_metadata
                    .iter()
                    .map(|&token_metadata| token_metadata.clone())
                    .collect()
            })
            .ok_or(NftError::Common(CommonError::OwnerNotFound))
    })
}

#[query(name = "ownerTokenIds")]
#[candid_method(query, rename = "ownerTokenIds")]
fn owner_token_ids(owner: Principal) -> Result<Vec<TokenIdentifier>, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .owners
            .get(&owner)
            .map(|token_metadata| {
                token_metadata
                    .iter()
                    .map(|&token_metadata| token_metadata.token_identifier.clone())
                    .collect()
            })
            .ok_or(NftError::Common(CommonError::OwnerNotFound))
    })
}

#[query(name = "approve")]
#[candid_method(query, rename = "approve")]
fn approve(spender: Principal, token_identifier: TokenIdentifier) -> Result<(), NftError> {
    Err(NftError::Approve(ApproveError::Test))
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    export_service!();
    std::print!("{}", __export_service());
}
