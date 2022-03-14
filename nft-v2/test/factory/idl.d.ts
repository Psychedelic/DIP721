import type { Principal } from '@dfinity/principal';
export type GenericValue = { 'Nat64Content' : bigint } |
  { 'Nat32Content' : number } |
  { 'BoolContent' : boolean } |
  { 'Nat8Content' : number } |
  { 'Int64Content' : bigint } |
  { 'IntContent' : bigint } |
  { 'NatContent' : bigint } |
  { 'Nat16Content' : number } |
  { 'Int32Content' : number } |
  { 'Int8Content' : number } |
  { 'Int16Content' : number } |
  { 'BlobContent' : Array<number> } |
  { 'Principal' : Principal } |
  { 'TextContent' : string };
export interface InitArgs {
  'owners' : [] | [Array<Principal>],
  'logo' : [] | [string],
  'name' : [] | [string],
  'symbol' : [] | [string],
}
export interface Metadata {
  'owners' : Array<Principal>,
  'logo' : [] | [string],
  'name' : [] | [string],
  'created_at' : bigint,
  'upgraded_at' : bigint,
  'symbol' : [] | [string],
}
export type NftError = { 'SelfTransfer' : null } |
  { 'TokenNotFound' : null } |
  { 'TxNotFound' : null } |
  { 'BurnedNFT' : null } |
  { 'SelfApprove' : null } |
  { 'OperatorNotFound' : null } |
  { 'Unauthorized' : null } |
  { 'ExistedNFT' : null } |
  { 'OwnerNotFound' : null } |
  { 'Other' : string };
export type Result = { 'Ok' : bigint } |
  { 'Err' : NftError };
export type Result_1 = { 'Ok' : boolean } |
  { 'Err' : NftError };
export type Result_2 = { 'Ok' : [] | [Principal] } |
  { 'Err' : NftError };
export type Result_3 = { 'Ok' : Array<bigint> } |
  { 'Err' : NftError };
export type Result_4 = { 'Ok' : Array<TokenMetadata> } |
  { 'Err' : NftError };
export type Result_5 = { 'Ok' : Principal } |
  { 'Err' : NftError };
export type Result_6 = { 'Ok' : TokenMetadata } |
  { 'Err' : NftError };
export type Result_7 = { 'Ok' : TxEvent } |
  { 'Err' : NftError };
export type SupportedInterface = { 'Burn' : null } |
  { 'Mint' : null } |
  { 'Approval' : null } |
  { 'TransactionHistory' : null };
export interface TokenMetadata {
  'transferred_at' : [] | [bigint],
  'transferred_by' : [] | [Principal],
  'owner' : [] | [Principal],
  'operator' : [] | [Principal],
  'properties' : Array<[string, GenericValue]>,
  'is_burned' : boolean,
  'token_identifier' : bigint,
  'burned_at' : [] | [bigint],
  'burned_by' : [] | [Principal],
  'minted_at' : bigint,
  'minted_by' : Principal,
}
export interface TxEvent {
  'time' : bigint,
  'operation' : string,
  'details' : Array<[string, GenericValue]>,
  'caller' : Principal,
}
export interface _SERVICE {
  'approve' : (arg_0: Principal, arg_1: bigint) => Promise<Result>,
  'balanceOf' : (arg_0: Principal) => Promise<Result>,
  'burn' : (arg_0: bigint) => Promise<Result>,
  'isApprovedForAll' : (arg_0: Principal, arg_1: Principal) => Promise<
      Result_1
    >,
  'logo' : () => Promise<[] | [string]>,
  'metadata' : () => Promise<Metadata>,
  'mint' : (
      arg_0: Principal,
      arg_1: bigint,
      arg_2: Array<[string, GenericValue]>,
    ) => Promise<Result>,
  'name' : () => Promise<[] | [string]>,
  'operatorOf' : (arg_0: bigint) => Promise<Result_2>,
  'operatorTokenIds' : (arg_0: Principal) => Promise<Result_3>,
  'operatorTokenMetadata' : (arg_0: Principal) => Promise<Result_4>,
  'ownerOf' : (arg_0: bigint) => Promise<Result_5>,
  'ownerTokenIds' : (arg_0: Principal) => Promise<Result_3>,
  'ownerTokenMetadata' : (arg_0: Principal) => Promise<Result_4>,
  'owners' : () => Promise<Array<Principal>>,
  'setApprovalForAll' : (arg_0: Principal, arg_1: boolean) => Promise<Result>,
  'setLogo' : (arg_0: string) => Promise<undefined>,
  'setName' : (arg_0: string) => Promise<undefined>,
  'setOwners' : (arg_0: Array<Principal>) => Promise<undefined>,
  'setSymbol' : (arg_0: string) => Promise<undefined>,
  'supportedInterfaces' : () => Promise<Array<SupportedInterface>>,
  'symbol' : () => Promise<[] | [string]>,
  'tokenMetadata' : (arg_0: bigint) => Promise<Result_6>,
  'totalSupply' : () => Promise<bigint>,
  'totalTransactions' : () => Promise<bigint>,
  'transaction' : (arg_0: bigint) => Promise<Result_7>,
  'transfer' : (arg_0: Principal, arg_1: bigint) => Promise<Result>,
  'transferFrom' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: bigint,
    ) => Promise<Result>,
}
