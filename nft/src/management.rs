use ic_kit::{candid::CandidType, ic, Principal};
use serde::Deserialize;

#[derive(CandidType, Deserialize)]
pub struct Fleek(pub Vec<Principal>);

impl Default for Fleek {
    fn default() -> Self {
        panic!()
    }
}

pub fn is_fleek(account: &Principal) -> bool {
    ic::get::<Fleek>().0.contains(account)
}
