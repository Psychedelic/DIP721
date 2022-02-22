mod legacy;

use ic_cdk::api::time;
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
    updated_at: u64,
}

thread_local!(
    static METADATA: RefCell<Metadata> = RefCell::new(Metadata::default());
    static LEDGER: RefCell<Ledger> = RefCell::new(Ledger::default());
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
                owner: args.owner,
                tx_size: Nat::from(0),
                created_at: time(),
                updated_at: time(),
            }
        }
    });
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

#[update(name = "setName")]
#[candid_method(update, rename = "setName")]
fn set_name(name: String) {
    METADATA.with(|metadata| metadata.borrow_mut().name = Some(name));
}

#[query(name = "logo")]
#[candid_method(query, rename = "logo")]
fn logo() -> Option<String> {
    METADATA.with(|metadata| metadata.borrow().logo.clone())
}

#[update(name = "setLogo")]
#[candid_method(update, rename = "setLogo")]
fn set_logo(logo: String) {
    METADATA.with(|metadata| metadata.borrow_mut().logo = Some(logo));
}

#[query(name = "symbol")]
#[candid_method(query, rename = "symbol")]
fn symbol() -> Option<String> {
    METADATA.with(|metadata| metadata.borrow().symbol.clone())
}

#[update(name = "setSymbol")]
#[candid_method(update, rename = "setSymbol")]
fn set_symbol(symbol: String) {
    METADATA.with(|metadata| metadata.borrow_mut().symbol = Some(symbol))
}

type TokenIdentifier = String;
type TokenMetadataPropertyKey = String;
enum TokenMetadataPropertyValue {
    TextContent(String),
    BlobContent(Vec<u8>),
    NatContent(Nat),
    Nat8Content(u8),
    Nat16Content(u16),
    Nat32Content(u32),
    Nat64Content(u64),
}
#[derive(Default)]
struct Ledger {
    tokens: HashMap<TokenIdentifier, Vec<(TokenMetadataPropertyKey, TokenMetadataPropertyValue)>>,
    users: HashMap<Principal, TokenIdentifier>
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
fn supportedInterfaces() -> Vec<SupportedInterface> {
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
enum ApproveError {}
#[derive(CandidType)]
enum CommonError {
    InvalidToken,
}

#[query(name = "approve")]
#[candid_method(query, rename = "approve")]
fn approve(spender: Principal, token_id: u64) -> Result<(), NftError> {
    Ok(())
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    export_service!();
    std::print!("{}", __export_service());
}
