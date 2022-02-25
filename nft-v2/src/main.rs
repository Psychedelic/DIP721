mod legacy;

use ic_cdk::api::{caller, time};
use ic_cdk::export::candid::{candid_method, CandidType, Deserialize, Int, Nat};
use ic_cdk::export::Principal;
use ic_cdk_macros::{init, query, update};
use num_traits::cast::ToPrimitive;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::iter::FromIterator;

#[derive(CandidType, Deserialize)]
struct InitArgs {
    name: Option<String>,
    logo: Option<String>,
    symbol: Option<String>,
    owners: Option<Vec<Principal>>,
}

#[derive(CandidType, Default, Clone)]
struct Metadata {
    name: Option<String>,
    logo: Option<String>,
    symbol: Option<String>,
    owners: HashSet<Principal>,
    created_at: u64,
    upgraded_at: u64,
}

type TokenIdentifier = String;

#[derive(CandidType, Clone, Deserialize)]
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
    transferred_at: Option<u64>,
    transferred_by: Option<Principal>,
}

#[derive(Default)]
struct Ledger {
    tokens: HashMap<TokenIdentifier, TokenMetadata>,
    owners: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
    operators: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
    tx_records: Vec<TxEvent>,
}

#[derive(CandidType, Clone)]
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
        metadata.owners.insert(caller()); // Default as caller
        if let Some(args) = args {
            metadata.name = args.name;
            metadata.logo = args.logo;
            metadata.symbol = args.symbol;
            if let Some(owners) = args.owners {
                for owner in owners {
                    metadata.owners.insert(owner);
                }
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
            .owners
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

#[query(name = "owners")]
#[candid_method(query, rename = "owners")]
fn owners() -> Vec<Principal> {
    METADATA.with(|metadata| metadata.borrow().owners.iter().cloned().collect())
}

#[update(name = "setOwners", guard = "is_canister_owner")]
#[candid_method(update, rename = "setOwners")]
fn set_owners(owners: Vec<Principal>) {
    METADATA.with(|metadata| metadata.borrow_mut().owners = HashSet::from_iter(owners))
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
    OperatorNotFound,
    TokenNotFound,
    ExistedNFT,
    InvalidTxId,
    TxNotFound,
    // Other(String),
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

#[query(name = "operatorOf")]
#[candid_method(query, rename = "operatorOf")]
fn operator_of(token_identifier: TokenIdentifier) -> Result<Option<Principal>, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .tokens
            .get(&token_identifier)
            .map(|token_metadata| token_metadata.operator)
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
            .cloned()
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

#[query(name = "operatorTokenMetadata")]
#[candid_method(query, rename = "operatorTokenMetadata")]
fn operator_token_metadata(operator: Principal) -> Result<Vec<TokenMetadata>, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .operators
            .get(&operator)
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
            .ok_or(NftError::OperatorNotFound)
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
            .map(|token_identifiers| token_identifiers.iter().cloned().collect())
            .ok_or(NftError::OwnerNotFound)
    })
}

#[query(name = "operatorTokenIds")]
#[candid_method(query, rename = "operatorTokenIds")]
fn operator_token_ids(operator: Principal) -> Result<Vec<TokenIdentifier>, NftError> {
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .operators
            .get(&operator)
            .map(|token_identifiers| token_identifiers.iter().cloned().collect())
            .ok_or(NftError::OperatorNotFound)
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

        // update operator
        ledger.tokens.get_mut(&token_identifier).unwrap().operator = Some(operator);

        // update cache
        ledger
            .operators
            .entry(operator)
            .or_insert_with(HashSet::new)
            .insert(token_identifier.clone());

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
        let token = ledger.tokens.get_mut(&token_identifier).unwrap();
        token.owner = to;
        token.transferred_at = Some(time());
        token.transferred_by = Some(caller());

        // update cache
        ledger
            .owners
            .entry(to)
            .or_insert_with(HashSet::new)
            .insert(token_identifier.clone());

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

#[update(name = "mint", guard = "is_canister_owner")]
#[candid_method(update, rename = "mint")]
fn mint(
    to: Principal,
    token_identifier: TokenIdentifier,
    properties: Vec<(String, GenericValue)>,
) -> Result<Nat, NftError> {
    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();
        if ledger
            .tokens
            .insert(
                token_identifier.clone(),
                TokenMetadata {
                    token_identifier: token_identifier.clone(),
                    owner: to,
                    operator: None,
                    properties,
                    minted_at: time(),
                    minted_by: caller(),
                    transferred_at: None,
                    transferred_by: None,
                },
            )
            .is_some()
        {
            return Err(NftError::ExistedNFT);
        }

        // update cache
        ledger
            .owners
            .entry(to)
            .or_insert_with(HashSet::new)
            .insert(token_identifier.clone());

        // history
        Ok(ledger.add_tx(
            caller(),
            "mint",
            vec![
                ("to", GenericValue::Principal(to)),
                (
                    "token_identifier",
                    GenericValue::TextContent(token_identifier),
                ),
            ],
        ))
    })
}

#[update(name = "transaction")]
#[candid_method(update, rename = "transaction")]
fn transaction(tx_id: Nat) -> Result<TxEvent, NftError> {
    let index = tx_id.0.to_usize().ok_or(NftError::InvalidTxId)?;
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .tx_records
            .get(index - 1) // zero base
            .cloned()
            .ok_or(NftError::TxNotFound)
    })
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    ic_cdk::export::candid::export_service!();
    std::print!("{}", __export_service());
}
