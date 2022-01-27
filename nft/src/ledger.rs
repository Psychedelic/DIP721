use crate::types::*;
use crate::utils::*;

use ic_kit::candid::CandidType;
use ic_kit::ic;

use serde::Deserialize;
use std::collections::HashMap;
use std::convert::Into;
use std::default::Default;

#[derive(CandidType, Clone, Default, Deserialize)]
pub struct Ledger {
    tokens: HashMap<TokenIndex, TokenMetadata>,
    user_tokens: HashMap<User, Vec<TokenIndex>>,
    token_approvals: HashMap<TokenIndex, User>,
    operator_approvals: HashMap<User, Vec<User>>,
}

impl Ledger {
    #[allow(non_snake_case)]
    pub fn mintNFT(&mut self, to: &Principal, metadata_desc: &MetadataDesc) -> MintReceipt {
        let token_index = ledger().tokens.len() as TokenIndex;
        ledger().tokens.insert(
            token_index,
            TokenMetadata::new(
                User::principal(to.clone()).into(),
                Metadata::nonfungible(None),
                into_token_identifier(&token_index),
                to.clone(),
                metadata_desc.clone(),
            ),
        );
        ledger()
            .user_tokens
            .entry(User::principal(*to))
            .or_default()
            .push(token_index);

        Ok(MintReceiptPart {
            token_id: token_index as u64,
            id: Nat::from(1),
        })
    }

    pub fn total_supply(&self) -> u64 {
        ledger().tokens.len() as u64
    }

    pub fn get_metadata(&self, token_id: u64) -> MetadataResult {
        MetadataResult::Ok(
            ledger()
                .tokens
                .get(&into_token_index(&token_id.to_string()))
                .expect("unable to find token index")
                .metadata_desc
                .clone(),
        )
    }

    pub fn get_metadata_for_user(&self, user: &Principal) -> Vec<ExtendedMetadataResult> {
        ledger()
            .user_tokens
            .get(&User::principal(*user))
            .unwrap_or(&vec![])
            .iter()
            .map(|token_index| {
                let user_tokens = ledger()
                    .tokens
                    .get(token_index)
                    .expect("unable to find token index");
                ExtendedMetadataResult {
                    metadata_desc: user_tokens.metadata_desc.clone(),
                    token_id: *token_index as u64,
                }
            })
            .collect()
    }

    pub fn get_token_ids_for_user(&self, user: &Principal) -> Vec<u64> {
        ledger()
            .user_tokens
            .get(&User::principal(*user))
            .unwrap_or(&vec![])
            .iter()
            .map(|token_index| token_index.clone() as u64)
            .collect()
    }

    pub fn approve(&self, enquire_principal: &Principal, approves_principal: &Principal, token_id: u64) {
        let ledger_instance = ledger();

        if ! has_ownership_or_approval(ledger_instance, enquire_principal, token_id) {
            return;
        }

        ledger_instance
            .token_approvals
            .insert(
                token_id,
                User::from(*approves_principal),
            );
    }

    pub fn set_approval_for_all(&self, approves_principal: &Principal, _approved: bool) {
        let user = User::principal(ic::caller());

        if ic::caller() == *approves_principal {
            return;
        }

        let ledger_instance = ledger();

        let approvals = ledger_instance
            .operator_approvals
            .entry(user.clone())
            .or_default();

        approvals.push(User::from(*approves_principal));
    }

    pub fn is_approved_for_all(&self, owner: &Principal, operator: &Principal) -> bool {        
        let approvals = ledger()
            .operator_approvals
            .get(&User::principal(*owner));

        approvals.map_or(
            false,
            |list| list.contains(
                &User::principal(*operator)
            ),
        )
    }

    pub fn get_approved(&self, token_id: u64) -> Result<User, ApiError> {
        let approved_result = ledger()
            .token_approvals
            .get(&token_id);

        match approved_result {
            Some(user) => Ok(user.clone()),
            None => Err(ApiError::Unauthorized)
        }
    }

    pub fn owner_of(&self, token_identifier: &TokenIdentifier) -> OwnerResult {
        let token_result = ledger()
            .tokens
            .get(&into_token_index(&token_identifier));

        match token_result {
            Some(token_metadata) => OwnerResult::Ok(token_metadata.principal.clone()),
            _ => OwnerResult::Err(ApiError::InvalidTokenId)
        }
    }

    pub fn balance_of(&self, user: &User) -> u64 {
        ledger().user_tokens.get(user).unwrap_or(&vec![]).len() as u64
    }

    pub fn transfer(&mut self, from: &User, to: &User, token_identifier: &TokenIdentifier) {
        // change token owner in the tokens map
        let token_index = into_token_index(token_identifier);
        let mut token_metadata = ledger()
            .tokens
            .get_mut(&token_index)
            .expect("unable to find token identifier in tokens");

        token_metadata.account_identifier = to.clone().into();
        token_metadata.principal = expect_principal(&to);

        // remove the token from the previous owner's tokenlist
        let from_token_indexes = ledger()
            .user_tokens
            .get_mut(&from)
            .expect("unable to find previous owner");
        from_token_indexes.remove(
            from_token_indexes
                .iter()
                .position(|token_index_in_vec| &token_index == token_index_in_vec)
                .expect("unable to find token index in users_token"),
        );
        if from_token_indexes.len() == 0 {
            ledger().user_tokens.remove(&from);
        }

        // add the token to the new owner's tokenlist
        ledger()
            .user_tokens
            .entry(to.clone())
            .or_default()
            .push(token_index);
    }

    pub fn bearer(&self, token_identifier: &TokenIdentifier) -> AccountIdentifierReturn {
        AccountIdentifierReturn::Ok(
            ledger()
                .tokens
                .get(&into_token_index(&token_identifier))
                .expect("unable to locate token id")
                .account_identifier
                .clone(),
        )
    }

    pub fn does_token_exist(&self, token_id: u64) -> bool {
        ledger()
            .tokens
            .contains_key(&into_token_index(&token_id.to_string()))
    }

    pub fn supply(&self, _token_identifier: &TokenIdentifier) -> BalanceReturn {
        BalanceReturn::Ok(ledger().tokens.len().into())
    }

    pub fn get_all_metadata_for_user(&self, user: &User) -> Vec<TokenMetadata> {
        ledger()
            .user_tokens
            .get(user)
            .unwrap_or(&vec![])
            .iter()
            .map(|token_index| {
                ledger()
                    .tokens
                    .get(token_index)
                    .expect("unable to find token index")
                    .clone()
            })
            .collect()
    }

    pub fn metadata(&self, token_identifier: &TokenIdentifier) -> MetadataReturn {
        MetadataReturn::Ok(
            ledger()
                .tokens
                .get(&into_token_index(&token_identifier))
                .expect("unable to find token index")
                .metadata
                .clone(),
        )
    }

    #[allow(dead_code)]
    #[cfg(test)]
    pub fn clear(&mut self) {
        self.tokens.clear();
        self.user_tokens.clear();
    }
}
