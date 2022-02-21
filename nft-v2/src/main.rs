use ic_cdk::export::candid::{Nat, candid_method, CandidType, Deserialize};
use ic_cdk::export::{Principal};
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use ic_cdk::api::time;

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    ic_cdk::export::candid::export_service!();
    std::print!("{}", __export_service());
}

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
    created_at: u64
}

thread_local!(
    static METADATA: RefCell<Metadata> = RefCell::new(Metadata::default());
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
                created_at: time()
            }
        }
    });
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

#[query(name = "name")]
#[candid_method(query, rename = "name")]
fn name() -> Option<String> {
    METADATA.with(|metadata| {
        metadata.borrow().name.clone()
    })
}

#[query(name = "logo")]
#[candid_method(query, rename = "logo")]
fn logo() -> Option<String> {
    METADATA.with(|metadata| {
        metadata.borrow().name.clone()
    })
}

#[query(name = "symbol")]
#[candid_method(query, rename = "symbol")]
fn symbol() -> Option<String> {
    METADATA.with(|metadata| {
        metadata.borrow().name.clone()
    })
}

#[query(name = "totalSupply")]
#[candid_method(query, rename = "totalSupply")]
fn total_supply() -> Nat {
    Nat::from(0)
}

#[query(name = "getMetadata")]
#[candid_method(query, rename = "getMetadata")]
fn get_metadata() -> Metadata {
    METADATA.with(|metadata| {
        metadata.borrow().clone()
    })
}

#[derive(CandidType)]
struct NftMetadata {}

#[query(name = "approve")]
#[candid_method(query, rename = "approve")]
fn approve(spender: Principal, token_id: u64) -> Result<(), NftError> {
    Ok(())
}
