// turn it on if you find it annoying but it DOES NOT RECOMMENDED
// #![allow(deprecated)]

use crate::*;

#[query(name = "nameDip721")]
#[candid_method(query, rename = "nameDip721")]
#[deprecated(note = "please use method: `name` instead")]
fn name_dip721() -> Option<String> {
    name()
}

#[update(name = "setNameDip721", guard = "is_canister_owner")]
#[candid_method(update, rename = "setNameDip721")]
#[deprecated(note = "please use method: `set_name` instead")]
fn set_name_dip721(name: String) {
    set_name(name)
}

#[query(name = "logoDip721")]
#[candid_method(query, rename = "logoDip721")]
#[deprecated(note = "please use method: `logo` instead")]
fn logo_dip721() -> Option<String> {
    logo()
}

#[update(name = "setLogoDip721", guard = "is_canister_owner")]
#[candid_method(update, rename = "setLogoDip721")]
#[deprecated(note = "please use method: `set_logo` instead")]
fn set_logo_dip721(logo: String) {
    set_logo(logo)
}

#[query(name = "symbolDip721")]
#[candid_method(query, rename = "symbolDip721")]
#[deprecated(note = "please use method: `symbol` instead")]
fn symbol_dip721() -> Option<String> {
    symbol()
}

#[update(name = "setSymbolDip721", guard = "is_canister_owner")]
#[candid_method(update, rename = "setSymbolDip721")]
#[deprecated(note = "please use method: `set_symbol` instead")]
fn set_symbol_dip721(symbol: String) {
    set_symbol(symbol)
}

#[query(name = "totalSupplyDip721")]
#[candid_method(query, rename = "totalSupplyDip721")]
#[deprecated(note = "please use method: `total_supply` instead")]
fn total_supply_dip721() -> Nat {
    total_supply()
}

#[query(name = "supportedInterfacesDip721")]
#[candid_method(query, rename = "supportedInterfacesDip721")]
#[deprecated(note = "please use method: `supported_interfaces` instead")]
fn supported_interfaces_dip721() -> Vec<SupportedInterface> {
    supported_interfaces()
}

#[query(name = "balanceOfDip721")]
#[candid_method(query, rename = "balanceOfDip721")]
#[deprecated(note = "please use method: `balance_of` instead")]
fn balance_of_dip721(owner: Principal) -> Result<Nat, NftError> {
    balance_of(owner)
}

#[query(name = "ownerOfDip721")]
#[candid_method(query, rename = "ownerOfDip721")]
#[deprecated(note = "please use method: `owner_of` instead")]
fn owner_of_dip721(token_identifier: TokenIdentifier) -> Result<Principal, NftError> {
    owner_of(token_identifier)
}

#[query(name = "getMetadataDip721")]
#[candid_method(query, rename = "getMetadataDip721")]
#[deprecated(note = "please use method: `token_metadata` instead")]
fn get_metadata_dip721(token_identifier: TokenIdentifier) -> Result<TokenMetadata, NftError> {
    token_metadata(token_identifier)
}

#[query(name = "getMetadataForUserDip721")]
#[candid_method(query, rename = "getMetadataForUserDip721")]
#[deprecated(note = "please use method: `owner_token_metadata` instead")]
fn get_metadata_for_user_dip721(owner: Principal) -> Result<Vec<TokenMetadata>, NftError> {
    owner_token_metadata(owner)
}

#[query(name = "getTokenIdsForUserDip721")]
#[candid_method(query, rename = "getTokenIdsForUserDip721")]
#[deprecated(note = "please use method: `owner_token_ids` instead")]
fn get_token_ids_for_user_dip721(owner: Principal) -> Result<Vec<TokenIdentifier>, NftError> {
    owner_token_ids(owner)
}

#[update(name = "approveDip721")]
#[candid_method(update, rename = "approveDip721")]
#[deprecated(note = "please use method: `approve` instead")]
fn approve_dip721(operator: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    approve(operator, token_identifier)
}

#[update(name = "transferFromDip721")]
#[candid_method(update, rename = "transferFromDip721")]
#[deprecated(note = "please use method: `transfer_from` instead")]
fn transfer_from_dip721(
    owner: Principal,
    to: Principal,
    token_identifier: TokenIdentifier,
) -> Result<Nat, NftError> {
    transfer_from(owner, to, token_identifier)
}

#[update(name = "mintDip721")]
#[candid_method(update, rename = "mintDip721")]
#[deprecated(note = "please use method: `mint` instead")]
fn mint_dip721(
    to: Principal,
    token_identifier: TokenIdentifier,
    properties: Vec<(String, GenericValue)>,
) -> Result<Nat, NftError> {
    mint(to, token_identifier, properties)
}
