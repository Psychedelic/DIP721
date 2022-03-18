// TODO: use ManualReply when new ic_cdk version release
// https://github.com/dfinity/cdk-rs/pull/210/files
use ic_cdk::api::call::ManualReply;
use ic_cdk::api::{caller, time, trap};
use ic_cdk::export::candid::{candid_method, CandidType, Deserialize, Int, Nat};
use ic_cdk::export::Principal;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use num_traits::cast::ToPrimitive;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::iter::FromIterator;

#[derive(CandidType, Deserialize)]
struct InitArgs {
    name: Option<String>,
    logo: Option<String>,
    symbol: Option<String>,
    custodians: Option<HashSet<Principal>>,
}

#[derive(CandidType, Default, Deserialize, Clone)]
struct Metadata {
    name: Option<String>,
    logo: Option<String>,
    symbol: Option<String>,
    custodians: HashSet<Principal>,
    created_at: u64,
    upgraded_at: u64,
}

type TokenIdentifier = Nat;

#[derive(CandidType, Deserialize, Clone)]
enum GenericValue {
    BoolContent(bool),
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
    NestedContent(Vec<(String, GenericValue)>),
}

// Please notice that the example of internal data structure as below doesn't represent your final storage, please use with caution.
// Feel free to change the storage and behavior that align with your expected business.
// The canister should match with the signature defined in `spec.md` in order to be considered as a DIP721 contract.
#[derive(CandidType, Deserialize, Clone)]
struct TokenMetadata {
    token_identifier: TokenIdentifier,
    owner: Option<Principal>,
    operator: Option<Principal>,
    is_burned: bool,
    properties: Vec<(String, GenericValue)>,
    minted_at: u64,
    minted_by: Principal,
    transferred_at: Option<u64>,
    transferred_by: Option<Principal>,
    burned_at: Option<u64>,
    burned_by: Option<Principal>,
}

#[derive(CandidType, Default, Deserialize, Clone)]
struct Ledger {
    tokens: HashMap<TokenIdentifier, TokenMetadata>, // recommend to have sequential id
    owners: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
    operators: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
    tx_records: Vec<TxEvent>,
}

#[derive(CandidType, Deserialize, Clone)]
struct TxEvent {
    time: u64,
    caller: Principal,
    operation: String,
    details: Vec<(String, GenericValue)>,
}

impl Ledger {
    fn add_tx(&mut self, operation: String, details: Vec<(String, GenericValue)>) -> Nat {
        self.tx_records.push(TxEvent {
            time: time(),
            operation,
            caller: caller(),
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
        metadata.custodians.insert(caller()); // Default as caller
        if let Some(args) = args {
            metadata.name = args.name;
            metadata.logo = args.logo;
            metadata.symbol = args.symbol;
            if let Some(custodians) = args.custodians {
                for custodians in custodians {
                    metadata.custodians.insert(custodians);
                }
            }
        }
        metadata.created_at = time();
        metadata.upgraded_at = time();
    });
}

fn is_canister_custodian() -> Result<(), String> {
    METADATA.with(|metadata| {
        metadata
            .borrow()
            .custodians
            .contains(&caller())
            .then(|| ())
            .ok_or_else(|| "Caller is not an custodian of canister".into())
    })
}

#[query(name = "metadata", manual_reply = true)]
#[candid_method(query, rename = "metadata")]
fn metadata() -> ManualReply<Metadata> {
    METADATA.with(|metadata| ManualReply::one::<&Metadata>(&metadata.borrow()))
}

#[query(name = "name", manual_reply = true)]
#[candid_method(query, rename = "name")]
fn name() -> ManualReply<Option<String>> {
    METADATA.with(|metadata| ManualReply::one(metadata.borrow().name.as_ref()))
}

#[update(name = "setName", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setName")]
fn set_name(name: String) {
    METADATA.with(|metadata| metadata.borrow_mut().name = Some(name));
}

#[query(name = "logo", manual_reply = true)]
#[candid_method(query, rename = "logo")]
fn logo() -> ManualReply<Option<String>> {
    METADATA.with(|metadata| ManualReply::one(metadata.borrow().logo.as_ref()))
}

#[update(name = "setLogo", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setLogo")]
fn set_logo(logo: String) {
    METADATA.with(|metadata| metadata.borrow_mut().logo = Some(logo));
}

#[query(name = "symbol", manual_reply = true)]
#[candid_method(query, rename = "symbol")]
fn symbol() -> ManualReply<Option<String>> {
    METADATA.with(|metadata| ManualReply::one(metadata.borrow().symbol.as_ref()))
}

#[update(name = "setSymbol", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setSymbol")]
fn set_symbol(symbol: String) {
    METADATA.with(|metadata| metadata.borrow_mut().symbol = Some(symbol))
}

#[query(name = "custodians", manual_reply = true)]
#[candid_method(query, rename = "custodians")]
fn custodians() -> ManualReply<HashSet<Principal>> {
    METADATA.with(|metadata| {
        ManualReply::one(
            metadata
                .borrow()
                .custodians
                .iter()
                .collect::<HashSet<&Principal>>(),
        )
    })
}

#[update(name = "setCustodians", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setCustodians")]
fn set_custodians(custodians: HashSet<Principal>) {
    METADATA.with(|metadata| metadata.borrow_mut().custodians = HashSet::from_iter(custodians))
}

// Returns the total current supply of NFT tokens.
// NFTs that are minted and later burned explicitly or sent to the zero address should also count towards totalSupply.
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
    BurnedNFT,
    SelfApprove,
    SelfTransfer,
    TxNotFound,
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
            .ok_or(NftError::TokenNotFound)?
            .owner
            .ok_or(NftError::BurnedNFT)
    })
}

#[query(name = "operatorOf")]
#[candid_method(query, rename = "operatorOf")]
fn operator_of(token_identifier: TokenIdentifier) -> Result<Option<Principal>, NftError> {
    LEDGER.with(|ledger| {
        let ledger = ledger.borrow();
        let token_metadata = ledger
            .tokens
            .get(&token_identifier)
            .ok_or(NftError::TokenNotFound)?;
        token_metadata.owner.ok_or(NftError::BurnedNFT)?;
        Ok(token_metadata.operator)
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

// since we've supported single operator per owner only
// so when `is_approved` is false that mean set all caller's nfts to None regardless of `operator`
// otherwise set all caller's nfts to `operator`
#[update(name = "setApprovalForAll")]
#[candid_method(update, rename = "setApprovalForAll")]
fn set_approval_for_all(operator: Principal, is_approved: bool) -> Result<Nat, NftError> {
    if operator == caller() {
        return Err(NftError::SelfApprove);
    }

    let owner_token_ids = owner_token_ids(caller())?;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        owner_token_ids.iter().for_each(|token_identifier| {
            let token = ledger.tokens.get_mut(token_identifier).unwrap();
            let old_operator = token.operator;

            // update operator
            if is_approved {
                token.operator = Some(operator)
            } else {
                token.operator = None
            }

            // remove cache
            if let Some(old_operator) = old_operator {
                if let Some(tokens) = ledger.operators.get_mut(&old_operator) {
                    tokens.remove(token_identifier);
                    // remove key when empty cache
                    if tokens.is_empty() {
                        ledger.operators.remove(&old_operator);
                    }
                }
            }

            // update cache
            if is_approved {
                ledger
                    .operators
                    .entry(operator)
                    .or_insert_with(HashSet::new)
                    .insert(token_identifier.clone());
            }
        });

        // history
        Ok(ledger.add_tx(
            "setApprovalForAll".into(),
            vec![
                ("operator".into(), GenericValue::Principal(operator)),
                ("is_approved".into(), GenericValue::BoolContent(is_approved)),
            ],
        ))
    })
}

#[query(name = "isApprovedForAll")]
#[candid_method(query, rename = "isApprovedForAll")]
fn is_approved_for_all(owner: Principal, operator: Principal) -> Result<bool, NftError> {
    let owner_token_metadata = owner_token_metadata(owner)?;
    Ok(owner_token_metadata
        .iter()
        .all(|token_metadata| token_metadata.operator == Some(operator)))
}

#[update(name = "approve")]
#[candid_method(update, rename = "approve")]
fn approve(operator: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    if operator == caller() {
        return Err(NftError::SelfApprove);
    }

    let token_metadata = token_metadata(token_identifier.clone())?;

    // check valid owner
    token_metadata
        .owner
        .eq(&Some(caller()))
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    let old_operator = token_metadata.operator;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        // remove cache
        if let Some(old_operator) = old_operator {
            if let Some(tokens) = ledger.operators.get_mut(&old_operator) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.operators.remove(&old_operator);
                }
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
            "approve".into(),
            vec![
                ("operator".into(), GenericValue::Principal(operator)),
                (
                    "token_identifier".into(),
                    GenericValue::NatContent(token_identifier),
                ),
            ],
        ))
    })
}

#[update(name = "transfer")]
#[candid_method(update, rename = "transfer")]
fn transfer(to: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    if to == caller() {
        return Err(NftError::SelfTransfer);
    }

    let token_metadata = token_metadata(token_identifier.clone())?;

    // check valid owner
    token_metadata
        .owner
        .eq(&Some(caller()))
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    let old_owner = token_metadata.owner;
    let old_operator = token_metadata.operator;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        // remove cache
        if let Some(old_owner) = old_owner {
            if let Some(tokens) = ledger.owners.get_mut(&old_owner) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.owners.remove(&old_owner);
                }
            }
        }
        if let Some(old_operator) = old_operator {
            if let Some(tokens) = ledger.operators.get_mut(&old_operator) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.operators.remove(&old_operator);
                }
            }
        }

        // update owner
        let token = ledger.tokens.get_mut(&token_identifier).unwrap();
        token.owner = Some(to);
        token.transferred_at = Some(time());
        token.transferred_by = Some(caller());

        // remove operator
        token.operator = None;

        // update cache
        ledger
            .owners
            .entry(to)
            .or_insert_with(HashSet::new)
            .insert(token_identifier.clone());

        // history
        Ok(ledger.add_tx(
            "transfer".into(),
            vec![
                ("owner".into(), GenericValue::Principal(caller())),
                ("to".into(), GenericValue::Principal(to)),
                (
                    "token_identifier".into(),
                    GenericValue::NatContent(token_identifier),
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
    if owner == to {
        return Err(NftError::SelfTransfer);
    }

    let token_metadata = token_metadata(token_identifier.clone())?;

    // check valid owner
    token_metadata
        .owner
        .eq(&Some(owner))
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    // check valid operator
    token_metadata
        .operator
        .eq(&Some(caller()))
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    let old_owner = token_metadata.owner;
    let old_operator = token_metadata.operator;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        // remove cache
        if let Some(old_owner) = old_owner {
            if let Some(tokens) = ledger.owners.get_mut(&old_owner) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.owners.remove(&old_owner);
                }
            }
        }
        if let Some(old_operator) = old_operator {
            if let Some(tokens) = ledger.operators.get_mut(&old_operator) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.operators.remove(&old_operator);
                }
            }
        }

        // update owner
        let token = ledger.tokens.get_mut(&token_identifier).unwrap();
        token.owner = Some(to);
        token.transferred_at = Some(time());
        token.transferred_by = Some(caller());

        // remove operator
        token.operator = None;

        // update cache
        ledger
            .owners
            .entry(to)
            .or_insert_with(HashSet::new)
            .insert(token_identifier.clone());

        // history
        Ok(ledger.add_tx(
            "transferFrom".into(),
            vec![
                ("owner".into(), GenericValue::Principal(owner)),
                ("to".into(), GenericValue::Principal(to)),
                (
                    "token_identifier".into(),
                    GenericValue::NatContent(token_identifier),
                ),
            ],
        ))
    })
}

#[update(name = "mint", guard = "is_canister_custodian")]
#[candid_method(update, rename = "mint")]
fn mint(
    to: Principal,
    token_identifier: TokenIdentifier,
    properties: Vec<(String, GenericValue)>,
) -> Result<Nat, NftError> {
    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();
        if ledger.tokens.contains_key(&token_identifier) {
            return Err(NftError::ExistedNFT);
        }

        // init token
        ledger.tokens.insert(
            token_identifier.clone(),
            TokenMetadata {
                token_identifier: token_identifier.clone(),
                owner: Some(to),
                operator: None,
                properties,
                is_burned: false,
                minted_at: time(),
                minted_by: caller(),
                transferred_at: None,
                transferred_by: None,
                burned_at: None,
                burned_by: None,
            },
        );

        // update cache
        ledger
            .owners
            .entry(to)
            .or_insert_with(HashSet::new)
            .insert(token_identifier.clone());

        // history
        Ok(ledger.add_tx(
            "mint".into(),
            vec![
                ("to".into(), GenericValue::Principal(to)),
                (
                    "token_identifier".into(),
                    GenericValue::NatContent(token_identifier),
                ),
            ],
        ))
    })
}

#[update(name = "burn")]
#[candid_method(update, rename = "burn")]
fn burn(token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    let token_metadata = token_metadata(token_identifier.clone())?;

    // check valid owner
    token_metadata
        .owner
        .eq(&Some(caller()))
        .then(|| ())
        .ok_or(NftError::Unauthorized)?;

    let old_owner = token_metadata.owner;
    let old_operator = token_metadata.operator;

    LEDGER.with(|ledger| {
        let mut ledger = ledger.borrow_mut();

        // remove cache
        if let Some(old_owner) = old_owner {
            if let Some(tokens) = ledger.owners.get_mut(&old_owner) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.owners.remove(&old_owner);
                }
            }
        }
        if let Some(old_operator) = old_operator {
            if let Some(tokens) = ledger.operators.get_mut(&old_operator) {
                tokens.remove(&token_identifier);
                // remove key when empty cache
                if tokens.is_empty() {
                    ledger.operators.remove(&old_operator);
                }
            }
        }

        let token = ledger.tokens.get_mut(&token_identifier).unwrap();
        token.owner = None;
        token.operator = None;
        token.is_burned = true;
        token.burned_at = Some(time());
        token.burned_by = Some(caller());

        // history
        Ok(ledger.add_tx(
            "burn".into(),
            vec![(
                "token_identifier".into(),
                GenericValue::NatContent(token_identifier),
            )],
        ))
    })
}

#[query(name = "transaction")]
#[candid_method(query, rename = "transaction")]
fn transaction(tx_id: Nat) -> Result<TxEvent, NftError> {
    let index = tx_id
        .0
        .to_usize()
        .ok_or_else(|| NftError::Other("failed to cast usize from nat".into()))?;
    LEDGER.with(|ledger| {
        ledger
            .borrow()
            .tx_records
            .get(index - 1) // zero base
            .cloned()
            .ok_or(NftError::TxNotFound)
    })
}

#[query(name = "totalTransactions")]
#[candid_method(query, rename = "totalTransactions")]
fn total_transactions() -> Nat {
    LEDGER.with(|ledger| ledger.borrow().tx_records.len().into())
}

// NOTE:
// If you plan to store gigabytes of state and upgrade the code,
// Using stable memory as the main storage is a good option to consider
#[pre_upgrade]
fn pre_upgrade() {
    if let Err(err) = ic_cdk::storage::stable_save::<(Metadata, Ledger)>((
        METADATA.with(|metadata| metadata.borrow().clone()),
        LEDGER.with(|ledger| ledger.borrow().clone()),
    )) {
        // NOTE: be careful and make sure it will never trap
        trap(&format!(
            "An error occurred when saving to stable memory (pre_upgrade): {:?}",
            err
        ));
    };
}

#[post_upgrade]
fn post_upgrade() {
    match ic_cdk::storage::stable_restore::<(Metadata, Ledger)>() {
        Ok((metadata_store, ledger_store)) => {
            METADATA.with(|metadata| {
                *metadata.borrow_mut() = metadata_store;
                metadata.borrow_mut().upgraded_at = time();
            });
            LEDGER.with(|ledger| {
                *ledger.borrow_mut() = ledger_store;
            });
        }
        Err(err) => {
            trap(&format!(
                "An error occurred when loading from stable memory (post_upgrade): {:?}",
                err
            ));
        }
    }
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    ic_cdk::export::candid::export_service!();
    std::print!("{}", __export_service());
}

// ROADMAP:
// - notification
// - consider support: multiple operators per owner
