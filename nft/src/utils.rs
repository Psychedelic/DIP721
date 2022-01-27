use crate::ledger::Ledger;
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

pub async fn insert_into_cap(tx_record: IndefiniteEvent) -> TxReceipt {
    let tx_log = tx_log();
    if let Some(failed_tx_record) = tx_log.tx_records.pop_front() {
        return insert_into_cap_priv(failed_tx_record).await;
    }
    insert_into_cap_priv(tx_record).await
}

pub async fn insert_into_cap_priv(tx_record: IndefiniteEvent) -> TxReceipt {
    let insert_res = insert(tx_record.clone())
        .await
        .map(|tx_id| Nat::from(tx_id))
        .map_err(|_err| ApiError::Other);

    if insert_res.is_err() {
        tx_log().tx_records.push_back(tx_record);
    }

    insert_res
}

pub fn tx_log<'a>() -> &'a mut TxLog {
    ic_kit::ic::get_mut::<TxLog>()
}

pub fn has_ownership(ledger: &Ledger, enquire_principal: &Principal, token_id: u64) -> bool {
    match ledger.owner_of(&token_id.to_string()) {
        Ok(owner_actual_principal) => owner_actual_principal == *enquire_principal,
        _ => false
    }
}

pub fn has_approval(ledger: &Ledger, enquire_principal: &Principal, token_id: u64) -> bool {
    // Check if the token does exist
    if ! ledger.does_token_exist(token_id) {
        return false;
    }

    // Check if owner
    // a owner has high precedence in regards of approval
    // so we return early if the enquire principal owns it
    if has_ownership(ledger, enquire_principal, token_id) {
        return true;
    }

    match ledger.get_approved(token_id) {
        Ok(user) => {
            match user {
                User::principal(principal) => principal == *enquire_principal,
                // TODO: consider the "account" case too
                _ => false,
            }
        },
        _ => false,
    }
}

pub fn has_ownership_or_approval(ledger: &Ledger, principal: &Principal, token_id: u64) -> bool {
    // Check if the token does exist
    if ! ledger.does_token_exist(token_id) {
        return false;
    }

    // TODO: exit immediately if Zero address

    // Either has ownership or is approved
    // otherwise, exit immediately
    // TODO: Enable or disable approval for a third party ("operator") to manage
    if ! has_ownership(ledger, principal, token_id) && ! has_approval(ledger, principal, token_id) {
        return false;
    }

    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ledger::*;

    use ic_kit::mock_principals::*;
    use ic_kit::MockContext;

    fn setup_ledger(principal: &Principal) -> Ledger {
        MockContext::new().inject();
        let mut ledger = Ledger::default();
        let metadata_desc = vec![MetadataPart {
            purpose: MetadataPurpose::Rendered,
            key_val_data: vec![MetadataKeyVal {
                key: "location".to_owned(),
                val: MetadataVal::TextContent("Canister A".to_owned()),
            }],
            data: vec![],
        }];

        match ledger.mintNFT(principal, &metadata_desc) {
            Ok(_mint_receipt) => ledger,
            _ => panic!("Oops! Failed to mint nft"),
        }
    }

    #[test]
    fn test_ownership() {
        // Actors
        let alice = &alice();

        // Business logic
        let ledger = setup_ledger(alice);

        // Should Alice should have ownership
        assert_eq!(has_ownership(&ledger, alice, 0), true);
    }

    #[test]
    fn test_approval() {
        // Actors
        let alice = &alice();
        let bob = &bob();

        // Business logic
        let ledger = setup_ledger(alice);

        // Before each, Alice approves Bob
        ledger.approve(alice, bob, 0);

        // Should Bob be approved
        assert_eq!(has_approval(&ledger, bob, 0), true);
    }
}