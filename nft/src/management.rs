use ic_kit::{candid::CandidType, Principal};
use serde::Deserialize;

#[derive(CandidType, Deserialize)]
pub struct Fleek(pub Vec<Principal>);

impl Default for Fleek {
    fn default() -> Self {
        panic!()
    }
}

pub fn is_fleek(_account: &Principal) -> bool {
    // ic::get::<Fleek>().0.contains(account)
    true
}
