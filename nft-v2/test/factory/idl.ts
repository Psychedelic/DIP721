// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const InitArgs = IDL.Record({
    'owners' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'logo' : IDL.Opt(IDL.Text),
    'name' : IDL.Opt(IDL.Text),
    'symbol' : IDL.Opt(IDL.Text),
  });
  const NftError = IDL.Variant({
    'SelfTransfer' : IDL.Null,
    'TokenNotFound' : IDL.Null,
    'TxNotFound' : IDL.Null,
    'SelfApprove' : IDL.Null,
    'OperatorNotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'ExistedNFT' : IDL.Null,
    'OwnerNotFound' : IDL.Null,
    'Other' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : NftError });
  const GenericValue = IDL.Variant({
    'Nat64Content' : IDL.Nat64,
    'Nat32Content' : IDL.Nat32,
    'BoolContent' : IDL.Bool,
    'Nat8Content' : IDL.Nat8,
    'Int64Content' : IDL.Int64,
    'IntContent' : IDL.Int,
    'NatContent' : IDL.Nat,
    'Nat16Content' : IDL.Nat16,
    'Int32Content' : IDL.Int32,
    'Int8Content' : IDL.Int8,
    'Int16Content' : IDL.Int16,
    'BlobContent' : IDL.Vec(IDL.Nat8),
    'Principal' : IDL.Principal,
    'TextContent' : IDL.Text,
  });
  const TokenMetadata = IDL.Record({
    'transferred_at' : IDL.Opt(IDL.Nat64),
    'transferred_by' : IDL.Opt(IDL.Principal),
    'owner' : IDL.Principal,
    'operator' : IDL.Opt(IDL.Principal),
    'properties' : IDL.Vec(IDL.Tuple(IDL.Text, GenericValue)),
    'token_identifier' : IDL.Text,
    'minted_at' : IDL.Nat64,
    'minted_by' : IDL.Principal,
  });
  const Result_1 = IDL.Variant({ 'Ok' : TokenMetadata, 'Err' : NftError });
  const Result_2 = IDL.Variant({
    'Ok' : IDL.Vec(TokenMetadata),
    'Err' : NftError,
  });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Vec(IDL.Text), 'Err' : NftError });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : NftError });
  const Metadata = IDL.Record({
    'owners' : IDL.Vec(IDL.Principal),
    'logo' : IDL.Opt(IDL.Text),
    'name' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'upgraded_at' : IDL.Nat64,
    'symbol' : IDL.Opt(IDL.Text),
  });
  const Result_5 = IDL.Variant({
    'Ok' : IDL.Opt(IDL.Principal),
    'Err' : NftError,
  });
  const Result_6 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : NftError });
  const SupportedInterface = IDL.Variant({
    'Burn' : IDL.Null,
    'Mint' : IDL.Null,
    'Approval' : IDL.Null,
    'TransactionHistory' : IDL.Null,
  });
  const TxEvent = IDL.Record({
    'time' : IDL.Nat64,
    'operation' : IDL.Text,
    'details' : IDL.Vec(IDL.Tuple(IDL.Text, GenericValue)),
    'caller' : IDL.Principal,
  });
  const Result_7 = IDL.Variant({ 'Ok' : TxEvent, 'Err' : NftError });
  return IDL.Service({
    'approve' : IDL.Func([IDL.Principal, IDL.Text], [Result], []),
    'approveDip721' : IDL.Func([IDL.Principal, IDL.Text], [Result], []),
    'balanceOf' : IDL.Func([IDL.Principal], [Result], ['query']),
    'balanceOfDip721' : IDL.Func([IDL.Principal], [Result], ['query']),
    'getMetadataDip721' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'getMetadataForUserDip721' : IDL.Func(
        [IDL.Principal],
        [Result_2],
        ['query'],
      ),
    'getTokenIdsForUserDip721' : IDL.Func(
        [IDL.Principal],
        [Result_3],
        ['query'],
      ),
    'isApprovedForAll' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [Result_4],
        ['query'],
      ),
    'logo' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'logoDip721' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'metadata' : IDL.Func([], [Metadata], ['query']),
    'mint' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, GenericValue))],
        [Result],
        [],
      ),
    'mintDip721' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, GenericValue))],
        [Result],
        [],
      ),
    'name' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'nameDip721' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'operatorOf' : IDL.Func([IDL.Text], [Result_5], ['query']),
    'operatorTokenIds' : IDL.Func([IDL.Principal], [Result_3], ['query']),
    'operatorTokenMetadata' : IDL.Func([IDL.Principal], [Result_2], ['query']),
    'ownerOf' : IDL.Func([IDL.Text], [Result_6], ['query']),
    'ownerOfDip721' : IDL.Func([IDL.Text], [Result_6], ['query']),
    'ownerTokenIds' : IDL.Func([IDL.Principal], [Result_3], ['query']),
    'ownerTokenMetadata' : IDL.Func([IDL.Principal], [Result_2], ['query']),
    'owners' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'setApprovalForAll' : IDL.Func([IDL.Principal, IDL.Bool], [Result], []),
    'setLogo' : IDL.Func([IDL.Text], [], []),
    'setLogoDip721' : IDL.Func([IDL.Text], [], []),
    'setName' : IDL.Func([IDL.Text], [], []),
    'setNameDip721' : IDL.Func([IDL.Text], [], []),
    'setOwners' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'setSymbol' : IDL.Func([IDL.Text], [], []),
    'setSymbolDip721' : IDL.Func([IDL.Text], [], []),
    'supportedInterfaces' : IDL.Func(
        [],
        [IDL.Vec(SupportedInterface)],
        ['query'],
      ),
    'supportedInterfacesDip721' : IDL.Func(
        [],
        [IDL.Vec(SupportedInterface)],
        ['query'],
      ),
    'symbol' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'symbolDip721' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'tokenMetadata' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'totalSupply' : IDL.Func([], [IDL.Nat], ['query']),
    'totalSupplyDip721' : IDL.Func([], [IDL.Nat], ['query']),
    'transaction' : IDL.Func([IDL.Nat], [Result_7], []),
    'transfer' : IDL.Func([IDL.Principal, IDL.Text], [Result], []),
    'transferFrom' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Text],
        [Result],
        [],
      ),
    'transferFromDip721' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Text],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => {
  const InitArgs = IDL.Record({
    'owners' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'logo' : IDL.Opt(IDL.Text),
    'name' : IDL.Opt(IDL.Text),
    'symbol' : IDL.Opt(IDL.Text),
  });
  return [IDL.Opt(InitArgs)];
};
