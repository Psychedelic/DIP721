use crate::*;

#[query(name = "nameDip721")]
#[candid_method(query, rename = "nameDip721")]
fn name_dip721() -> Option<String> {
    name()
}

#[update(name = "setNameDip721")]
#[candid_method(update, rename = "setNameDip721")]
fn set_name_dip721(name: String) {
    set_name(name)
}

#[query(name = "logoDip721")]
#[candid_method(query, rename = "logoDip721")]
fn logo_dip721() -> Option<String> {
    logo()
}

#[update(name = "setLogoDip721")]
#[candid_method(update, rename = "setLogoDip721")]
fn set_logo_dip721(logo: String) {
    set_logo(logo)
}

#[query(name = "symbolDip721")]
#[candid_method(query, rename = "symbolDip721")]
fn symbol_dip721() -> Option<String> {
    symbol()
}

#[update(name = "setSymbolDip721")]
#[candid_method(update, rename = "setSymbolDip721")]
fn set_symbol_dip721(symbol: String) {
    set_symbol(symbol)
}

#[query(name = "totalSupplyDip721")]
#[candid_method(query, rename = "totalSupplyDip721")]
fn total_supply_dip721() -> Nat {
    total_supply()
}

#[query(name = "supportedInterfacesDip721")]
#[candid_method(query, rename = "supportedInterfacesDip721")]
fn supportedInterfacesDip721() -> Vec<SupportedInterface> {
    supportedInterfaces()
}
