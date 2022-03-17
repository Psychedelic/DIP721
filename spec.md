# DIP721 - Spec

DIP721 is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs and expanding/building upon the EXT standard with partial compatibility.

---

## Table Of Contents

- [Our Motivation](#motivation)
- [V1 to V2 -- What's Changed?](#v1-to-v2----whats-changed)
- [Interface Specification](#interface-specification)
  - [Basic Interface](#-basic-interface)
  - [Approval Interface](#-approval-interface)
  - [Transfer Interface](#-transfer-interface)
  - [Mint Interface](#-mint-interface)
  - [Burn Interface](#-burn-interface)
  - [History Interface](#-history-interface)
- [Data Structure Specification](#data-structure-specification)
- [Fees](#-fees)
- [Deprecated Interface & Data Structure](#-deprecated-interface--data-structure)
  - [Migration example](#migration-example)
  - [Deprecated Data Structures](#deprecated-data-structure)
  - [Deprecated Methods](#deprecated-methods)

<br>

## Motivation

DIP-721 tries to improve on existing Internet Computer standards in the following ways:

- Most NFT projects don't require a multi-token standard, and a simple
  NFT standard like DIP-721 would suffice. Users of NFTs based on multi-token standards (such as EXT) will be required to pay extra cycle cost compared to DIP-721.
- Most NFT projects don't require the generalization of IC Principals into Ledger Accounts, and avoiding that direction can help reduce the complexity of the API.
- Most current NFT standards on the IC don't yet have proper metadata support for NFTs.
- The ability to track the history of NFT transfers is an important requirement of almost every
  NFT projects, and it should be a core part of the standard.
- Most NFT projects don't require arbitrarily large token balances, and that can lead to more cycle inefficient implementations.
- DIP-721 closely follows the original EIP-721, and that will make porting existing
  Ethereum contracts onto the IC more straightforward.

---

<br>

## V1 to V2 -- What's Changed?

- Removed the `Dip721` suffix from methods.
- Token Identifier is now a `Nat` instead of `String` type.
- Simplified data structures.
- Added safe Rust data storage practices for our [example implememtation](./nft/src/main.rs).

<br>

---

## Interface Specification

### 🚦 Basic interface

Every DIP-721 compatible smart contract must implement this interface. All other interfaces are optional.
Trapping (instead of returning an error) is allowed, but not encouraged.

<br>

#### metadata

---

Returns the `Metadata` of the NFT canister which includes `custodians`, `logo`, `name`, `symbol`.

```
metadata: () -> (Metadata) query;
```

<br>

#### logo

---

Returns the logo of the NFT contract as Base64 encoded text.

```
logo : () -> (opt text) query;
```

<br>

#### setLogo

---

Sets the logo of the NFT canister. Base64 encoded text is recommended.

Caller must be the custodian of NFT canister.

```
setLogo : (text) -> ();
```

<br>

#### name

---

Returns the name of the NFT contract.

```
name : () -> (opt text) query;
```

<br>

#### setName

---

Sets the name of the NFT canister.

Caller must be the custodian of NFT canister.

```
setName : (text) -> ();
```

<br>

#### symbol

---

Returns the symbol of the NFT contract.

```
symbol : () -> (opt text) query;
```

<br>

#### setSymbol

---

Sets the symbol for the NFT canister.

Caller must be the custodian of NFT canister.

```
setSymbol : (text) -> ();
```

<br>

#### custodians

---

Returns a list of `principal`s that represents the custodians (or admins) of the NFT canister.

```
custodians : () -> (vec principal) query;
```

<br>

#### setCustodians

---

Sets the list of custodians for the NFT canister.

Caller must be the custodian of NFT canister.

```
setCustodians : (vec principal) -> ();
```

<br>

#### tokenMetadata

---

Returns the `Metadata` for `token_identifier`.

or Returns `NftError` when error.

```
tokenMetadata : (nat) -> (variant { Ok : TokenMetadata; Err : NftError }) query;
```

<br>

#### balanceOf

---

Returns the count of NFTs owned by `user`.

If the user does not own any NFTs, returns an error containing `NftError`.

```
balanceOf: (principal) -> (variant { Ok : nat; Err : NftError }) query;
```

<br>

#### ownerOf

---

Returns the `Principal` of the owner of the NFT associated with `token_identifier`.

Returns an error containing `NftError` if `token_identifier` is invalid.

```
ownerOf : (nat) -> (variant { Ok : principal; Err : NftError }) query;
```

<br>

#### ownerTokenIds

---

Returns the list of the `token_identifier` of the NFT associated with owner.

Returns an error containing `NftError` if `principal` is invalid.

```
ownerTokenIds : (principal) -> (variant { Ok : vec nat; Err : NftError }) query;
```

<br>

#### ownerTokenMetadata

---

Returns the list of the `token_metadata` of the NFT associated with owner.

Returns an error containing `NftError` if `principal` is invalid.

```
ownerTokenMetadata : (principal) -> (variant { Ok : vec TokenMetadata; Err : NftError }) query;
```

<br>

#### operatorOf

---

Returns the `Principal` of the operator of the NFT associated with `token_identifier`.

Returns an error containing `NftError` if `token_identifier` is invalid.

```
operatorOf : (nat) -> (variant { Ok : principal; Err : NftError }) query;
```

<br>

#### operatorTokenIds

---

Returns the list of the `token_identifier` of the NFT associated with operator.

Returns an error containing `NftError` if `principal` is invalid.

```
operatorTokenIds : (principal) -> (variant { Ok : vec nat; Err : NftError }) query;
```

<br>

#### operatorTokenMetadata

---

Returns the list of the `token_metadata` of the NFT associated with operator.

Returns an error containing `NftError` if `principal` is invalid.

```
operatorTokenMetadata : (principal) -> (variant { Ok : vec TokenMetadata; Err : NftError }) query;
```

<br>

#### supportedInterfaces

---

Returns the interfaces supported by this NFT canister.

```
supportedInterfaces : () -> (vec SupportedInterface) query;
```

<br>

#### totalSupply

---

Returns a `Nat` that represents the total current supply of NFT tokens.

NFTs that are minted and later burned explicitly or sent to the zero address should also count towards totalSupply.

```
totalSupply : () -> (nat) query;
```

<br>

---

### ✅ Approval Interface

This interface adds approve functionality to DIP-721 tokens.

<br>

#### approve

---

Calling `approve` grants the `operator` the ability to make update calls to the specificied `token_identifier`.

Approvals given by the `approve` function are independent from approvals given by the `setApprovalForAll`.

If the approval goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
approve : (principal, nat) -> (variant { Ok : nat; Err : NftError });
```

<br>

#### setApprovalForAll

---

Enable or disable an `operator` to manage all of the tokens for the caller of this function. The contract allows multiple operators per owner.

Approvals granted by the `approve` function are independent from the approvals granted by `setApprovalForAll` function.

If the approval goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
setApprovalForAll : (principal, bool) -> (variant { Ok : nat; Err : NftError });
```

<br>

#### isApprovedForAll

---

Returns `true` if the given `operator` is an approved operator for all the tokens owned by the caller through the use of the `setApprovalForAll` method, returns `false` otherwise.

```
isApprovedForAll : (principal, principal) -> (variant { Ok : bool; Err : NftError }) query;
```

<br>

---

<br>

### 🚀 Transfer Interface

This interface adds transfer functionality to DIP-721 tokens.

<br>

#### transfer

---

Sends the callers nft `token_identifier` to `to` and returns a `Nat` that represents a transaction id that can be used at the `transaction` method.

```
transfer : (principal, nat) -> (variant { Ok : nat; Err : NftError });
```

<br>

#### transferFrom

---

Caller of this method is able to transfer the NFT `token_identifier` that is in `from`'s balance to `to`'s balance if the caller is an approved operator to do so.

If the transfer goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
transferFrom : (principal, principal, nat) -> (variant { Ok : nat; Err : NftError });
```

<br>

---

<br>

### 💠 Mint Interface

This interface adds mint functionality to DIP-721 tokens.

<br>

#### mint

---

Mint an NFT for principal `to` that has an ID of `token_identifier` and metadata akin to `properties`. Implementations are encouraged to only allow minting by the owner of the canister.

If the mint goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
mint : (principal, nat, vec record { text; GenericValue }) -> (variant { Ok : nat; Err : NftError });
```

An example on how to mint a single nft is provided in the [mint-example.md](./docs/mint-example.md)

---

### 🔥 Burn Interface

This interface adds burn functionality to DIP-721 tokens.

<br>

#### burn

---

Burn an NFT identified by `token_identifier`. Calling burn on a token sets the owner to `None` and will no longer be useable. Burned tokens do still count towards `totalSupply`.

Implementations are encouraged to only allow burning by the owner of the `token_identifier`.

```
burn : (nat) -> (variant { Ok : nat; Err : NftError });
```

---

### 📬 History Interface

#### transaction

---

Returns the `TxEvent` that corresponds with `tx_id`.

If there is no `TxEvent` that corresponds with the `tx_id` entered, returns a `NftError.TxNotFound`.

```
transaction : (nat) -> (variant { Ok : TxEvent; Err : NftError }) query;
```

<br>

#### totalTransactions

---

Returns a `Nat` that represents the total number of transactions that have occured in the NFT canister.

```
totalTransactions : () -> (nat) query;
```

<br>

---

## Data Structure Specification

These are the data structures that must be used when interacting with a DIP721 canister.

### Metadata

```
type Metadata = record {
  logo : opt text;
  name : opt text;
  created_at : nat64;
  upgraded_at : nat64;
  custodians : vec principal;
  symbol : opt text;
};
```

### GenericValue

```
type GenericValue = variant {
  Nat64Content : nat64;
  Nat32Content : nat32;
  BoolContent : bool;
  Nat8Content : nat8;
  Int64Content : int64;
  IntContent : int;
  NatContent : nat;
  Nat16Content : nat16;
  Int32Content : int32;
  Int8Content : int8;
  Int16Content : int16;
  BlobContent : vec nat8;
  NestedContent : Vec;
  Principal : principal;
  TextContent : text;
};
```

### TokenMetadata

```
type TokenMetadata = record {
  transferred_at : opt nat64;
  transferred_by : opt principal;
  owner : opt principal;
  operator : opt principal;
  properties : vec record { text; GenericValue };
  is_burned : bool;
  token_identifier : nat;
  burned_at : opt nat64;
  burned_by : opt principal;
  minted_at : nat64;
  minted_by : principal;
};
```

### Reserved Metadata Properties

All of the following are reserved by the spec to verify and display assets across all applications.

Noted that `data` and `location` are mutual exclusive, only one of them is required.

#### data - **Required**

---

blob asset data.

```
{"data", BlobContent(<blob asset data of the NFT>)}
```

#### location - **Required**

---

URL location for the fully rendered asset content.

```
{"location", TextContent(<asset URL of the NFT>)}
```

#### contentHash - **Optional**

---

SHA-256 hash fingerprint of the asset defined in location or asset.

```
{"contentHash", BlobContent(<hash of the content>)}
```

#### contentType - **Optional**

---

MIME type of the asset defined in location

```
{"contentType", TextContent(<MIME type of the NFT>)}
```

#### thumbnail - **Optional**

---

URL location for the preview thumbnail for asset content

```
{"thumbnail", TextContent(<thumbnail URL of the NFT>)}
```

<br>

### NftError

```
type NftError = variant {
  SelfTransfer;
  TokenNotFound;
  TxNotFound;
  BurnedNFT;
  SelfApprove;
  OperatorNotFound;
  Unauthorized;
  ExistedNFT;
  OwnerNotFound;
  Other : text;
};
```

<br>

### SupportedInterface

```
type SupportedInterface = variant {
  Burn;
  Mint;
  Approval;
  TransactionHistory
};
```

### TxEvent

```
type TxEvent = record {
  time : nat64;
  operation : text;
  details : vec record { text; GenericValue };
  caller : principal;
};
```

### Vec

```
type Vec = vec record {
  text;
  variant {
    Nat64Content : nat64;
    Nat32Content : nat32;
    BoolContent : bool;
    Nat8Content : nat8;
    Int64Content : int64;
    IntContent : int;
    NatContent : nat;
    Nat16Content : nat16;
    Int32Content : int32;
    Int8Content : int8;
    Int16Content : int16;
    BlobContent : vec nat8;
    NestedContent : Vec;
    Principal : principal;
    TextContent : text;
  };
};
```

<br>

---

## 🤑 Fees

Implementations are encouraged not to charge any fees when an approved entity
transfers NFTs on the user's behalf, as that entity might have no means for payment.
If any fees needs to be taken for such a `transferFrom` call,
then it is encouraged to be taken during the call to `approve`, `setApprovalForAll`
from the caller's balance.

<br>

---

## 🗑 Deprecated Interface & Data Structure

This section encompases the data structures and interface methods that we deprecated when going from v1 --> v2 of DIP721.

If you are currently using deprecated methods or data structures, we strongly suggest you migrate to the current implementations to ensure interoperability between your canisters and other canisters interacting with DIP721.

### Migration example

Method 1:
- `pre_upgrade` and `post_upgrade`, check our [example implememtation](./nft/src/migration_example.rs).

<br>

Method 2:
- stop canister, backup / download state
- migrate data offline
- manual import/restore canister state

### Deprecated Methods

```
approveDip721: (spender: principal, token_id: nat64) -> (ApproveResult);

balanceOfDip721: (user: principal) -> (nat64) query;

ownerOfDip721: (token_id: nat64) -> (OwnerResult) query;

safeTransferFromDip721: (from: principal, to: principal, token_id: nat64) -> (TxReceipt);

transferFromDip721: (from: principal, to: principal, token_id: nat64) -> (TxReceipt);

supportedInterfacesDip721: () -> (vec InterfaceId) query;

logoDip721: () -> (LogoResult) query;

nameDip721: () -> (text) query;

symbolDip721: () -> (text) query;

totalSupplyDip721: () -> (nat64) query;

getMetadataDip721: (token_id: nat64) -> (MetadataResult) query;

getMaxLimitDip721: () -> (nat16) query;

mintDip721: (to: principal, metadata: MetadataDesc) -> (MintReceipt);

getMetadataForUserDip721: (user: principal) -> (vec ExtendedMetadataResult);

getTokenIdsForUserDip721: (user: principal) -> (vec nat64) query;
```

### Deprecated Data Structure

#### OwnerResult

---

```
type ApiError =
 variant {
   Unauthorized;
   InvalidTokenId;
   ZeroAddress;
   Other;
 };
```

```
type OwnerResult =
variant {
   Err: ApiError;
   Ok: Principal;
 };
```

<br>

#### TxReceipt

---

```
type TxReceipt =
variant {
   Err: ApiError;
   Ok: nat;
 };
```

<br>

#### InterfaceId

---

```
type InterfaceId =
 variant {
   Approval;
   TransactionHistory;
   Mint;
   Burn;
   TransferNotification;
 };
```

<br>

#### LogoResult

---

```
type LogoResult =
 record {
   logo_type: text // MIME type of the logo
   data: text // Base64 encoded logo
 };
```

```
 type ExtendedMetadataResult =
 record {
     metadata_desc: MetadataDesc;
     token_id: nat64;
 };
```

<br>

#### MetadataResult

---

```
type MetadataResult =
 variant {
   Err: ApiError;
   Ok: MetadataDesc;
 };
```

```
type MetadataDesc = vec MetadataPart;
```

```
type MetadataPart =
 record {
   purpose: MetadataPurpose;
   key_val_data: vec MetadataKeyVal;
   data: blob;
 };
```

```
type MetadataPurpose =
 variant {
   Preview; // used as a preview, can be used as preivew in a wallet
   Rendered; // used as a detailed version of the NFT
 };
```

```
type MetadataKeyVal =
 record {
   text;
   MetadataVal;
 };
```

```
type MetadataVal =
 variant {
   TextContent : Text;
   BlobContent : blob;
   NatContent : Nat;
   Nat8Content: Nat8;
   Nat16Content: Nat16;
   Nat32Content: Nat32;
   Nat64Content: Nat64;
  };
```

<br>

#### TxResult

---

```
type TxResult =
 record {
     fee: Nat;
     transaction_type: TransactionType;
 };

type TransactionType =
 variant {
     Transfer:
      record {
          token_id: nat64;
          from: principal;
          to: principal;
      };
     TransferFrom:
      record {
          token_id: nat64;
          from: principal;
          to: principal;
      };
      Approve:
       record {
          token_id: nat64;
          from: principal;
          to: principal;
       };
      SetApprovalForAll:
       record {
          from: principal;
          to: principal;
       };
      Mint:
       record {
          token_id: nat64;
       };
      Burn:
       record {
          token_id: nat64;
       };
 };
```

<br>

#### MintReceipt

---

```
type MintReceipt =
 variant {
   Err: variant {
          Unauthorized;
        };
   Ok: record {
          token_id: nat64; // minted token id
          id: nat // transaction id
       };
 };
```

<br>

#### BurnRequest

---

```
type BurnRequest =
 record {
     token_id: nat64;
 }
```

---

### Predefined key value pairs

#### content hash

Uniquely identifies the content of the NFT by its hash fingerprint. This field might
be missing unless the NFT is stored on the Web, in which case the content hash
is mandatory.

```
{"contentHash", BlobContent(<hash of the content>)}
```

#### contentType

```
{"contentType", TextContent(<MIME type of the NFT>)}
```

#### locationType

```
{"locationType", Nat8Content(<type of the location>)}

1 - IPFS storage
2 - Asset canister storage
3 - URI(Web) storage
4 - Embedded in the token contract
```

#### location

```
{"location", any(<location>)}

// where any(<location>) is one of the followings based on the "locationType"

BlobContent(<IPFS location hash>) - IPFS
TextContent(<PrincipalId of the asset canister>) - Asset canister
TextContent(<URI of the NFT location on the Web>) - URI
location field is missing - Embedded in the token contract
```
<br>
