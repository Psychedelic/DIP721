use super::*;

fn post_upgrade_example() {
    match ic_cdk::storage::stable_restore::<(LegacyTokenLevelMetadata, LegacyLedger)>() {
        Ok((legacy_metadata_store, legacy_ledger_store)) => {
            METADATA.with(|metadata| {
                *metadata.borrow_mut() = Metadata {
                    name: Some(legacy_metadata_store.name),
                    logo: None, // manual via setLogo
                    symbol: Some(legacy_metadata_store.symbol),
                    custodians: legacy_metadata_store
                        .owner
                        .map(|custodian| HashSet::from([custodian]))
                        .unwrap_or_else(HashSet::new),
                    created_at: time(),
                    upgraded_at: time(),
                };
                metadata.borrow_mut().upgraded_at = time();
            });
            LEDGER.with(|ledger| {
                let tokens = legacy_ledger_store
                    .tokens
                    .into_iter()
                    .map(|(k, v)| {
                        (
                            Nat::from(k),
                            TokenMetadata {
                                token_identifier: Nat::from(k),
                                owner: Some(v.principal),
                                operator: None, // for safety
                                is_burned: false,
                                properties: v
                                    .metadata_desc
                                    .into_iter()
                                    .flat_map(|desc| desc.key_val_data)
                                    .collect::<Vec<MetadataKeyVal>>()
                                    .into_iter()
                                    .map(|pair| {
                                        (
                                            pair.key,
                                            match pair.val {
                                                MetadataVal::TextContent(v) => {
                                                    GenericValue::TextContent(v)
                                                }
                                                MetadataVal::BlobContent(v) => {
                                                    GenericValue::BlobContent(v)
                                                }
                                                MetadataVal::NatContent(v) => {
                                                    GenericValue::NatContent(v)
                                                }
                                                MetadataVal::Nat8Content(v) => {
                                                    GenericValue::Nat8Content(v)
                                                }
                                                MetadataVal::Nat16Content(v) => {
                                                    GenericValue::Nat16Content(v)
                                                }
                                                MetadataVal::Nat32Content(v) => {
                                                    GenericValue::Nat32Content(v)
                                                }
                                                MetadataVal::Nat64Content(v) => {
                                                    GenericValue::Nat64Content(v)
                                                }
                                            },
                                        )
                                    })
                                    .collect::<Vec<(String, GenericValue)>>(),
                                minted_at: time(),
                                minted_by: v.principal,
                                transferred_at: None,
                                transferred_by: None,
                                burned_at: None,
                                burned_by: None,
                            },
                        )
                    })
                    .collect::<HashMap<TokenIdentifier, TokenMetadata>>();

                let mut owners = HashMap::new();
                for (_, v) in tokens.iter() {
                    owners
                        .entry(v.owner.unwrap()) // note on BurnedNFT
                        .or_insert_with(HashSet::new)
                        .insert(v.token_identifier.clone());
                }

                *ledger.borrow_mut() = Ledger {
                    tokens,
                    owners,
                    // reset all operators for safeness
                    operators: Default::default(),
                    // consider import from cap or continue counting forward
                    // or even continue using from old cap root bucket
                    tx_records: vec![],
                };
            });
        }
        Err(err) => {
            trap(&format!(
                "An error occurred when loading from stable memory (post_upgrade): {:?}",
                err
            ));
        }
    }
}

#[derive(CandidType, Deserialize)]
struct LegacyTokenLevelMetadata {
    owner: Option<Principal>,
    symbol: String,
    name: String,
    history: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
struct LegacyLedger {
    tokens: HashMap<TokenIndex, LegacyTokenMetadata>,
    user_tokens: HashMap<User, Vec<TokenIndex>>,
    token_approvals: HashMap<TokenIndex, User>,
    operator_approvals: HashMap<User, Approvals>,
}

#[derive(CandidType, Deserialize)]
struct LegacyTokenMetadata {
    account_identifier: AccountIdentifier,
    metadata: LegacyMetadata,
    token_identifier: LegacyTokenIdentifier,
    principal: Principal,
    metadata_desc: MetadataDesc,
}

type LegacyTokenIdentifier = String;
type TokenIndex = u64;
type Approvals = Vec<User>;

#[derive(CandidType, Debug, Deserialize, Eq, Hash, PartialEq)]
enum User {
    address(AccountIdentifier),
    principal(Principal),
}

type AccountIdentifier = String;

#[derive(CandidType, Deserialize)]
enum LegacyMetadata {
    fungible(FungibleMetadata),
    nonfungible(Option<MetadataContainer>),
}

#[derive(CandidType, Deserialize)]
struct FungibleMetadata {
    name: String,
    symbol: String,
    decimals: u8,
    metadata: Option<MetadataContainer>,
}

type Blob = Vec<u8>;

#[derive(CandidType, Deserialize)]
enum MetadataContainer {
    data(Vec<MetadataValue>),
    blob(Blob),
    json(String),
}

#[derive(CandidType, Deserialize)]
struct MetadataValue(String, Value);

#[derive(Clone, CandidType, Deserialize)]
enum Value {
    text(String),
    blob(Blob),
    nat(Nat),
    nat8(u8),
}

type MetadataDesc = Vec<MetadataPart>;

#[derive(CandidType, Deserialize)]
struct MetadataPart {
    purpose: MetadataPurpose,
    key_val_data: Vec<MetadataKeyVal>,
    data: Vec<u8>,
}

#[derive(CandidType, Deserialize)]
enum MetadataPurpose {
    Preview,
    Rendered,
}

#[derive(CandidType, Deserialize)]
struct MetadataKeyVal {
    key: String,
    val: MetadataVal,
}

#[derive(CandidType, Deserialize)]
enum MetadataVal {
    TextContent(String),
    BlobContent(Vec<u8>),
    NatContent(Nat),
    Nat8Content(u8),
    Nat16Content(u16),
    Nat32Content(u32),
    Nat64Content(u64),
}
