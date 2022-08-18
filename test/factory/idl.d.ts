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
  'dfx_info' : ActorMethod<[], string>,
  'dip721_approve' : ActorMethod<[Principal, bigint], Result>,
  'dip721_balance_of' : ActorMethod<[Principal], Result>,
  'dip721_burn' : ActorMethod<[bigint], Result>,
  'dip721_custodians' : ActorMethod<[], Array<Principal>>,
  'dip721_cycles' : ActorMethod<[], bigint>,
  'dip721_is_approved_for_all' : ActorMethod<[Principal, Principal], Result_1>,
  'dip721_logo' : ActorMethod<[], [] | [string]>,
  'dip721_metadata' : ActorMethod<[], ManualReply>,
  'dip721_mint' : ActorMethod<
    [Principal, bigint, Array<[string, GenericValue]>],
    Result,
  >,
  'dip721_name' : ActorMethod<[], [] | [string]>,
  'dip721_operator_of' : ActorMethod<[bigint], Result_2>,
  'dip721_operator_token_identifiers' : ActorMethod<[Principal], ManualReply_1>,
  'dip721_operator_token_metadata' : ActorMethod<[Principal], ManualReply_2>,
  'dip721_owner_of' : ActorMethod<[bigint], Result_2>,
  'dip721_owner_token_identifiers' : ActorMethod<[Principal], ManualReply_1>,
  'dip721_owner_token_metadata' : ActorMethod<[Principal], ManualReply_2>,
  'dip721_set_approval_for_all' : ActorMethod<[Principal, boolean], Result>,
  'dip721_stats' : ActorMethod<[], Stats>,
  'dip721_supported_interfaces' : ActorMethod<[], Array<SupportedInterface>>,
  'dip721_symbol' : ActorMethod<[], [] | [string]>,
  'dip721_token_metadata' : ActorMethod<[bigint], ManualReply_3>,
  'dip721_total_supply' : ActorMethod<[], bigint>,
  'dip721_total_transactions' : ActorMethod<[], bigint>,
  'dip721_total_unique_holders' : ActorMethod<[], bigint>,
  'dip721_transfer' : ActorMethod<[Principal, bigint], Result>,
  'dip721_transfer_from' : ActorMethod<[Principal, Principal, bigint], Result>,
  'git_commit_hash' : ActorMethod<[], string>,
  'rust_toolchain_info' : ActorMethod<[], string>,
  'set_custodians' : ActorMethod<[Array<Principal>], undefined>,
  'set_logo' : ActorMethod<[string], undefined>,
  'set_name' : ActorMethod<[string], undefined>,
  'set_symbol' : ActorMethod<[string], undefined>,
}
