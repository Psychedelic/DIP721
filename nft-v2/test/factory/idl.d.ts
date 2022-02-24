import type { Principal } from '@dfinity/principal';
export type GenericValue = { 'Nat64Content' : bigint } |
  { 'Nat32Content' : number } |
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
export type NftError = { 'TokenNotFound' : null } |
  { 'TxNotFound' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidTxId' : null } |
  { 'ExistedNFT' : null } |
  { 'OwnerNotFound' : null };
export type Result = { 'Ok' : bigint } |
  { 'Err' : NftError };
export type Result_1 = { 'Ok' : TokenMetadata } |
  { 'Err' : NftError };
export type Result_2 = { 'Ok' : Array<TokenMetadata> } |
  { 'Err' : NftError };
export type Result_3 = { 'Ok' : Array<string> } |
  { 'Err' : NftError };
export type Result_4 = { 'Ok' : Principal } |
  { 'Err' : NftError };
export type Result_5 = { 'Ok' : TxEvent } |
  { 'Err' : NftError };
export type SupportedInterface = { 'Burn' : null } |
  { 'Mint' : null } |
  { 'Approval' : null } |
  { 'TransactionHistory' : null };
export interface TokenMetadata {
  'transferred_at' : [] | [bigint],
  'transferred_by' : [] | [Principal],
  'owner' : Principal,
  'operator' : [] | [Principal],
  'properties' : Array<[string, GenericValue]>,
  'token_identifier' : string,
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
  'approve' : (arg_0: Principal, arg_1: string) => Promise<Result>,
  'approveDip721' : (arg_0: Principal, arg_1: string) => Promise<Result>,
  'balanceOf' : (arg_0: Principal) => Promise<Result>,
  'balanceOfDip721' : (arg_0: Principal) => Promise<Result>,
  'getMetadataDip721' : (arg_0: string) => Promise<Result_1>,
  'getMetadataForUserDip721' : (arg_0: Principal) => Promise<Result_2>,
  'getTokenIdsForUserDip721' : (arg_0: Principal) => Promise<Result_3>,
  'logo' : () => Promise<[] | [string]>,
  'logoDip721' : () => Promise<[] | [string]>,
  'metadata' : () => Promise<Metadata>,
  'mint' : (
      arg_0: Principal,
      arg_1: string,
      arg_2: Array<[string, GenericValue]>,
    ) => Promise<Result>,
  'mintDip721' : (
      arg_0: Principal,
      arg_1: string,
      arg_2: Array<[string, GenericValue]>,
    ) => Promise<Result>,
  'name' : () => Promise<[] | [string]>,
  'nameDip721' : () => Promise<[] | [string]>,
  'ownerOf' : (arg_0: string) => Promise<Result_4>,
  'ownerOfDip721' : (arg_0: string) => Promise<Result_4>,
  'ownerTokenIds' : (arg_0: Principal) => Promise<Result_3>,
  'ownerTokenMetadata' : (arg_0: Principal) => Promise<Result_2>,
  'setLogo' : (arg_0: string) => Promise<undefined>,
  'setLogoDip721' : (arg_0: string) => Promise<undefined>,
  'setName' : (arg_0: string) => Promise<undefined>,
  'setNameDip721' : (arg_0: string) => Promise<undefined>,
  'setSymbol' : (arg_0: string) => Promise<undefined>,
  'setSymbolDip721' : (arg_0: string) => Promise<undefined>,
  'supportedInterfaces' : () => Promise<Array<SupportedInterface>>,
  'supportedInterfacesDip721' : () => Promise<Array<SupportedInterface>>,
  'symbol' : () => Promise<[] | [string]>,
  'symbolDip721' : () => Promise<[] | [string]>,
  'tokenMetadata' : (arg_0: string) => Promise<Result_1>,
  'totalSupply' : () => Promise<bigint>,
  'totalSupplyDip721' : () => Promise<bigint>,
  'transaction' : (arg_0: bigint) => Promise<Result_5>,
  'transferFrom' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: string,
    ) => Promise<Result>,
  'transferFromDip721' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: string,
    ) => Promise<Result>,
}
