/// TODO: use ManualReply when new ic_cdk version release
/// https://github.com/dfinity/cdk-rs/pull/210/files
use ic_cdk::api::call::ManualReply;
use ic_cdk::api::{caller, time, trap};
use ic_cdk::export::candid::{candid_method, CandidType, Deserialize, Int, Nat};
use ic_cdk::export::Principal;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use num_traits::cast::ToPrimitive;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::ops::Not;
use types::*;
mod types {
    use super::*;
    #[derive(CandidType, Deserialize)]
    pub struct InitArgs {
        pub name: Option<String>,
        pub logo: Option<String>,
        pub symbol: Option<String>,
        pub custodians: Option<HashSet<Principal>>,
    }
    #[derive(CandidType, Default, Deserialize)]
    pub struct Metadata {
        pub name: Option<String>,
        pub logo: Option<String>,
        pub symbol: Option<String>,
        pub custodians: HashSet<Principal>,
        pub created_at: u64,
        pub upgraded_at: u64,
    }
    pub type TokenIdentifier = Nat;
    #[derive(CandidType, Deserialize)]
    pub enum GenericValue {
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
    /// Please notice that the example of internal data structure as below doesn't represent your final storage, please use with caution.
    /// Feel free to change the storage and behavior that align with your expected business.
    /// The canister should match with the signature defined in `spec.md` in order to be considered as a DIP721 contract.
    #[derive(CandidType, Deserialize)]
    pub struct TokenMetadata {
        pub token_identifier: TokenIdentifier,
        pub owner: Option<Principal>,
        pub operator: Option<Principal>,
        pub is_burned: bool,
        pub properties: Vec<(String, GenericValue)>,
        pub minted_at: u64,
        pub minted_by: Principal,
        pub transferred_at: Option<u64>,
        pub transferred_by: Option<Principal>,
        pub approved_at: Option<u64>,
        pub approved_by: Option<Principal>,
        pub burned_at: Option<u64>,
        pub burned_by: Option<Principal>,
    }
    #[derive(CandidType, Deserialize)]
    pub struct TxEvent {
        pub time: u64,
        pub caller: Principal,
        pub operation: String,
        pub details: Vec<(String, GenericValue)>,
    }
    #[derive(CandidType)]
    pub enum SupportedInterface {
        Approval,
        Mint,
        Burn,
        TransactionHistory,
    }
    #[derive(CandidType)]
    pub enum NftError {
        Unauthorized,
        OwnerNotFound,
        OperatorNotFound,
        TokenNotFound,
        ExistedNFT,
        SelfApprove,
        SelfTransfer,
        TxNotFound,
        Other(String),
    }
}
mod ledger {
    use super::*;

    thread_local!(
        static LEDGER: RefCell<Ledger> = RefCell::new(Ledger::default());
    );

    pub fn with<T, F: FnOnce(&Ledger) -> T>(f: F) -> T {
        LEDGER.with(|ledger| f(&ledger.borrow()))
    }

    pub fn with_mut<T, F: FnOnce(&mut Ledger) -> T>(f: F) -> T {
        LEDGER.with(|ledger| f(&mut ledger.borrow_mut()))
    }

    #[derive(CandidType, Default, Deserialize)]
    pub struct Ledger {
        metadata: Metadata,
        tokens: HashMap<TokenIdentifier, TokenMetadata>, // recommend to have sequential id
        owners: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
        operators: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
        tx_records: Vec<TxEvent>,
    }

    impl Ledger {
        pub fn init_metadata(&mut self, args: Option<InitArgs>) {
            let metadata = self.metadata_mut();
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
        }

        pub fn metadata(&self) -> &Metadata {
            &self.metadata
        }

        pub fn metadata_mut(&mut self) -> &mut Metadata {
            &mut self.metadata
        }

        pub fn tokens_count(&self) -> Nat {
            self.tokens.len().into()
        }

        pub fn is_token_existed(&self, token_identifier: &TokenIdentifier) -> bool {
            self.tokens.contains_key(token_identifier)
        }

        pub fn token_metadata(
            &self,
            token_identifier: &TokenIdentifier,
        ) -> Result<&TokenMetadata, NftError> {
            self.tokens
                .get(token_identifier)
                .ok_or(NftError::TokenNotFound)
        }

        pub fn add_token_metadata(
            &mut self,
            token_identifier: TokenIdentifier,
            token_metadata: TokenMetadata,
        ) {
            self.tokens.insert(token_identifier, token_metadata);
        }

        pub fn owner_token_identifiers(
            &self,
            owner: &Principal,
        ) -> Result<&HashSet<TokenIdentifier>, NftError> {
            self.owners.get(owner).ok_or(NftError::OwnerNotFound)
        }

        pub fn owner_of(
            &self,
            token_identifier: &TokenIdentifier,
        ) -> Result<Option<Principal>, NftError> {
            self.token_metadata(token_identifier)
                .map(|token_metadata| token_metadata.owner)
        }

        pub fn owner_token_metadata(
            &self,
            owner: &Principal,
        ) -> Result<Vec<&TokenMetadata>, NftError> {
            self.owner_token_identifiers(owner)?
                .iter()
                .map(|token_identifier| self.token_metadata(token_identifier))
                .collect()
        }

        pub fn update_owner_cache(
            &mut self,
            token_identifier: &TokenIdentifier,
            old_owner: Option<Principal>,
            new_owner: Option<Principal>,
        ) {
            if let Some(old_owner) = old_owner {
                let old_owner_token_identifiers = self
                    .owners
                    .get_mut(&old_owner)
                    .expect("couldn't find owner");
                old_owner_token_identifiers.remove(token_identifier);
                if old_owner_token_identifiers.is_empty() {
                    self.owners.remove(&old_owner);
                }
            }
            if let Some(new_owner) = new_owner {
                self.owners
                    .entry(new_owner)
                    .or_insert_with(HashSet::new)
                    .insert(token_identifier.clone());
            }
        }

        pub fn operator_token_identifiers(
            &self,
            operator: &Principal,
        ) -> Result<&HashSet<TokenIdentifier>, NftError> {
            self.operators
                .get(operator)
                .ok_or(NftError::OperatorNotFound)
        }

        pub fn operator_of(
            &self,
            token_identifier: &TokenIdentifier,
        ) -> Result<Option<Principal>, NftError> {
            self.token_metadata(token_identifier)
                .map(|token_metadata| token_metadata.operator)
        }

        pub fn operator_token_metadata(
            &self,
            operator: &Principal,
        ) -> Result<Vec<&TokenMetadata>, NftError> {
            self.operator_token_identifiers(operator)?
                .iter()
                .map(|token_identifier| self.token_metadata(token_identifier))
                .collect()
        }

        pub fn update_operator_cache(
            &mut self,
            token_identifier: &TokenIdentifier,
            old_operator: Option<Principal>,
            new_operator: Option<Principal>,
        ) {
            if let Some(old_operator) = old_operator {
                let old_operator_token_identifiers = self
                    .operators
                    .get_mut(&old_operator)
                    .expect("couldn't find operator");
                old_operator_token_identifiers.remove(token_identifier);
                if old_operator_token_identifiers.is_empty() {
                    self.operators.remove(&old_operator);
                }
            }
            if let Some(new_operator) = new_operator {
                self.operators
                    .entry(new_operator)
                    .or_insert_with(HashSet::new)
                    .insert(token_identifier.clone());
            }
        }

        pub fn approve(
            &mut self,
            token_identifier: &TokenIdentifier,
            new_operator: Option<Principal>,
        ) {
            let token_metadata = self
                .tokens
                .get_mut(token_identifier)
                .expect("couldn't find token metadata");
            token_metadata.operator = new_operator;
            token_metadata.approved_by = Some(caller());
            token_metadata.approved_at = Some(time());
        }

        pub fn transfer(
            &mut self,
            token_identifier: &TokenIdentifier,
            new_owner: Option<Principal>,
        ) {
            let token_metadata = self
                .tokens
                .get_mut(token_identifier)
                .expect("couldn't find token metadata");
            token_metadata.owner = new_owner;
            token_metadata.transferred_at = Some(time());
            token_metadata.transferred_by = Some(caller());
            token_metadata.operator = None;
        }

        pub fn burn(&mut self, token_identifier: &TokenIdentifier) {
            let token_metadata = self
                .tokens
                .get_mut(token_identifier)
                .expect("couldn't find token metadata");
            token_metadata.owner = None;
            token_metadata.operator = None;
            token_metadata.is_burned = true;
            token_metadata.burned_at = Some(time());
            token_metadata.burned_by = Some(caller());
        }

        pub fn get_tx(&self, tx_id: usize) -> Option<&TxEvent> {
            self.tx_records.get(tx_id)
        }

        pub fn add_tx(&mut self, operation: String, details: Vec<(String, GenericValue)>) -> Nat {
            self.tx_records.push(TxEvent {
                time: time(),
                operation,
                caller: caller(),
                details,
            });
            Nat::from(self.tx_records.len())
        }

        pub fn tx_count(&self) -> Nat {
            self.tx_records.len().into()
        }
    }
}

#[init]
#[candid_method(init)]
fn init(args: Option<InitArgs>) {
    ledger::with_mut(|ledger| ledger.init_metadata(args));
}

fn is_canister_custodian() -> Result<(), String> {
    ledger::with(|ledger| {
        ledger
            .metadata()
            .custodians
            .contains(&caller())
            .then(|| ())
            .ok_or_else(|| "Caller is not an custodian of canister".into())
    })
}

#[query(name = "metadata", manual_reply = true)]
#[candid_method(query, rename = "metadata")]
fn metadata() -> ManualReply<Metadata> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata()))
}

#[query(name = "name", manual_reply = true)]
#[candid_method(query, rename = "name")]
fn name() -> ManualReply<Option<String>> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata().name.as_ref()))
}

#[update(name = "setName", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setName")]
fn set_name(name: String) {
    ledger::with_mut(|ledger| ledger.metadata_mut().name = Some(name));
}

#[query(name = "logo", manual_reply = true)]
#[candid_method(query, rename = "logo")]
fn logo() -> ManualReply<Option<String>> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata().logo.as_ref()))
}

#[update(name = "setLogo", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setLogo")]
fn set_logo(logo: String) {
    ledger::with_mut(|ledger| ledger.metadata_mut().logo = Some(logo));
}

#[query(name = "symbol", manual_reply = true)]
#[candid_method(query, rename = "symbol")]
fn symbol() -> ManualReply<Option<String>> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata().symbol.as_ref()))
}

#[update(name = "setSymbol", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setSymbol")]
fn set_symbol(symbol: String) {
    ledger::with_mut(|ledger| ledger.metadata_mut().symbol = Some(symbol));
}

#[query(name = "custodians", manual_reply = true)]
#[candid_method(query, rename = "custodians")]
fn custodians() -> ManualReply<HashSet<Principal>> {
    ledger::with(|ledger| ManualReply::one(&ledger.metadata().custodians))
}

#[update(name = "setCustodians", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setCustodians")]
fn set_custodians(custodians: HashSet<Principal>) {
    ledger::with_mut(|ledger| ledger.metadata_mut().custodians = custodians);
}

/// Returns the total current supply of NFT tokens.
/// NFTs that are minted and later burned explicitly or sent to the zero address should also count towards totalSupply.
#[query(name = "totalSupply")]
#[candid_method(query, rename = "totalSupply")]
fn total_supply() -> Nat {
    ledger::with(|ledger| ledger.tokens_count())
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

#[query(name = "balanceOf", manual_reply = true)]
#[candid_method(query, rename = "balanceOf")]
fn balance_of(owner: Principal) -> ManualReply<Result<Nat, NftError>> {
    ledger::with(|ledger| {
        ManualReply::one(
            ledger
                .owner_token_identifiers(&owner)
                .map(|token_identifiers| Nat::from(token_identifiers.len())),
        )
    })
}

#[query(name = "ownerOf", manual_reply = true)]
#[candid_method(query, rename = "ownerOf")]
fn owner_of(token_identifier: TokenIdentifier) -> ManualReply<Result<Option<Principal>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.owner_of(&token_identifier)))
}

#[query(name = "operatorOf", manual_reply = true)]
#[candid_method(query, rename = "operatorOf")]
fn operator_of(
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<Option<Principal>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.operator_of(&token_identifier)))
}

#[query(name = "tokenMetadata", manual_reply = true)]
#[candid_method(query, rename = "tokenMetadata")]
fn token_metadata(
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<TokenMetadata, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.token_metadata(&token_identifier)))
}

#[query(name = "ownerTokenMetadata", manual_reply = true)]
#[candid_method(query, rename = "ownerTokenMetadata")]
fn owner_token_metadata(owner: Principal) -> ManualReply<Result<Vec<TokenMetadata>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.owner_token_metadata(&owner)))
}

#[query(name = "operatorTokenMetadata", manual_reply = true)]
#[candid_method(query, rename = "operatorTokenMetadata")]
fn operator_token_metadata(
    operator: Principal,
) -> ManualReply<Result<Vec<TokenMetadata>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.operator_token_metadata(&operator)))
}

#[query(name = "ownerTokenIdentifiers", manual_reply = true)]
#[candid_method(query, rename = "ownerTokenIdentifiers")]
fn owner_token_identifiers(
    owner: Principal,
) -> ManualReply<Result<Vec<TokenIdentifier>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.owner_token_identifiers(&owner)))
}

#[query(name = "operatorTokenIdentifiers", manual_reply = true)]
#[candid_method(query, rename = "operatorTokenIdentifiers")]
fn operator_token_identifiers(
    operator: Principal,
) -> ManualReply<Result<Vec<TokenIdentifier>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.operator_token_identifiers(&operator)))
}

/// since we've supported single operator per owner only
/// so when `is_approved` is false that mean set all caller's nfts to None regardless of `operator`
/// otherwise set all caller's nfts to `operator`
#[update(name = "setApprovalForAll", manual_reply = true)]
#[candid_method(update, rename = "setApprovalForAll")]
fn set_approval_for_all(
    operator: Principal,
    is_approved: bool,
) -> ManualReply<Result<Nat, NftError>> {
    ledger::with_mut(|ledger| {
        ManualReply::one(
            operator
                .ne(&caller())
                .then(|| {
                    let owner_token_identifiers =
                        ledger.owner_token_identifiers(&caller())?.clone();
                    for token_identifier in owner_token_identifiers {
                        let old_operator = ledger.operator_of(&token_identifier)?;
                        let new_operator = if is_approved { Some(operator) } else { None };
                        ledger.update_operator_cache(&token_identifier, old_operator, new_operator);
                        ledger.approve(&token_identifier, new_operator);
                    }
                    Ok(ledger.add_tx(
                        "setApprovalForAll".into(),
                        vec![
                            ("operator".into(), GenericValue::Principal(operator)),
                            ("is_approved".into(), GenericValue::BoolContent(is_approved)),
                        ],
                    ))
                })
                .unwrap_or(Err(NftError::SelfApprove)),
        )
    })
}

#[query(name = "isApprovedForAll", manual_reply = true)]
#[candid_method(query, rename = "isApprovedForAll")]
fn is_approved_for_all(
    owner: Principal,
    operator: Principal,
) -> ManualReply<Result<bool, NftError>> {
    ledger::with(|ledger| {
        ManualReply::one(
            ledger
                .owner_token_metadata(&owner)
                .map(|owner_token_metadata| {
                    owner_token_metadata
                        .iter()
                        .all(|token_metadata| token_metadata.operator.eq(&Some(operator)))
                }),
        )
    })
}

#[update(name = "approve", manual_reply = true)]
#[candid_method(update, rename = "approve")]
fn approve(
    operator: Principal,
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<Nat, NftError>> {
    ledger::with_mut(|ledger| {
        ManualReply::one(
            operator
                .ne(&caller())
                .then(|| {
                    ledger
                        .owner_of(&token_identifier)?
                        .eq(&Some(caller()))
                        .then(|| ())
                        .ok_or(NftError::Unauthorized)?;
                    ledger.update_operator_cache(
                        &token_identifier,
                        ledger.operator_of(&token_identifier)?,
                        Some(operator),
                    );
                    ledger.approve(&token_identifier, Some(operator));
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
                .unwrap_or(Err(NftError::SelfApprove)),
        )
    })
}

#[update(name = "transfer", manual_reply = true)]
#[candid_method(update, rename = "transfer")]
fn transfer(
    to: Principal,
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<Nat, NftError>> {
    ledger::with_mut(|ledger| {
        ManualReply::one(
            to.ne(&caller())
                .then(|| {
                    let old_owner = ledger.owner_of(&token_identifier)?;
                    let old_operator = ledger.operator_of(&token_identifier)?;
                    old_owner
                        .eq(&Some(caller()))
                        .then(|| ())
                        .ok_or(NftError::Unauthorized)?;
                    ledger.update_owner_cache(&token_identifier, old_owner, Some(to));
                    ledger.update_operator_cache(&token_identifier, old_operator, None);
                    ledger.transfer(&token_identifier, Some(to));
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
                .unwrap_or(Err(NftError::SelfTransfer)),
        )
    })
}

#[update(name = "transferFrom", manual_reply = true)]
#[candid_method(update, rename = "transferFrom")]
fn transfer_from(
    owner: Principal,
    to: Principal,
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<Nat, NftError>> {
    ledger::with_mut(|ledger| {
        ManualReply::one(
            owner
                .ne(&to)
                .then(|| {
                    let old_owner = ledger.owner_of(&token_identifier)?;
                    let old_operator = ledger.operator_of(&token_identifier)?;
                    old_owner
                        .eq(&Some(owner))
                        .then(|| ())
                        .ok_or(NftError::Unauthorized)?;
                    old_operator
                        .eq(&Some(caller()))
                        .then(|| ())
                        .ok_or(NftError::Unauthorized)?;
                    ledger.update_owner_cache(&token_identifier, old_owner, Some(to));
                    ledger.update_operator_cache(&token_identifier, old_operator, None);
                    ledger.transfer(&token_identifier, Some(to));
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
                .unwrap_or(Err(NftError::SelfTransfer)),
        )
    })
}

#[update(name = "mint", guard = "is_canister_custodian", manual_reply = true)]
#[candid_method(update, rename = "mint")]
fn mint(
    to: Principal,
    token_identifier: TokenIdentifier,
    properties: Vec<(String, GenericValue)>,
) -> ManualReply<Result<Nat, NftError>> {
    ledger::with_mut(|ledger| {
        ManualReply::one(
            ledger
                .is_token_existed(&token_identifier)
                .not()
                .then(|| {
                    ledger.add_token_metadata(
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
                            approved_at: None,
                            approved_by: None,
                            burned_at: None,
                            burned_by: None,
                        },
                    );
                    ledger.update_owner_cache(&token_identifier, None, Some(to));
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
                .unwrap_or(Err(NftError::ExistedNFT)),
        )
    })
}

#[update(name = "burn", manual_reply = true)]
#[candid_method(update, rename = "burn")]
fn burn(token_identifier: TokenIdentifier) -> ManualReply<Result<Nat, NftError>> {
    ledger::with_mut(|ledger| {
        ManualReply::one(ledger.owner_of(&token_identifier).and_then(|old_owner| {
            old_owner
                .eq(&Some(caller()))
                .then(|| ())
                .ok_or(NftError::Unauthorized)?;
            let old_operator = ledger.operator_of(&token_identifier)?;
            ledger.update_owner_cache(&token_identifier, old_owner, None);
            ledger.update_operator_cache(&token_identifier, old_operator, None);
            ledger.burn(&token_identifier);
            Ok(ledger.add_tx(
                "burn".into(),
                vec![(
                    "token_identifier".into(),
                    GenericValue::NatContent(token_identifier),
                )],
            ))
        }))
    })
}

#[query(name = "transaction", manual_reply = true)]
#[candid_method(query, rename = "transaction")]
fn transaction(tx_id: Nat) -> ManualReply<Result<TxEvent, NftError>> {
    ledger::with(|ledger| {
        ManualReply::one(
            tx_id
                .0
                .to_usize()
                .ok_or_else(|| NftError::Other("failed to cast usize from nat".into()))
                .and_then(|index| ledger.get_tx(index - 1).ok_or(NftError::TxNotFound)),
        )
    })
}

#[query(name = "totalTransactions", manual_reply = true)]
#[candid_method(query, rename = "totalTransactions")]
fn total_transactions() -> ManualReply<Nat> {
    ledger::with(|ledger| ManualReply::one(ledger.tx_count()))
}

/// NOTE:
/// If you plan to store gigabytes of state and upgrade the code,
/// Using stable memory as the main storage is a good option to consider
#[pre_upgrade]
fn pre_upgrade() {
    ledger::with(|ledger| {
        if let Err(err) = ic_cdk::storage::stable_save::<(&ledger::Ledger,)>((ledger,)) {
            trap(&format!(
                "An error occurred when saving to stable memory (pre_upgrade): {:?}",
                err
            ));
        };
    })
}

#[post_upgrade]
fn post_upgrade() {
    ledger::with_mut(
        |ledger| match ic_cdk::storage::stable_restore::<(ledger::Ledger,)>() {
            Ok((ledger_store,)) => *ledger = ledger_store,
            Err(err) => {
                trap(&format!(
                    "An error occurred when loading from stable memory (post_upgrade): {:?}",
                    err
                ));
            }
        },
    )
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
