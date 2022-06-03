import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
  { 'FloatContent' : number } |
  { 'Int16Content' : number } |
  { 'BlobContent' : Array<number> } |
  { 'NestedContent' : Vec } |
  { 'Principal' : Principal } |
  { 'TextContent' : string };
export interface InitArgs {
  'cap' : [] | [Principal],
  'logo' : [] | [string],
  'name' : [] | [string],
  'custodians' : [] | [Array<Principal>],
  'symbol' : [] | [string],
}
export interface ManualReply {
  'logo' : [] | [string],
  'name' : [] | [string],
  'created_at' : bigint,
  'upgraded_at' : bigint,
  'custodians' : Array<Principal>,
  'symbol' : [] | [string],
}
export type ManualReply_1 = { 'Ok' : Array<bigint> } |
  { 'Err' : NftError };
export type ManualReply_2 = { 'Ok' : Array<TokenMetadata> } |
  { 'Err' : NftError };
export type ManualReply_3 = { 'Ok' : TokenMetadata } |
  { 'Err' : NftError };
export type NftError = { 'UnauthorizedOperator' : null } |
  { 'SelfTransfer' : null } |
  { 'TokenNotFound' : null } |
  { 'UnauthorizedOwner' : null } |
  { 'SelfApprove' : null } |
  { 'OperatorNotFound' : null } |
  { 'ExistedNFT' : null } |
  { 'OwnerNotFound' : null };
export type Result = { 'Ok' : bigint } |
  { 'Err' : NftError };
export type Result_1 = { 'Ok' : boolean } |
  { 'Err' : NftError };
export type Result_2 = { 'Ok' : [] | [Principal] } |
  { 'Err' : NftError };
export interface Stats {
  'cycles' : bigint,
  'total_transactions' : bigint,
  'total_unique_holders' : bigint,
  'total_supply' : bigint,
}
export type SupportedInterface = { 'Burn' : null } |
  { 'Mint' : null } |
  { 'Approval' : null };
export interface TokenMetadata {
  'transferred_at' : [] | [bigint],
  'transferred_by' : [] | [Principal],
  'owner' : [] | [Principal],
  'operator' : [] | [Principal],
  'approved_at' : [] | [bigint],
  'approved_by' : [] | [Principal],
  'properties' : Array<[string, GenericValue]>,
  'is_burned' : boolean,
  'token_identifier' : bigint,
  'burned_at' : [] | [bigint],
  'burned_by' : [] | [Principal],
  'minted_at' : bigint,
  'minted_by' : Principal,
}
export type Vec = Array<
  [
    string,
    { 'Nat64Content' : bigint } |
      { 'Nat32Content' : number } |
      { 'BoolContent' : boolean } |
      { 'Nat8Content' : number } |
      { 'Int64Content' : bigint } |
      { 'IntContent' : bigint } |
      { 'NatContent' : bigint } |
      { 'Nat16Content' : number } |
      { 'Int32Content' : number } |
      { 'Int8Content' : number } |
      { 'FloatContent' : number } |
      { 'Int16Content' : number } |
      { 'BlobContent' : Array<number> } |
      { 'NestedContent' : Vec } |
      { 'Principal' : Principal } |
      { 'TextContent' : string },
  ]
>;
export interface _SERVICE {
  'approve' : ActorMethod<[Principal, bigint], Result>,
  'balanceOf' : ActorMethod<[Principal], Result>,
  'burn' : ActorMethod<[bigint], Result>,
  'custodians' : ActorMethod<[], Array<Principal>>,
  'cycles' : ActorMethod<[], bigint>,
  'dfxInfo' : ActorMethod<[], string>,
  'gitCommitHash' : ActorMethod<[], string>,
  'isApprovedForAll' : ActorMethod<[Principal, Principal], Result_1>,
  'logo' : ActorMethod<[], [] | [string]>,
  'metadata' : ActorMethod<[], ManualReply>,
  'mint' : ActorMethod<
    [Principal, bigint, Array<[string, GenericValue]>],
    Result,
  >,
  'name' : ActorMethod<[], [] | [string]>,
  'operatorOf' : ActorMethod<[bigint], Result_2>,
  'operatorTokenIdentifiers' : ActorMethod<[Principal], ManualReply_1>,
  'operatorTokenMetadata' : ActorMethod<[Principal], ManualReply_2>,
  'ownerOf' : ActorMethod<[bigint], Result_2>,
  'ownerTokenIdentifiers' : ActorMethod<[Principal], ManualReply_1>,
  'ownerTokenMetadata' : ActorMethod<[Principal], ManualReply_2>,
  'rustToolchainInfo' : ActorMethod<[], string>,
  'setApprovalForAll' : ActorMethod<[Principal, boolean], Result>,
  'setCustodians' : ActorMethod<[Array<Principal>], undefined>,
  'setLogo' : ActorMethod<[string], undefined>,
  'setName' : ActorMethod<[string], undefined>,
  'setSymbol' : ActorMethod<[string], undefined>,
  'stats' : ActorMethod<[], Stats>,
  'supportedInterfaces' : ActorMethod<[], Array<SupportedInterface>>,
  'symbol' : ActorMethod<[], [] | [string]>,
  'tokenMetadata' : ActorMethod<[bigint], ManualReply_3>,
  'totalSupply' : ActorMethod<[], bigint>,
  'totalTransactions' : ActorMethod<[], bigint>,
  'totalUniqueHolders' : ActorMethod<[], bigint>,
  'transfer' : ActorMethod<[Principal, bigint], Result>,
  'transferFrom' : ActorMethod<[Principal, Principal, bigint], Result>,
}
