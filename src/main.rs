use cap_sdk::{handshake, insert_sync, DetailValue, IndefiniteEvent};
use compile_time_run::run_command_str;
use ic_cdk::api::call::ManualReply;
use ic_cdk::api::{caller, canister_balance128, time, trap};
use ic_cdk::export::candid::{candid_method, CandidType, Deserialize, Int, Nat};
use ic_cdk::export::Principal;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};

use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::ops::Not;
use types::*;

mod legacy;

mod types {
    use super::*;
    #[derive(CandidType, Deserialize)]
    pub struct InitArgs {
        pub name: Option<String>,
        pub logo: Option<String>,
        pub symbol: Option<String>,
        pub custodians: Option<HashSet<Principal>>,
        pub cap: Option<Principal>,
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
    #[derive(CandidType)]
    pub struct Stats {
        pub total_transactions: Nat,
        pub total_supply: Nat,
        pub cycles: Nat,
        pub total_unique_holders: Nat,
    }
    pub type TokenIdentifier = Nat;
    #[derive(CandidType, Deserialize)]
    pub enum GenericValue {
        BoolContent(bool),
        TextContent(String),
        BlobContent(Vec<u8>),
        Principal(Principal),
        Nat8Content(u8),
        Nat16Content(u16),
        Nat32Content(u32),
        Nat64Content(u64),
        NatContent(Nat),
        Int8Content(i8),
        Int16Content(i16),
        Int32Content(i32),
        Int64Content(i64),
        IntContent(Int),
        FloatContent(f64), // motoko only support f64
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
    #[derive(CandidType)]
    pub enum SupportedInterface {
        Approval,
        Mint,
        Burn,
    }
    #[derive(CandidType)]
    pub enum NftError {
        UnauthorizedOwner,
        UnauthorizedOperator,
        OwnerNotFound,
        OperatorNotFound,
        TokenNotFound,
        ExistedNFT,
        SelfApprove,
        SelfTransfer,
        // Other(String), // for debugging
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
        pub metadata: Metadata,
        pub tokens: HashMap<TokenIdentifier, TokenMetadata>, // recommend to have sequential id
        pub owners: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
        pub operators: HashMap<Principal, HashSet<TokenIdentifier>>, // quick lookup
        pub tx_count: Nat,
    }

    impl Ledger {
        pub fn init_metadata(&mut self, default_custodian: Principal, args: Option<InitArgs>) {
            let metadata = self.metadata_mut();
            metadata.custodians.insert(default_custodian);
            if let Some(args) = args {
                metadata.name = args.name;
                metadata.logo = args.logo;
                metadata.symbol = args.symbol;
                if let Some(custodians) = args.custodians {
                    for custodians in custodians {
                        metadata.custodians.insert(custodians);
                    }
                }

                // initiate cap with specified canister, otherwise use mainnet canister
                handshake(1_000_000_000_000, args.cap);
            } else {
                // default to mainnet cap canister if no args are specified
                handshake(1_000_000_000_000, None);
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

        pub fn tokens_count(&self) -> usize {
            self.tokens.len()
        }

        pub fn tx_count(&self) -> Nat {
            self.tx_count.clone()
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

        pub fn owners_count(&self) -> usize {
            self.owners.len()
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
            approved_by: Principal,
            token_identifier: &TokenIdentifier,
            new_operator: Option<Principal>,
        ) {
            let token_metadata = self
                .tokens
                .get_mut(token_identifier)
                .expect("couldn't find token metadata");
            token_metadata.operator = new_operator;
            token_metadata.approved_by = Some(approved_by);
            token_metadata.approved_at = Some(time());
        }

        pub fn transfer(
            &mut self,
            transferred_by: Principal,
            token_identifier: &TokenIdentifier,
            new_owner: Option<Principal>,
        ) {
            let token_metadata = self
                .tokens
                .get_mut(token_identifier)
                .expect("couldn't find token metadata");
            token_metadata.owner = new_owner;
            token_metadata.transferred_by = Some(transferred_by);
            token_metadata.transferred_at = Some(time());
            token_metadata.operator = None;
        }

        pub fn burn(&mut self, burned_by: Principal, token_identifier: &TokenIdentifier) {
            let token_metadata = self
                .tokens
                .get_mut(token_identifier)
                .expect("couldn't find token metadata");
            token_metadata.owner = None;
            token_metadata.operator = None;
            token_metadata.is_burned = true;
            token_metadata.burned_by = Some(burned_by);
            token_metadata.burned_at = Some(time());
        }

        pub fn inc_tx(&mut self) -> Nat {
            self.tx_count += 1;
            self.tx_count.clone()
        }
    }
}

#[init]
#[candid_method(init)]
fn init(args: Option<InitArgs>) {
    ledger::with_mut(|ledger| ledger.init_metadata(caller(), args));
}

pub fn is_canister_custodian() -> Result<(), String> {
    ledger::with(|ledger| {
        ledger
            .metadata()
            .custodians
            .contains(&caller())
            .then_some(())
            .ok_or_else(|| "Caller is not an custodian of canister".into())
    })
}

// ==================================================================================================
// cover metadata
// ==================================================================================================
#[query()]
#[candid_method(query)]
fn git_commit_hash() -> &'static str {
    run_command_str!("git", "rev-parse", "HEAD")
}

#[query()]
#[candid_method(query)]
fn rust_toolchain_info() -> &'static str {
    run_command_str!("rustup", "show")
}

#[query()]
#[candid_method(query)]
fn dfx_info() -> &'static str {
    run_command_str!("dfx", "--version")
}

// ==================================================================================================
// metadata
// ==================================================================================================
#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_name() -> ManualReply<Option<String>> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata().name.as_ref()))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_logo() -> ManualReply<Option<String>> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata().logo.as_ref()))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_symbol() -> ManualReply<Option<String>> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata().symbol.as_ref()))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_custodians() -> ManualReply<HashSet<Principal>> {
    ledger::with(|ledger| ManualReply::one(&ledger.metadata().custodians))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_metadata() -> ManualReply<Metadata> {
    ledger::with(|ledger| ManualReply::one(ledger.metadata()))
}

#[update(guard = "is_canister_custodian")]
#[candid_method(update)]
fn dip721_set_name(name: String) {
    ledger::with_mut(|ledger| ledger.metadata_mut().name = Some(name));
}

#[update(guard = "is_canister_custodian")]
#[candid_method(update)]
fn dip721_set_logo(logo: String) {
    ledger::with_mut(|ledger| ledger.metadata_mut().logo = Some(logo));
}

#[update(guard = "is_canister_custodian")]
#[candid_method(update)]
fn dip721_set_symbol(symbol: String) {
    ledger::with_mut(|ledger| ledger.metadata_mut().symbol = Some(symbol));
}

#[update(guard = "is_canister_custodian")]
#[candid_method(update)]
fn dip721_set_custodians(custodians: HashSet<Principal>) {
    ledger::with_mut(|ledger| ledger.metadata_mut().custodians = custodians);
}

// ==================================================================================================
// stats
// ==================================================================================================
/// Returns the total current supply of NFT tokens.
/// NFTs that are minted and later burned explicitly or sent to the zero address should also count towards totalSupply.
#[query()]
#[candid_method(query)]
fn dip721_total_supply() -> Nat {
    ledger::with(|ledger| Nat::from(ledger.tokens_count()))
}

#[query()]
#[candid_method(query)]
fn dip721_total_transactions() -> Nat {
    ledger::with(|ledger| ledger.tx_count())
}

#[query()]
#[candid_method(query)]
fn dip721_cycles() -> Nat {
    Nat::from(canister_balance128())
}

#[query()]
#[candid_method(query)]
fn dip721_total_unique_holders() -> Nat {
    ledger::with(|ledger| Nat::from(ledger.owners_count()))
}

#[query()]
#[candid_method(query)]
fn dip721_stats() -> Stats {
    Stats {
        total_transactions: dip721_total_transactions(),
        total_supply: dip721_total_supply(),
        cycles: dip721_cycles(),
        total_unique_holders: dip721_total_unique_holders(),
    }
}

// ==================================================================================================
// supported interfaces
// ==================================================================================================
#[query()]
#[candid_method(query)]
fn dip721_supported_interfaces() -> Vec<SupportedInterface> {
    vec![
        SupportedInterface::Approval,
        SupportedInterface::Mint,
        SupportedInterface::Burn,
    ]
}

// ==================================================================================================
// balance
// ==================================================================================================
#[query()]
#[candid_method(query)]
fn dip721_balance_of(owner: Principal) -> Result<Nat, NftError> {
    ledger::with(|ledger| {
        ledger
            .owner_token_identifiers(&owner)
            .map(|token_identifiers| Nat::from(token_identifiers.len()))
    })
}

// ==================================================================================================
// token ownership
// ==================================================================================================
#[query()]
#[candid_method(query)]
fn dip721_owner_of(token_identifier: TokenIdentifier) -> Result<Option<Principal>, NftError> {
    ledger::with(|ledger| ledger.owner_of(&token_identifier))
}

#[query()]
#[candid_method(query)]
fn dip721_operator_of(token_identifier: TokenIdentifier) -> Result<Option<Principal>, NftError> {
    ledger::with(|ledger| ledger.operator_of(&token_identifier))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_owner_token_metadata(
    owner: Principal,
) -> ManualReply<Result<Vec<TokenMetadata>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.owner_token_metadata(&owner)))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_operator_token_metadata(
    operator: Principal,
) -> ManualReply<Result<Vec<TokenMetadata>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.operator_token_metadata(&operator)))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_owner_token_identifiers(
    owner: Principal,
) -> ManualReply<Result<Vec<TokenIdentifier>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.owner_token_identifiers(&owner)))
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_operator_token_identifiers(
    operator: Principal,
) -> ManualReply<Result<Vec<TokenIdentifier>, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.operator_token_identifiers(&operator)))
}

// ==================================================================================================
// token metadata
// ==================================================================================================
#[query(manual_reply = true)]
#[candid_method(query)]
fn dip721_token_metadata(
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<TokenMetadata, NftError>> {
    ledger::with(|ledger| ManualReply::one(ledger.token_metadata(&token_identifier)))
}

// ==================================================================================================
// approved for all
// ==================================================================================================
#[query()]
#[candid_method(query)]
fn dip721_is_approved_for_all(owner: Principal, operator: Principal) -> Result<bool, NftError> {
    ledger::with(|ledger| {
        ledger
            .owner_token_metadata(&owner)
            .map(|owner_token_metadata| {
                owner_token_metadata
                    .iter()
                    .all(|token_metadata| token_metadata.operator.eq(&Some(operator)))
            })
    })
}

// ==================================================================================================
// core api
// ==================================================================================================
#[update]
#[candid_method(update)]
fn dip721_approve(operator: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    ledger::with_mut(|ledger| {
        let caller = caller();
        operator
            .ne(&caller)
            .then_some(())
            .ok_or(NftError::SelfApprove)?;
        ledger
            .owner_of(&token_identifier)?
            .eq(&Some(caller))
            .then_some(())
            .ok_or(NftError::UnauthorizedOwner)?;
        ledger.update_operator_cache(
            &token_identifier,
            ledger.operator_of(&token_identifier)?,
            Some(operator),
        );
        ledger.approve(caller, &token_identifier, Some(operator));

        insert_sync(IndefiniteEvent {
            caller,
            operation: "approve".into(),
            details: vec![
                ("operator".into(), DetailValue::from(operator)),
                (
                    "token_identifier".into(),
                    DetailValue::from(token_identifier.to_string()),
                ),
            ],
        });

        Ok(ledger.inc_tx() - 1)
    })
}

/// since we've supported single operator per owner only
/// so when `is_approved` is false that mean set all caller's nfts to None regardless of `operator`
/// otherwise set all caller's nfts to `operator`
#[update]
#[candid_method(update)]
fn dip721_set_approval_for_all(operator: Principal, is_approved: bool) -> Result<Nat, NftError> {
    ledger::with_mut(|ledger| {
        let caller = caller();
        operator
            .ne(&caller)
            .then_some(())
            .ok_or(NftError::SelfApprove)?;
        let owner_token_identifiers = ledger.owner_token_identifiers(&caller)?.clone();
        for token_identifier in owner_token_identifiers {
            let old_operator = ledger.operator_of(&token_identifier)?;
            let new_operator = if is_approved { Some(operator) } else { None };
            ledger.update_operator_cache(&token_identifier, old_operator, new_operator);
            ledger.approve(caller, &token_identifier, new_operator);
        }

        insert_sync(IndefiniteEvent {
            caller,
            operation: "setApprovalForAll".into(),
            details: vec![
                ("operator".into(), DetailValue::from(operator)),
                (
                    "is_approved".into(),
                    if is_approved {
                        DetailValue::True
                    } else {
                        DetailValue::False
                    },
                ),
            ],
        });

        Ok(ledger.inc_tx() - 1)
    })
}

#[update]
#[candid_method(update)]
fn dip721_transfer(to: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    ledger::with_mut(|ledger| {
        let caller = caller();
        to.ne(&caller).then_some(()).ok_or(NftError::SelfTransfer)?;
        let old_owner = ledger.owner_of(&token_identifier)?;
        let old_operator = ledger.operator_of(&token_identifier)?;
        old_owner
            .eq(&Some(caller))
            .then_some(())
            .ok_or(NftError::UnauthorizedOwner)?;
        ledger.update_owner_cache(&token_identifier, old_owner, Some(to));
        ledger.update_operator_cache(&token_identifier, old_operator, None);
        ledger.transfer(caller, &token_identifier, Some(to));

        insert_sync(IndefiniteEvent {
            caller,
            operation: "transfer".into(),
            details: vec![
                ("owner".into(), DetailValue::from(caller)),
                ("to".into(), DetailValue::from(to)),
                (
                    "token_identifier".into(),
                    DetailValue::from(token_identifier.to_string()),
                ),
            ],
        });

        Ok(ledger.inc_tx() - 1)
    })
}

#[update]
#[candid_method(update)]
fn dip721_transfer_from(
    owner: Principal,
    to: Principal,
    token_identifier: TokenIdentifier,
) -> Result<Nat, NftError> {
    ledger::with_mut(|ledger| {
        let caller = caller();
        owner.ne(&to).then_some(()).ok_or(NftError::SelfTransfer)?;
        let old_owner = ledger.owner_of(&token_identifier)?;
        let old_operator = ledger.operator_of(&token_identifier)?;
        old_owner
            .eq(&Some(owner))
            .then_some(())
            .ok_or(NftError::UnauthorizedOwner)?;
        old_operator
            .eq(&Some(caller))
            .then_some(())
            .ok_or(NftError::UnauthorizedOperator)?;
        ledger.update_owner_cache(&token_identifier, old_owner, Some(to));
        ledger.update_operator_cache(&token_identifier, old_operator, None);
        ledger.transfer(caller, &token_identifier, Some(to));

        insert_sync(IndefiniteEvent {
            caller,
            operation: "transferFrom".into(),
            details: vec![
                ("owner".into(), DetailValue::from(owner)),
                ("to".into(), DetailValue::from(to)),
                (
                    "token_identifier".into(),
                    DetailValue::from(token_identifier.to_string()),
                ),
            ],
        });

        Ok(ledger.inc_tx() - 1)
    })
}

#[update(guard = "is_canister_custodian")]
#[candid_method(update)]
fn dip721_mint(
    to: Principal,
    token_identifier: TokenIdentifier,
    properties: Vec<(String, GenericValue)>,
) -> Result<Nat, NftError> {
    ledger::with_mut(|ledger| {
        let caller = caller();
        ledger
            .is_token_existed(&token_identifier)
            .not()
            .then_some(())
            .ok_or(NftError::ExistedNFT)?;
        ledger.add_token_metadata(
            token_identifier.clone(),
            TokenMetadata {
                token_identifier: token_identifier.clone(),
                owner: Some(to),
                operator: None,
                properties,
                is_burned: false,
                minted_at: time(),
                minted_by: caller,
                transferred_at: None,
                transferred_by: None,
                approved_at: None,
                approved_by: None,
                burned_at: None,
                burned_by: None,
            },
        );
        ledger.update_owner_cache(&token_identifier, None, Some(to));

        insert_sync(IndefiniteEvent {
            caller,
            operation: "mint".into(),
            details: vec![
                ("to".into(), DetailValue::from(to)),
                (
                    "token_identifier".into(),
                    DetailValue::from(token_identifier.to_string()),
                ),
            ],
        });

        Ok(ledger.inc_tx() - 1)
    })
}

#[update]
#[candid_method(update)]
fn dip721_burn(token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    ledger::with_mut(|ledger| {
        let caller = caller();
        let old_owner = ledger.owner_of(&token_identifier)?;
        old_owner
            .eq(&Some(caller))
            .then_some(())
            .ok_or(NftError::UnauthorizedOwner)?;
        let old_operator = ledger.operator_of(&token_identifier)?;
        ledger.update_owner_cache(&token_identifier, old_owner, None);
        ledger.update_operator_cache(&token_identifier, old_operator, None);
        ledger.burn(caller, &token_identifier);

        insert_sync(IndefiniteEvent {
            caller,
            operation: "burn".into(),
            details: vec![(
                "token_identifier".into(),
                DetailValue::from(token_identifier.to_string()),
            )],
        });

        Ok(ledger.inc_tx() - 1)
    })
}

// ==================================================================================================
// upgrade
// ==================================================================================================
/// NOTE:
/// If you plan to store gigabytes of state and upgrade the code,
/// Using stable memory as the main storage is a good option to consider
#[pre_upgrade]
fn pre_upgrade() {
    ledger::with(|ledger| {
        if let Err(err) = ic_cdk::storage::stable_save::<(&ledger::Ledger, cap_sdk::Archive)>((
            ledger,
            cap_sdk::archive(),
        )) {
            trap(&format!(
                "An error occurred when saving to stable memory (pre_upgrade): {:?}",
                err
            ));
        };
    })
}

#[post_upgrade]
fn post_upgrade() {
    ledger::with_mut(|ledger| {
        match ic_cdk::storage::stable_restore::<(ledger::Ledger, cap_sdk::Archive)>() {
            Ok((ledger_store, cap_store)) => {
                *ledger = ledger_store;
                ledger.metadata_mut().upgraded_at = time();
                cap_sdk::from_archive(cap_store);
            }
            Err(err) => {
                trap(&format!(
                    "An error occurred when loading from stable memory (post_upgrade): {:?}",
                    err
                ));
            }
        }
    })
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    std::print!("{}", export_candid());
}

#[query()]
fn export_candid() -> String {
    ic_cdk::export::candid::export_service!();
    __export_service()
}

// ROADMAP:
// - notification
// - consider support: multiple operators per owner
