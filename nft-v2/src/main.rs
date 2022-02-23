mod legacy;

use ic_cdk::api::{caller, time};
use ic_cdk::export::candid::{candid_method, export_service, CandidType, Deserialize, Int, Nat};
use ic_cdk::export::Principal;
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

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
    owner: HashSet<Principal>,
    created_at: u64,
    upgraded_at: u64,
}

type TokenIdentifier = String;

#[derive(CandidType, Clone)]
enum GenericValue {
    TextContent(String),
    BlobContent(Vec<u8>),
    Principal(Principal),
    NatContent(Nat),
    Nat8Content(u8),
    Nat16Content(u16),
    Nat32Content(u32),
    Nat64Content(u64),
    IntContent(Int),
    Int8Content(i8),
    Int16Content(i16),
    Int32Content(i32),
    Int64Content(i64),
}

#[derive(CandidType, Clone)]
struct TokenMetadata {
    token_identifier: TokenIdentifier,
    owner: Principal,
    operator: Option<Principal>,
    properties: Vec<(String, GenericValue)>,
    minted_at: u64,
    minted_by: Principal,
    transferred_at: u64,
    transferred_by: Principal,
}

#[derive(Default)]
struct Ledger {
    tokens: HashMap<TokenIdentifier, TokenMetadata>,
    owners: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
    operators: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
    tx_records: Vec<TxEvent>,
}

struct TxEvent {
    time: u64,
    caller: Principal,
    operation: &'static str,
    details: Vec<(&'static str, GenericValue)>,
}

impl Ledger {
    fn add_tx(
        &mut self,
        caller: Principal,
        operation: &'static str,
        details: Vec<(&'static str, GenericValue)>,
    ) -> Nat {
        // NOTE: integrate with cap dip721 standard, or skip it for now ?????
        self.tx_records.push(TxEvent {
            time: time(),
            operation,
            caller,
            details,
        });
        Nat::from(self.tx_records.len())
    }
}

thread_local!(
    static METADATA: RefCell<Metadata> = RefCell::new(Metadata::default());
    static LEDGER: RefCell<Ledger> = RefCell::new(Ledger::default());
);

#[init]
#[candid_method(init)]
fn init(args: Option<InitArgs>) {
    METADATA.with(|metadata| {
        let mut metadata = metadata.borrow_mut();
        metadata.owner.insert(caller()); // Default as caller
        if let Some(args) = args {
            metadata.name = args.name;
            metadata.logo = args.logo;
            metadata.symbol = args.symbol;
            if let Some(owner) = args.owner {
                metadata.owner.insert(owner);
            }
            metadata.created_at = time();
            metadata.upgraded_at = time();
        }
    });
}

fn is_canister_owner() -> Result<(), String> {
    METADATA.with(|metadata| {
        metadata
            .borrow()
            .owner
            .contains(&caller())
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
    Unauthorized,
    OwnerNotFound,
    TokenNotFound,
    Other(String),
}

#[query(name = "balanceOf")]
#[candid_method(query, rename = "balanceOf")]
fn balance_of(owner: Principal) -> Result<Nat, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .owners
            .get(&owner)
            .map(|token_identifiers| token_identifiers.len().into())
            .ok_or(NftError::OwnerNotFound)
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
            .ok_or(NftError::TokenNotFound)
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
            .ok_or(NftError::TokenNotFound)
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
            .map(|token_identifiers| {
                token_identifiers
                    .iter()
                    .map(|token_identifier| {
                        ledger
                            .borrow()
                            .tokens
                            .get(token_identifier)
                            .unwrap()
                            .clone()
                    })
                    .collect()
            })
            .ok_or(NftError::OwnerNotFound)
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
            .map(|token_identifiers| {
                token_identifiers
                    .iter()
                    .map(|token_identifier| token_identifier.clone())
                    .collect()
            })
            .ok_or(NftError::OwnerNotFound)
    })
}

#[update(name = "approve")]
#[candid_method(update, rename = "approve")]
fn approve(operator: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    let token_metadata = token_metadata(token_identifier.clone())?;

    // check valid owner
    token_metadata
        .owner
        .eq(&caller())
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    let old_operator = token_metadata.operator;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        // remove cache
        if let Some(old_operator) = old_operator {
            if let Some(tokens) = ledger.operators.get_mut(&old_operator) {
                tokens.remove(&token_identifier);
            }
        }

        // set new operator
        ledger.tokens.get_mut(&token_identifier).unwrap().operator = Some(operator);

        // update cache
        let tokens = ledger
            .operators
            .entry(operator)
            .or_insert(HashSet::new());
        tokens.insert(token_identifier.clone());

        // history
        Ok(ledger.add_tx(
            caller(),
            "approve",
            vec![
                ("operator", GenericValue::Principal(operator)),
                (
                    "token_identifier",
                    GenericValue::TextContent(token_identifier),
                ),
            ],
        ))
    })
}

#[update(name = "transferFrom")]
#[candid_method(update, rename = "transferFrom")]
fn transfer_from(
    owner: Principal,
    to: Principal,
    token_identifier: TokenIdentifier,
) -> Result<Nat, NftError> {
    let token_metadata = token_metadata(token_identifier.clone())?;

    // check valid owner
    token_metadata
        .owner
        .eq(&owner)
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    // check valid operator
    token_metadata
        .operator
        .eq(&Some(caller()))
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    let old_owner = token_metadata.owner;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        // remove cache
        if let Some(tokens) = ledger.owners.get_mut(&old_owner) {
            tokens.remove(&token_identifier);
        }

        // update owner
        ledger.tokens.get_mut(&token_identifier).unwrap().owner = to;

        // update cache
        let tokens = ledger.owners.entry(to).or_insert(HashSet::new());
        tokens.insert(token_identifier.clone());

        // history
        Ok(ledger.add_tx(
            caller(),
            "transfer_from",
            vec![
                ("owner", GenericValue::Principal(owner)),
                ("to", GenericValue::Principal(to)),
                (
                    "token_identifier",
                    GenericValue::TextContent(token_identifier),
                ),
            ],
        ))
    })
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    export_service!();
    std::print!("{}", __export_service());
}
