use crate::ledger::Ledger;
use crate::management::Fleek;
use crate::types::*;

use common::account_identifier::{AccountIdentifierStruct, Subaccount};
use common::principal_id::PrincipalId;

pub use ic_kit::candid::Principal;
use ic_kit::ic::trap;

use cap_sdk::insert;
use cap_sdk::DetailValue;
use cap_sdk::IndefiniteEvent;
use std::convert::TryInto;

pub fn caller() -> Principal {
    ic_kit::ic::caller()
}

pub fn ledger<'a>() -> &'a mut Ledger {
    ic_kit::ic::get_mut::<Ledger>()
}

pub fn token_level_metadata<'a>() -> &'a mut TokenLevelMetadata {
    ic_kit::ic::get_mut::<TokenLevelMetadata>()
}

pub fn fleek_db<'a>() -> &'a mut Fleek {
    ic_kit::ic::get_mut::<Fleek>()
}

pub fn cap_canister_id() -> Principal {
    ic_kit::ic::get_mut::<TokenLevelMetadata>().history.unwrap()
}

pub fn expect_caller(input_principal: &Principal) {
    if &caller() != input_principal {
        trap("input_principal is different from caller");
    }
}

pub fn expect_caller_general(user: &User, subaccount: Option<SubAccount>) {
    match user {
        User::address(from_address) => {
            if &AccountIdentifierStruct::new(
                PrincipalId(caller()),
                Some(Subaccount(
                    subaccount
                        .expect("SubAccount is missing")
                        .try_into()
                        .expect("unable to convert SubAccount to 32 bytes array"),
                )),
            )
            .to_hex()
                != from_address
            {
                trap("input account identifier is different from caller")
            }
        }
        User::principal(principal) => expect_caller(principal),
    }
}

pub fn expect_principal(user: &User) -> Principal {
    match user {
        User::address(_) => {
            trap("only principals are allowed to preserve compatibility with Dip721")
        }
        User::principal(principal) => *principal,
    }
}

pub fn user_to_detail_value(user: User) -> DetailValue {
    match user {
        User::address(address) => DetailValue::Text(address),
        User::principal(principal) => DetailValue::Principal(principal),
    }
}

pub fn convert_nat_to_u64(num: Nat) -> Result<u64, String> {
    let u64_digits = num.0.to_u64_digits();

    match u64_digits.len() {
        0 => Ok(0),
        1 => Ok(u64_digits[0]),
        _ => Err("Nat -> Nat64 conversion failed".to_string()),
    }
}

pub fn convert_nat_to_u32(num: Nat) -> Result<u32, String> {
    let u32_digits = num.0.to_u32_digits();
    match u32_digits.len() {
        0 => Ok(0),
        1 => Ok(u32_digits[0]),
        _ => Err("Nat -> Nat32 conversion failed".to_string()),
    }
}

pub async fn insert_into_cap(tx_record: IndefiniteEvent) -> TxReceipt {
    let tx_log = tx_log();
    if let Some(failed_tx_record) = tx_log.tx_records.pop_front() {
        insert_into_cap_priv(failed_tx_record).await;
    }
    insert_into_cap_priv(tx_record).await
}

pub async fn insert_into_cap_priv(tx_record: IndefiniteEvent) -> TxReceipt {
    let insert_res = insert(tx_record.clone())
        .await
        .map(|tx_id| Nat::from(tx_id))
        .map_err(|err| ApiError::Other);

    if insert_res.is_err() {
        tx_log().tx_records.push_back(tx_record);
    }

    insert_res
}

pub fn tx_log<'a>() -> &'a mut TxLog {
    ic_kit::ic::get_mut::<TxLog>()
}
