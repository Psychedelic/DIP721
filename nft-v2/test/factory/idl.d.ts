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
  { 'SelfApprove' : null } |
  { 'OperatorNotFound' : null } |
  { 'Unauthorized' : null } |
  { 'ExistedNFT' : null } |
  { 'OwnerNotFound' : null } |
  { 'Other' : string };
export type Result = { 'Ok' : bigint } |
  { 'Err' : NftError };
export type Result_1 = { 'Ok' : TokenMetadata } |
  { 'Err' : NftError };
export type Result_2 = { 'Ok' : Array<TokenMetadata> } |
  { 'Err' : NftError };
export type Result_3 = { 'Ok' : Array<string> } |
  { 'Err' : NftError };
export type Result_4 = { 'Ok' : boolean } |
  { 'Err' : NftError };
export type Result_5 = { 'Ok' : [] | [Principal] } |
  { 'Err' : NftError };
export type Result_6 = { 'Ok' : Principal } |
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
  'isApprovedForAll' : (arg_0: Principal, arg_1: Principal) => Promise<
      Result_4
    >,
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
  'operatorOf' : (arg_0: string) => Promise<Result_5>,
  'operatorTokenIds' : (arg_0: Principal) => Promise<Result_3>,
  'operatorTokenMetadata' : (arg_0: Principal) => Promise<Result_2>,
  'ownerOf' : (arg_0: string) => Promise<Result_6>,
  'ownerOfDip721' : (arg_0: string) => Promise<Result_6>,
  'ownerTokenIds' : (arg_0: Principal) => Promise<Result_3>,
  'ownerTokenMetadata' : (arg_0: Principal) => Promise<Result_2>,
  'owners' : () => Promise<Array<Principal>>,
  'setApprovalForAll' : (arg_0: Principal, arg_1: boolean) => Promise<Result>,
  'setLogo' : (arg_0: string) => Promise<undefined>,
  'setLogoDip721' : (arg_0: string) => Promise<undefined>,
  'setName' : (arg_0: string) => Promise<undefined>,
  'setNameDip721' : (arg_0: string) => Promise<undefined>,
  'setOwners' : (arg_0: Array<Principal>) => Promise<undefined>,
  'setSymbol' : (arg_0: string) => Promise<undefined>,
  'setSymbolDip721' : (arg_0: string) => Promise<undefined>,
  'supportedInterfaces' : () => Promise<Array<SupportedInterface>>,
  'supportedInterfacesDip721' : () => Promise<Array<SupportedInterface>>,
  'symbol' : () => Promise<[] | [string]>,
  'symbolDip721' : () => Promise<[] | [string]>,
  'tokenMetadata' : (arg_0: string) => Promise<Result_1>,
  'totalSupply' : () => Promise<bigint>,
  'totalSupplyDip721' : () => Promise<bigint>,
  'transaction' : (arg_0: bigint) => Promise<Result_7>,
  'transfer' : (arg_0: Principal, arg_1: string) => Promise<Result>,
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
