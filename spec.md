# DIP721 - Spec


DIP721 is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs and expanding/building upon the EXT standard with partial compatibility.

---

## Table Of Contents
- [Our Motivation](#motivation)
- [Interface Specification](#interface-specification)
    - [Basic Interface](#🚦-basic-interface)
    - [Approval Interface](#✅-approval-interface)
    - [Mint Interface](#💠-mint-interface)
    - [Burn Interface](#🔥-burn-interface)
    - [History Interface](#📬-history-interface)
- [Data Structure Specification](#data-structure-specification)
- [Deprecated Interface & Data Structure](#deprecated-interface--data-structure)
- [Fees](#🤑-fees)

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

## Interface Specification

### 🚦 Basic interface

Every DIP-721 compatible smart contract must implement this interface. All other interfaces are optional.
Trapping (instead of returning an error) is allowed, but not encouraged.

<br>

#### balanceOf
---

Returns the count of NFTs owned by `user`.

If the user does not own any NFTs, returns an error containing `NftError.OwnerNotFound`.

```
balanceOf: (user: principal) -> (Result) query;
```

<br>

#### owners
---
Returns a list of `principal`s that represents the owners (or admins) of the NFT canister.

```
owners: () -> (vec principal) query;
```


<br>

#### ownerOf
---

Returns the `Principal` of the owner of the NFT associated with `token_id`. 

Returns an error containing `NftError.TokenNotFound` if `token_id` is invalid.

```
ownerOf: (token_id: nat64) -> (Result_6) query;
```

<br>

#### transfer
---
Sends the callers nft `token_id` to `to` and returns a `Nat` that represents a transaction id that can be used at the `transaction` method.

Returns an error containing `NftError.SelfTransfer` if the function caller and to are the same.

Returns an error containing `NftError.Unautharized` if the caller is not the owner of `token_id`.

```
transfer: (to: principal, token_id: Nat) -> (Result);
```

<br>

#### transferFrom
---
Caller of this method is able to transfer the NFT `token_id` that is in `from`'s balance to `to`'s balance if the caller is an approved operator to do so.

Returns an error containing `NftError.SelfTransfer` if the `from` and `to` are the same.

Returns an error containing `NftError.Unauthorized` if the caller is not an approved operator of `token_id`.

Returns an error containing `NftError.Unauthorized` if `from` does not own `token_id`.

If the transfer goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
transferFrom: (from: principal, to: principal, token_id: nat64) -> (Result);
```

<br>

#### supportedInterfaces
---

Returns the interfaces supported by this NFT canister.

```
supportedInterfaces: () -> (vec SupportedInterface) query;
```

<br>

#### logo
---

Returns the logo of the NFT contract as Base64 encoded text.

```
logo: () -> (opt text) query;
```

<br>

#### setLogo
---
Sets the logo of the NFT canister. Base64 encoded text is recommended.

```
setLogo: (text) -> ();
```

<br>

#### name
---

Returns the name of the NFT contract.

```
name: () -> (opt text) query;
```

<br>

#### setName
---
Sets the name of the NFT canister. 

```
setName: (text) -> ();
```

<br>

#### symbol
---

Returns the symbol of the NFT contract.

```
symbol: () -> (opt text) query;
```

<br>

#### setSymbol
---
Sets the symbol for the NFT canister.

Caller must be the owner of NFT canister, else an error containing `NftError.Unauthorized` will be returned.

```
setSymbol: () -> (opt text);
```

<br>

#### setName
---
Sets the name of the NFT canister. 

```
setName: (text) -> ();
```

<br>

#### totalSupply
---

Returns a `Nat` that represents the total current supply of NFT tokens. 

NFTs that are minted and later burned explictely or sent to the zero address should also count towards totalSupply.

```
totalSupply: () -> (nat) query;
```

<br>

#### metadata
---

Returns the `Metadata` of the NFT canister which includes `owners`, `logo`, `name`, `created_at`, `upgraded_at`, and `symbol`.

```
metadata: () -> (Metadata) query;
```

<br>

#### tokenMetadata
---

Returns the `Metadata` for `token_id`. 

Returns `NftError.TokenNotFound` if the `token_id`
does not exist.

```
tokenMetadata: (token_id: nat64) -> (Result_1) query;
```

<br>

#### ownerTokenIds
---

Returns a list with all the token Ids of the tokens `user` owns.

If there is no owner that matches `user`, then an error containing `NftError.OwnerNotFound` is returned.

```
ownerTokenIds: (user: principal) -> (Result_6) query;
```

<br>

#### ownerTokenMetadata
---

Returns a list with the token metadata for each token  `user` owns.

If there is no owner that matches `user`, then an error containing `NftError.OwnerNotFound` is returned.

```
ownerTokenMetadata: (user: principal) -> (Result_2) query;
```

<br>

#### setOwners
---
Sets the list of owners for the NFT canister.

Caller must be the owner of NFT canister, else an error containing `NftError.Unauthorized` will be returned.


```
setOwners: (vec principal) -> ();
```

<br>

---
---


### ✅ Approval Interface

This interface adds approve functionality to DIP-721 tokens.

<br>

#### approve
---

Calling `approve` grants the `operator` the ability to make update calls to the specificied `token_id`.

Approvals given by the `approve` function are independent from approvals given by the `setApprovalForAll`.

Returns an error that includes `NftError.SelfApprove` if the caller is also the `operator`.

Returns an error that includes `NftError.Unauthorized` if the caller is not the owner of `token_id`.

If the approval goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
approve: (operator: principal, token_id: nat64) -> (Result);
```

<br>

#### setApprovalForAll
---

Enable or disable an `operator` to manage all of the tokens for the caller of this function. The contract allows multiple operators per owner.

Approvals granted by the `approve` function are independent from the approvals granted by `setApprovalForAll` function.

Returns an error containing `NftError.SelfApprove` if the operator is the same as the caller.

If the approval goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
setApprovalForAll: (operator: principal, isApproved: bool) -> (Result);
```

<br>


#### isApprovedForAll
---

Returns `true` if the given `operator` is an approved operator for all the tokens owned by the caller through the use of the `setApprovalForAll` method, returns `false` otherwise.

Returns an error containing `NftError.OwnerNotFound` when `owner` does not exist.

```
isApprovedForAll: (operator: principal, owner: principal) -> (Result_4) query;
```

<br>

#### operatorOf
---
Returns the Principal for the operator of `token_id`, if one exists.

Returns an error containing `NftError.TokenNotFound` if `token_id` does not exist.

```
operatorOf: (token_id: nat64) -> (Result_5) query;
```

<br>

#### operatorTokenIds
---
Returns a list of the `token_id`'s that `operator` has been approved to transfer on behalf of the owner.

If no such `operator` exists, returns an error that contains `NftError::OperatorNotFound`.

```
operatorTokenIds: (operator: principal) -> (Result_3) query;
```

<br>

#### operatorTokenMetadata
---
Returns a list that contains the `TokenMetadata` of the NFTs that `operator` has been approved to transfer on behalf of the owner.

If no such `operator` exists, returns an error that contains `NftError::OperatorNotFound`.

```
operatorTokenMetadata: (operator: principal) -> (Result_2) query;
```

---
---

### 💠 Mint Interface

This interface adds mint functionality to DIP-721 tokens.

<br>

#### mint
---

Mint an NFT for principal `to` that has an ID of `token_id` and metadata akin to `properties`. Implementations are encouraged to only allow minting by the owner of the canister.

Returns an error containing `NftError.ExistedNFT` if the `token_id` already exists.

Returns an error containing `NftError.Aunauthorized` if the caller doesn't have permissions to mint an NFT.

If the mint goes through, returns a `Nat` that represents the CAP History transaction ID that can be used at the `transaction` method.

```
mint: (to: principal, token_id: nat64, properties: vec record { text; GenericValue }) -> (Result);
```

---
---

### 🔥 Burn Interface

This interface adds burn functionality to DIP-721 tokens.

<br>

#### burn
---

Burn an NFT identified by `token_id`. Calling burn on a token sets the owner to `None` and will no longer be useable. Burned tokens do still count towards `totalSupply`.

Implementations are encouraged to only allow burning by the owner of the `token_id`. 

Returns an error containing `NftError.Unauthorized` if the caller doesn't have the permission to burn the NFT. 

Returns an error containing `NftError.InvalidTokenId` if the provided `token_id` doesn't exist.

```
burn: (token_id: nat) -> ();
```

---
---

### 📬 History Interface

#### transaction 
---
Returns the `TxEvent` that corresponds with `tx_id`.

If there is no `TxEvent` that corresponds with the `tx_id` entered, returns a `NftError.TxNotFound`.

```
transaction : (nat) -> (Result_8) query;
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
---
## Data Structure Specification

These are the data structures that must be used when interacting with a DIP721 canister. 

### Generic Value
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
  Principal : principal;
  TextContent : text;
};
```

### InitArgs
```
type InitArgs = record {
  owners : opt vec principal;
  logo : opt text;
  name : opt text;
  symbol : opt text;
};
```

### Metadata
```
type Metadata = record {
  owners : vec principal;
  logo : opt text;
  name : opt text;
  created_at : nat64;
  upgraded_at : nat64;
  symbol : opt text;
};
```

### NftError
```
type NftError = variant {
  SelfTransfer;
  TokenNotFound;
  TxNotFound;
  SelfApprove;
  OperatorNotFound;
  Unauthorized;
  ExistedNFT;
  OwnerNotFound;
  Other : text;
};
```

### Result Types
Result types are primarly used as the return types for DIP721 methods.

#### Result
---
```
type Result = variant { Ok : nat; Err : NftError };
```

#### Result_1
---
```
type Result_1 = variant { Ok : TokenMetadata; Err : NftError };
```

#### Result_2
---
```
type Result_2 = variant { Ok : vec TokenMetadata; Err : NftError };
```

#### Result_3
---
```
type Result_3 = variant { Ok : vec text; Err : NftError };
```

#### Result_4
---
```
type Result_4 = variant { Ok : bool; Err : NftError };
```

#### Result_5
---
```
type Result_5 = variant { Ok : opt principal; Err : NftError };
```

#### Result_6
---
```
type Result_6 = variant { Ok : vec nat; Err : NftError };
```

#### Result_7
---
```
type Result_7 = variant { Ok : principal; Err : NftError };
```

#### Result_8
---
```
type Result_8 = variant { Ok : TxEvent; Err : NftError };
```

<br>

### SupportedInterface
```
type SupportedInterface = variant { 
  Burn; 
  Mint; 
  Approval; 
  TransactionHistory };
```

### TokenMetadata
```
type TokenMetadata = record {
  transferred_at : opt nat64;
  transferred_by : opt principal;
  owner : principal;
  operator : opt principal;
  properties : vec record { text; GenericValue };
  token_identifier : nat;
  minted_at : nat64;
  minted_by : principal;
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

<br>

---
---
## Deprecated Interface & Data Structure



### OwnerResult
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

### TxReceipt
---
```
type TxReceipt =
variant {
   Err: ApiError;
   Ok: nat;
 };
```

<br>

### InterfaceId
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

### LogoResult
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

### MetadataResult
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

### TxResult
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

### MintReceipt
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

### BurnRequest
---
```
type BurnRequest =
 record {
     token_id: nat64;
 }
```

---
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



## 🤑 Fees

Implementations are encouraged not to charge any fees when an approved entity
transfers NFTs on the user's behalf, as that entity might have no means for payment.
If any fees needs to be taken for such a `transferFromDip721`, `safeTransferFromDip721`,
`transferFromNotifyDip721`, `safeTransferFromNotifyDip721` call,
then it is encouraged to be taken during the call to `approveDip721`, `setApprovalForAllDip721`
from the caller's balance.