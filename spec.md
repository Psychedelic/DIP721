## DIP721 - Spec

DIP721 is an ERC-721 style non-fungible token standard built mirroring its Ethereum counterpart and adapting it to the Internet Computer, maintaining the same interface.

This standard aims to adopt the EIP-721 to the Internet Computer; providing a
simple, non-ambiguous, extendable API for the transfer and tracking ownership of NFTs and expanding/building upon the EXT standard with partial compatibility.

## Motivation

DIP-721 tries to improve on existing Internet Computer standards in the following ways:

- Most NFT projects don't require a multi-token standard, and a simple
  NFT standard like DIP-721 would suffice. Users of NFTs based on multi-token standards (such as EXT) will be required
  to pay extra cycle cost compared to DIP-721.
- Most NFT projects don't require the generalization of IC Principals into Ledger Accounts, and avoiding that direction can help reduce the complexity of the API.
- Most current NFT standards on the IC don't yet have proper metadata support for NFTs.
- The ability to track the history of NFT transfers is an important requirement of almost every
  NFT projects, and it should be a core part of the standard.
- Most NFT projects don't require arbitrarily large token balances, and that can lead to more cycle inefficient implementations.
- DIP-721 closely follows the original EIP-721, and that will make porting existing
  Ethereum contracts onto the IC more straightforward.
- NFTs projects that choose to implement DIP-721, will be able to implement other NFT
  token standards without worrying about interface function name collision. This is achieved by DIP-721
  postfixing all its interface methods with DIP721.

## Interface specification

### Basic interface

Every DIP-721 compatible smart contract must implement this interface. All other interfaces are optional.
For all interface methods trapping (instead of returning an error) is allowed, but not encouraged.

#### balanceOfDip721

Count of all NFTs assigned to `user`.

```
balanceOfDip721: (user: principal) -> (nat64) query;
```

#### ownerOfDip721

Returns the owner of the NFT associated with `token_id`. Returns ApiError.InvalidTokenId, if the token id is invalid.

```
ownerOfDip721: (token_id: nat64) -> (OwnerResult) query;
```

#### safeTransferFromDip721

Safely transfers token_id token from user `from` to user `to`.
If `to` is zero, then `ApiError.ZeroAddress` should be returned. If the caller is neither
the owner, nor an approved operator, nor someone approved with the `approveDip721` function, then `ApiError.Unauthorized`
should be returned. If `token_id` is not valid, then `ApiError.InvalidTokenId` is returned.

```
safeTransferFromDip721: (from: principal, to: principal, token_id: nat64) -> (TxReceipt);
```

#### transferFromDip721

Identical to `safeTransferFromDip721` except that this function doesn't check whether the `to`
is a zero address or not.

```
transferFromDip721: (from: principal, to: principal, token_id: nat64) -> (TxReceipt);
```

#### supportedInterfacesDip721

Returns the interfaces supported by this smart contract.

```
supportedInterfacesDip721: () -> (vec InterfaceId) query;
```

##### logoDip721

Returns the logo of the NFT contract.

```
logoDip721: () -> (LogoResult) query;
```

##### nameDip721

Returns the name of the NFT contract.

```
nameDip721: () -> (text) query;
```

##### symbolDip721

Returns the symbol of the NFT contract.

```
symbolDip721: () -> (text) query;
```

##### totalSupplyDip721

Returns the total current supply of NFT tokens. NFTs that are minted and later
burned explictely or sent to the zero address should also count towards totalSupply.

```
totalSupplyDip721: () -> (nat64) query;
```

##### getMetadataDip721

Returns the metadata for `token_id`. Returns `ApiError.InvalidTokenId`, if the `token_id`
is invalid.

```
getMetadataDip721: (token_id: nat64) -> MetadataResult query;
```

##### getMetadataForUserDip721

Returns all the metadata for the coins `user` owns.

```
getMetadataForUserDip721: (user: principal) -> (vec ExtendedMetadataResult);
```

### Transfer notification interface

This interface add notification feature for NFT transfers. Implementing this interface
might open up other smart contracts to re-entrancy attacks.

#### safeTransferFromNotifyDip721

Same as `safeTransferFromDip721`, but `to` is treated as a smart contract that implements
the `Notification` interface. Upon successful transfer onDIP721Received
is called with `data`.

```
safeTransferFromNotifyDip721: (from: principal, to: principal, token_id: nat64, data: vec nat8) -> (TxReceipt);
```

#### transferFromNotifyDip721

Same as `transferFromDip721`, but `to` is treated as a smart contract that implements
the `Notification` interface. Upon successful transfer onDIP721Received
is called with `data`.

```
transferFromNotifyDip721: (from: principal, to: principal, token_id: nat64, data: vec nat8) -> (TxReceipt);
```

### Approval interface

This interface adds approve functionality to DIP-721 tokens.

#### approveDip721

Change or reaffirm the approved address for an NFT. The zero address indicates
there is no approved address. Only one user can be approved at a time to manage token_id.
Approvals given by the `approveDip721` function are independent from approvals given by the `setApprovalForAllDip721`.
Returns `ApiError.InvalidTokenId`, if the `token_id` is not valid.
Returns `ApiError.Unauthorized` in case the caller neither owns
`token_id` nor he is an operator approved by a call to
the `setApprovalForAll` function.

```
approveDip721: (user: principal, nat64: token_id) -> (TxReceipt) query;
```

#### setApprovalForAllDip721

Enable or disable an `operator` to manage all of the tokens for the caller of
this function. The contract allows multiple operators per owner.
Approvals granted by the `approveDip721` function are independent from the approvals granted
by `setApprovalForAll` function.

```
setApprovalForAllDip721: (operator: principal, isApproved: bool) -> ();
```

#### getApprovedDip721

Returns the approved user for `token_id`. Returns `ApiError.InvalidTokenId`
if the `token_id` is invalid.

```
getApprovedDip721: (token_id: nat64) -> (TxReceipt) query;
```

#### isApprovedForAllDip721

Returns `true` if the given `operator` is an approved operator for all the tokens owned by the caller, returns `false` otherwise.

```
isApprovedForAllDip721: (operator: principal) -> (bool) query;
```

### Mint interface

This interface adds mint functionality to DIP-721 tokens.

#### mintDip721

Mint an NFT for principal `to`. The parameter `blobContent` is non zero, if the NFT
contract embeds the NFTs in the smart contract. Implementations are encouraged
to only allow minting by the owner of the smart contract. Returns `ApiError.Unauthorized`,
if the caller doesn't have the permission to mint the NFT.

```
mintDip721: (to: principal, metadata: Metadata, blobContent: blob) -> (MintReceipt);
```

### Burn interface

This interface adds burn functionality to DIP-721 tokens.

#### burnDip721

Burn an NFT identified by `token_id`. Implementations are encouraged to only allow
burning by the owner of the `token_id`. Returns `ApiError.Unauthorized`,
if the caller doesn't have the permission to burn the NFT. Returns `ApiError.InvalidTokenId`,
if the provided token_id doesn't exist.

```
burnDip721: (token_id: nat64) -> (TxReceipt);
```

## Notification interface

`transferFromNotifyDip721` and `safeTransferFromNotifyDip721` functions can - upon successfull NFT transfer - notify other smart contracts
that adhere to the following interface.

`caller` is the entity that called the `transferFromNotifyDip721` or `safeTransferFromNotifyDip721` function,
and `from` is the previous owner of the NFT.

```
onDIP721Received: (address caller, address from, uint256 token_id, bytes data) -> ();
```

## Datastructure specification

### OwnerResult

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

### TxReceipt

```
type TxReceipt =
variant {
   Err: ApiError;
   Ok: nat;
 };
```

### InterfaceId

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

### LogoResult

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

### MetadataResult

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

#### Predefined key value pairs

##### content hash

Uniquely identifies the content of the NFT by its hash fingerprint. This field might
be missing unless the NFT is stored on the Web, in which case the content hash
is mandatory.

```
{"contentHash", BlobContent(<hash of the content>)}
```

##### contentType

```
{"contentType", TextContent(<MIME type of the NFT>)}
```

##### locationType

```
{"locationType", Nat8Content(<type of the location>)}

1 - IPFS storage
2 - Asset canister storage
3 - URI(Web) storage
4 - Embedded in the token contract
```

##### location

```
{"location", any(<location>)}

// where any(<location>) is one of the followings based on the "locationType"

BlobContent(<IPFS location hash>) - IPFS
TextContent(<PrincipalId of the asset canister>) - Asset canister
TextContent(<URI of the NFT location on the Web>) - URI
location field is missing - Embedded in the token contract
```

### TxResult

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

### MintReceipt

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

### BurnRequest

```
type BurnRequest =
 record {
     token_id: nat64;
 }
```

## Fees

Implementations are encouraged not to charge any fees when an approved entity
transfers NFTs on the user's behalf, as that entity might have no means for payment.
If any fees needs to be taken for such a `transferFromDip721`, `safeTransferFromDip721`,
`transferFromNotifyDip721`, `safeTransferFromNotifyDip721` call,
then it is encouraged to be taken during the call to `approveDip721`, `setApprovalForAllDip721`
from the caller's balance.
