use crate::*;

// ======================
//      QUERY  CALLS
// ======================

#[query(manual_reply = true)]
#[candid_method(query)]
fn name() -> ManualReply<Option<String>> {
    dip721_name()
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn logo() -> ManualReply<Option<String>> {
    dip721_logo()
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn symbol() -> ManualReply<Option<String>> {
    dip721_symbol()
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn custodians() -> ManualReply<HashSet<Principal>> {
    dip721_custodians()
}

#[query(manual_reply = true)]
#[candid_method(query)]
fn metadata() -> ManualReply<Metadata> {
    dip721_metadata()
}

#[update(name = "setName", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setName")]
fn set_name(name: String) {
    dip721_set_name(name)
}

#[update(name = "setLogo", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setLogo")]
fn set_logo(logo: String) {
    dip721_set_logo(logo)
}

#[update(name = "setSymbol", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setSymbol")]
fn set_symbol(symbol: String) {
    dip721_set_symbol(symbol)
}
#[update(name = "setCustodians", guard = "is_canister_custodian")]
#[candid_method(update, rename = "setCustodians")]
fn set_custodians(custodians: HashSet<Principal>) {
    dip721_set_custodians(custodians)
}

#[query(name = "totalSupply")]
#[candid_method(query, rename = "totalSupply")]
fn total_supply() -> Nat {
    dip721_total_supply()
}

#[query(name = "totalTransactions")]
#[candid_method(query, rename = "totalTransactions")]
fn total_transactions() -> Nat {
    dip721_total_transactions()
}

#[query()]
#[candid_method(query)]
fn cycles() -> Nat {
    dip721_cycles()
}

#[query(name = "totalUniqueHolders")]
#[candid_method(query, rename = "totalUniqueHolders")]
fn total_unique_holders() -> Nat {
    dip721_total_unique_holders()
}

#[query()]
#[candid_method(query)]
fn stats() -> Stats {
    dip721_stats()
}

#[query(name = "supportedInterfaces")]
#[candid_method(query, rename = "supportedInterfaces")]
fn supported_interfaces() -> Vec<SupportedInterface> {
    dip721_supported_interfaces()
}

#[query(name = "balanceOf")]
#[candid_method(query, rename = "balanceOf")]
fn balance_of(owner: Principal) -> Result<Nat, NftError> {
    dip721_balance_of(owner)
}

#[query(name = "ownerOf")]
#[candid_method(query, rename = "ownerOf")]
fn owner_of(token_identifier: TokenIdentifier) -> Result<Option<Principal>, NftError> {
    dip721_owner_of(token_identifier)
}

#[query(name = "operatorOf")]
#[candid_method(query, rename = "operatorOf")]
fn operator_of(token_identifier: TokenIdentifier) -> Result<Option<Principal>, NftError> {
    dip721_operator_of(token_identifier)
}

#[query(name = "ownerTokenMetadata", manual_reply = true)]
#[candid_method(query, rename = "ownerTokenMetadata")]
fn owner_token_metadata(owner: Principal) -> ManualReply<Result<Vec<TokenMetadata>, NftError>> {
    dip721_owner_token_metadata(owner)
}

#[query(name = "operatorTokenMetadata", manual_reply = true)]
#[candid_method(query, rename = "operatorTokenMetadata")]
fn operator_token_metadata(
    operator: Principal,
) -> ManualReply<Result<Vec<TokenMetadata>, NftError>> {
    dip721_operator_token_metadata(operator)
}

#[query(name = "ownerTokenIdentifiers", manual_reply = true)]
#[candid_method(query, rename = "ownerTokenIdentifiers")]
fn owner_token_identifiers(
    owner: Principal,
) -> ManualReply<Result<Vec<TokenIdentifier>, NftError>> {
    dip721_owner_token_identifiers(owner)
}

#[query(name = "operatorTokenIdentifiers", manual_reply = true)]
#[candid_method(query, rename = "operatorTokenIdentifiers")]
fn operator_token_identifiers(
    operator: Principal,
) -> ManualReply<Result<Vec<TokenIdentifier>, NftError>> {
    dip721_operator_token_identifiers(operator)
}

#[query(name = "tokenMetadata", manual_reply = true)]
#[candid_method(query, rename = "tokenMetadata")]
fn token_metadata(
    token_identifier: TokenIdentifier,
) -> ManualReply<Result<TokenMetadata, NftError>> {
    dip721_token_metadata(token_identifier)
}

#[query(name = "isApprovedForAll")]
#[candid_method(query, rename = "isApprovedForAll")]
fn is_approved_for_all(owner: Principal, operator: Principal) -> Result<bool, NftError> {
    dip721_is_approved_for_all(owner, operator)
}

// ======================
//      UPDATE CALLS
// ======================

#[update(name = "approve")]
#[candid_method(update, rename = "approve")]
fn approve(operator: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    dip721_approve(operator, token_identifier)
}

#[update(name = "setApprovalForAll")]
#[candid_method(update, rename = "setApprovalForAll")]
fn set_approval_for_all(operator: Principal, is_approved: bool) -> Result<Nat, NftError> {
    dip721_set_approval_for_all(operator, is_approved)
}

#[update(name = "transfer")]
#[candid_method(update, rename = "transfer")]
fn transfer(to: Principal, token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    dip721_transfer(to, token_identifier)
}

#[update(name = "transferFrom")]
#[candid_method(update, rename = "transferFrom")]
fn transfer_from(
    owner: Principal,
    to: Principal,
    token_identifier: TokenIdentifier,
) -> Result<Nat, NftError> {
    dip721_transfer_from(owner, to, token_identifier)
}

#[update(name = "mint", guard = "is_canister_custodian")]
#[candid_method(update, rename = "mint")]
fn mint(
    to: Principal,
    token_identifier: TokenIdentifier,
    properties: Vec<(String, GenericValue)>,
) -> Result<Nat, NftError> {
    dip721_mint(to, token_identifier, properties)
}

#[update(name = "burn")]
#[candid_method(update, rename = "burn")]
fn burn(token_identifier: TokenIdentifier) -> Result<Nat, NftError> {
    dip721_burn(token_identifier)
}
