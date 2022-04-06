import test from "ava";

import {TokenMetadata} from "../factory/idl.d";
import {
  aliceActor,
  aliceIdentity,
  bobActor,
  bobIdentity,
  custodianActor,
  custodianIdentity,
  johnActor,
  johnIdentity
} from "../setup";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, custodianActor];

test.serial("simple mint NFT and verify information.", async t => {
  // mint
  t.deepEqual(
    await custodianActor.mint(aliceIdentity.getPrincipal(), BigInt(1), [["A", {Nat64Content: BigInt(9999)}]]),
    {Ok: BigInt(1)}
  );

  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["to", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(1)}]
        ]
      }
    });
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        approved_at: [],
        approved_by: [],
        burned_by: [],
        burned_at: []
      }
    });
  });

  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Ok: [BigInt(1)]});
    }
  );

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_at: [],
        approved_by: [],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal()
      });
    }
  );

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
});

test.serial("verify stats after simple mint.", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(1));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(1));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(1));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(1));
    t.is(result.total_supply, BigInt(1));
    t.is(result.total_unique_holders, BigInt(1));
  });
});

test.serial("error on query non-existed information.", async t => {
  // mint error when caller is not an owner
  (
    await Promise.allSettled(
      normalActors.map(actor =>
        actor.mint(aliceIdentity.getPrincipal(), BigInt(1), [["A", {Nat64Content: BigInt(9999)}]])
      )
    )
  ).forEach(promise => t.is(promise.status, "rejected"));

  // mint error when existed nft
  t.deepEqual(await custodianActor.mint(bobIdentity.getPrincipal(), BigInt(1), [["Z", {Int64Content: BigInt(-1)}]]), {
    Err: {
      ExistedNFT: null
    }
  });

  // transaction error when non-exist tx_id
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(0))))).forEach(result => {
    t.deepEqual(result, {
      Err: {
        TxNotFound: null
      }
    });
  });

  // tokenMetadata error when non-exist token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {
      Err: {
        TokenNotFound: null
      }
    });
  });

  // balanceOf error when non-exist owner
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });

  // ownerOf error when non-exist token
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Err: {TokenNotFound: null}});
  });

  // ownerTokenIdentifiers error when non-exist owner
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );

  // ownerTokenMetadata error when non-exist owner
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );

  // operatorOf error when non-exist token
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Err: {TokenNotFound: null}});
  });
});

test.serial("mint NFTs.", async t => {
  t.deepEqual(
    await custodianActor.mint(aliceIdentity.getPrincipal(), BigInt(2), [["B", {Int64Content: BigInt(1234)}]]),
    {Ok: BigInt(2)}
  );
  t.deepEqual(await custodianActor.mint(bobIdentity.getPrincipal(), BigInt(3), [["C", {Int32Content: 5678}]]), {
    Ok: BigInt(3)
  });
  t.deepEqual(await custodianActor.mint(johnIdentity.getPrincipal(), BigInt(4), [["D", {TextContent: "∆≈ç√∫"}]]), {
    Ok: BigInt(4)
  });
});

test.serial("verify stats after mint.", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(3));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(4));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(3));
  });
});

test.serial("verify mint information.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["to", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(2)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["to", {Principal: bobIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(3)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["to", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(4)}]
        ]
      }
    });
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_at: [],
        approved_by: [],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [bobIdentity.getPrincipal()],
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_at: [],
        approved_by: [],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [johnIdentity.getPrincipal()],
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_at: [],
        approved_by: [],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });

  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Ok: [BigInt(3)]});
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Ok: [BigInt(4)]});
    }
  );

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          is_burned: false,
          approved_at: [],
          approved_by: [],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(1),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          is_burned: false,
          approved_at: [],
          approved_by: [],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(2),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: [bobIdentity.getPrincipal()],
      operator: [],
      properties: [["C", {Int32Content: 5678}]],
      is_burned: false,
      approved_at: [],
      approved_by: [],
      burned_by: [],
      burned_at: [],
      token_identifier: BigInt(3),
      minted_by: custodianIdentity.getPrincipal()
    });
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: [johnIdentity.getPrincipal()],
      operator: [],
      properties: [["D", {TextContent: "∆≈ç√∫"}]],
      is_burned: false,
      approved_at: [],
      approved_by: [],
      burned_by: [],
      burned_at: [],
      token_identifier: BigInt(4),
      minted_by: custodianIdentity.getPrincipal()
    });
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
});

test.serial("approve NFTs.", async t => {
  t.deepEqual(await bobActor.approve(aliceIdentity.getPrincipal(), BigInt(3)), {Ok: BigInt(5)});
  t.deepEqual(await johnActor.approve(aliceIdentity.getPrincipal(), BigInt(4)), {Ok: BigInt(6)});
  t.deepEqual(await aliceActor.approve(bobIdentity.getPrincipal(), BigInt(1)), {Ok: BigInt(7)});
  t.deepEqual(await aliceActor.approve(johnIdentity.getPrincipal(), BigInt(2)), {Ok: BigInt(8)});

  // verify isApprovedForAll
  (
    await Promise.all([
      ...allActors.map(actor => actor.isApprovedForAll(bobIdentity.getPrincipal(), aliceIdentity.getPrincipal())),
      ...allActors.map(actor => actor.isApprovedForAll(johnIdentity.getPrincipal(), aliceIdentity.getPrincipal()))
    ])
  ).forEach(result => t.deepEqual(result, {Ok: true}));
  (
    await Promise.all([
      ...allActors.map(actor => actor.isApprovedForAll(aliceIdentity.getPrincipal(), bobIdentity.getPrincipal())),
      ...allActors.map(actor => actor.isApprovedForAll(aliceIdentity.getPrincipal(), johnIdentity.getPrincipal()))
    ])
  ).forEach(result => t.deepEqual(result, {Ok: false}));
});

test.serial("verify stats after approve.", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(8));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(3));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(8));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(3));
  });
});

test.serial("verify approve transactions.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(5))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: bobIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(3)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(6))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: johnIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(4)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(7))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: aliceIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: bobIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(1)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(8))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: aliceIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(2)}]
        ]
      }
    });
  });
});

test.serial("verify approve information.", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [johnIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [bobIdentity.getPrincipal()],
        operator: [aliceIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [johnIdentity.getPrincipal()],
        operator: [aliceIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [bobIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(1),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [johnIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(2),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: [bobIdentity.getPrincipal()],
      operator: [aliceIdentity.getPrincipal()],
      properties: [["C", {Int32Content: 5678}]],
      is_burned: false,
      approved_by: [bobIdentity.getPrincipal()],
      burned_by: [],
      burned_at: [],
      token_identifier: BigInt(3),
      minted_by: custodianIdentity.getPrincipal()
    });
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: [johnIdentity.getPrincipal()],
      operator: [aliceIdentity.getPrincipal()],
      properties: [["D", {TextContent: "∆≈ç√∫"}]],
      is_burned: false,
      approved_by: [johnIdentity.getPrincipal()],
      burned_by: [],
      burned_at: [],
      token_identifier: BigInt(4),
      minted_by: custodianIdentity.getPrincipal()
    });
  });

  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(3)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [bobIdentity.getPrincipal()],
          operator: [aliceIdentity.getPrincipal()],
          properties: [["C", {Int32Content: 5678}]],
          is_burned: false,
          approved_by: [bobIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(3),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(4)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [johnIdentity.getPrincipal()],
          operator: [aliceIdentity.getPrincipal()],
          properties: [["D", {TextContent: "∆≈ç√∫"}]],
          is_burned: false,
          approved_by: [johnIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(4),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal()
      });
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [johnIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal()
      });
    }
  );

  // verify operatorTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(4)));
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Ok: [BigInt(1)]});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Ok: [BigInt(2)]});
    }
  );
});

test.serial("error on self approve or approve non-existed operator.", async t => {
  t.deepEqual(await aliceActor.approve(aliceIdentity.getPrincipal(), BigInt(1)), {Err: {SelfApprove: null}});
  t.deepEqual(await aliceActor.approve(aliceIdentity.getPrincipal(), BigInt(2)), {Err: {SelfApprove: null}});
  t.deepEqual(await bobActor.approve(bobIdentity.getPrincipal(), BigInt(3)), {Err: {SelfApprove: null}});
  t.deepEqual(await johnActor.approve(johnIdentity.getPrincipal(), BigInt(4)), {Err: {SelfApprove: null}});

  // operatorTokenMetadata error when non-existed operator
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );

  // operatorTokenIdentifiers error when non-existed operator
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
});

test.serial("error on unauthorize owner when approve.", async t => {
  t.deepEqual(await custodianActor.approve(aliceIdentity.getPrincipal(), BigInt(1)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await custodianActor.approve(aliceIdentity.getPrincipal(), BigInt(2)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await custodianActor.approve(aliceIdentity.getPrincipal(), BigInt(3)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await custodianActor.approve(aliceIdentity.getPrincipal(), BigInt(4)), {Err: {UnauthorizedOwner: null}});
});

test.serial("approve NFTs (new operator).", async t => {
  t.deepEqual(await aliceActor.approve(custodianIdentity.getPrincipal(), BigInt(1)), {Ok: BigInt(9)});
  t.deepEqual(await aliceActor.approve(custodianIdentity.getPrincipal(), BigInt(2)), {Ok: BigInt(10)});
  t.deepEqual(await bobActor.approve(custodianIdentity.getPrincipal(), BigInt(3)), {Ok: BigInt(11)});
  t.deepEqual(await johnActor.approve(custodianIdentity.getPrincipal(), BigInt(4)), {Ok: BigInt(12)});
});

test.serial("verify stats after approve (new operator).", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(12));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(3));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(12));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(3));
  });
});

test.serial("verify approve transactions after updated to new operator.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(9))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: aliceIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(1)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(10))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: aliceIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(2)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(11))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: bobIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(3)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(12))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: johnIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(4)}]
        ]
      }
    });
  });
});

test.serial("verify approve information after updated to new operator.", async t => {
  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [custodianIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [aliceIdentity.getPrincipal()],
        operator: [custodianIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [bobIdentity.getPrincipal()],
        operator: [custodianIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: [johnIdentity.getPrincipal()],
        operator: [custodianIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal()
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [custodianIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(1),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [custodianIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(2),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: [bobIdentity.getPrincipal()],
      operator: [custodianIdentity.getPrincipal()],
      properties: [["C", {Int32Content: 5678}]],
      is_burned: false,
      approved_by: [bobIdentity.getPrincipal()],
      burned_by: [],
      burned_at: [],
      token_identifier: BigInt(3),
      minted_by: custodianIdentity.getPrincipal()
    });
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: [johnIdentity.getPrincipal()],
      operator: [custodianIdentity.getPrincipal()],
      properties: [["D", {TextContent: "∆≈ç√∫"}]],
      is_burned: false,
      approved_by: [johnIdentity.getPrincipal()],
      burned_by: [],
      burned_at: [],
      token_identifier: BigInt(4),
      minted_by: custodianIdentity.getPrincipal()
    });
  });

  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 4);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [custodianIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(1),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [aliceIdentity.getPrincipal()],
          operator: [custodianIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(2),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(3)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [bobIdentity.getPrincipal()],
          operator: [custodianIdentity.getPrincipal()],
          properties: [["C", {Int32Content: 5678}]],
          is_burned: false,
          approved_by: [bobIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(3),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(4)),
        {
          transferred_at: [],
          transferred_by: [],
          owner: [johnIdentity.getPrincipal()],
          operator: [custodianIdentity.getPrincipal()],
          properties: [["D", {TextContent: "∆≈ç√∫"}]],
          is_burned: false,
          approved_by: [johnIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(4),
          minted_by: custodianIdentity.getPrincipal()
        }
      );
    }
  );

  // verify operatorTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(4)));
    }
  );
});

test.serial("error on query old operator information.", async t => {
  // operatorTokenMetadata error when non-existed operator
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );

  // operatorTokenIdentifiers error when non-existed operator
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
});

test.serial("error on self transferFrom.", async t => {
  t.deepEqual(
    await custodianActor.transferFrom(custodianIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(1)),
    {
      Err: {SelfTransfer: null}
    }
  );
  t.deepEqual(await aliceActor.transferFrom(aliceIdentity.getPrincipal(), aliceIdentity.getPrincipal(), BigInt(2)), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await bobActor.transferFrom(bobIdentity.getPrincipal(), bobIdentity.getPrincipal(), BigInt(3)), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await johnActor.transferFrom(johnIdentity.getPrincipal(), johnIdentity.getPrincipal(), BigInt(4)), {
    Err: {SelfTransfer: null}
  });
});

// invalid owner
test.serial("error on unauthorize owner when transferFrom.", async t => {
  t.deepEqual(
    await custodianActor.transferFrom(custodianIdentity.getPrincipal(), aliceIdentity.getPrincipal(), BigInt(1)),
    {
      Err: {UnauthorizedOwner: null}
    }
  );
  t.deepEqual(
    await aliceActor.transferFrom(custodianIdentity.getPrincipal(), aliceIdentity.getPrincipal(), BigInt(2)),
    {
      Err: {UnauthorizedOwner: null}
    }
  );
  t.deepEqual(await bobActor.transferFrom(custodianIdentity.getPrincipal(), bobIdentity.getPrincipal(), BigInt(3)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await johnActor.transferFrom(custodianIdentity.getPrincipal(), johnIdentity.getPrincipal(), BigInt(4)), {
    Err: {UnauthorizedOwner: null}
  });
});

// invalid operator
test.serial("error on unauthorize operator when transferFrom.", async t => {
  t.deepEqual(await bobActor.transferFrom(aliceIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(1)), {
    Err: {UnauthorizedOperator: null}
  });
  t.deepEqual(await bobActor.transferFrom(aliceIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(2)), {
    Err: {UnauthorizedOperator: null}
  });
  t.deepEqual(await johnActor.transferFrom(bobIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(3)), {
    Err: {UnauthorizedOperator: null}
  });
  t.deepEqual(await aliceActor.transferFrom(johnIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(4)), {
    Err: {UnauthorizedOperator: null}
  });
});

test.serial("transferFrom.", async t => {
  t.deepEqual(
    await custodianActor.transferFrom(aliceIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(1)),
    {
      Ok: BigInt(13)
    }
  );
  t.deepEqual(
    await custodianActor.transferFrom(aliceIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(2)),
    {
      Ok: BigInt(14)
    }
  );
  t.deepEqual(
    await custodianActor.transferFrom(bobIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(3)),
    {
      Ok: BigInt(15)
    }
  );
  t.deepEqual(await custodianActor.transferFrom(johnIdentity.getPrincipal(), aliceIdentity.getPrincipal(), BigInt(4)), {
    Ok: BigInt(16)
  });
});

test.serial("verify stats after transferFrom.", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(16));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(2));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(16));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(2));
  });
});

test.serial("verify transferFrom transactions.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(13))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: aliceIdentity.getPrincipal()}],
          ["to", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(1)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(14))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: aliceIdentity.getPrincipal()}],
          ["to", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(2)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(15))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: bobIdentity.getPrincipal()}],
          ["to", {Principal: custodianIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(3)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(16))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: johnIdentity.getPrincipal()}],
          ["to", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(4)}]
        ]
      }
    });
  });
});

test.serial("verify transferFrom information.", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(custodianIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(3)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [custodianIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [custodianIdentity.getPrincipal()],
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [custodianIdentity.getPrincipal()],
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [custodianIdentity.getPrincipal()],
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [aliceIdentity.getPrincipal()],
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        owner: [aliceIdentity.getPrincipal()],
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      });
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 3);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
        {
          owner: [custodianIdentity.getPrincipal()],
          operator: [],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(1),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [custodianIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
        {
          owner: [custodianIdentity.getPrincipal()],
          operator: [],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          is_burned: false,
          approved_by: [aliceIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(2),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [custodianIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(3)),
        {
          owner: [custodianIdentity.getPrincipal()],
          operator: [],
          properties: [["C", {Int32Content: 5678}]],
          is_burned: false,
          approved_by: [bobIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(3),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [custodianIdentity.getPrincipal()]
        }
      );
    }
  );

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Ok: [BigInt(4)]});
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
    }
  );
});

test.serial("error on self transfer.", async t => {
  t.deepEqual(await custodianActor.transfer(custodianIdentity.getPrincipal(), BigInt(1)), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await aliceActor.transfer(aliceIdentity.getPrincipal(), BigInt(2)), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await bobActor.transfer(bobIdentity.getPrincipal(), BigInt(3)), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await johnActor.transfer(johnIdentity.getPrincipal(), BigInt(4)), {
    Err: {SelfTransfer: null}
  });
});

// invalid owner
test.serial("error on unauthorize owner when transfer.", async t => {
  t.deepEqual(await aliceActor.transfer(custodianIdentity.getPrincipal(), BigInt(1)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await aliceActor.transfer(custodianIdentity.getPrincipal(), BigInt(2)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await bobActor.transfer(custodianIdentity.getPrincipal(), BigInt(3)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await johnActor.transfer(custodianIdentity.getPrincipal(), BigInt(4)), {
    Err: {UnauthorizedOwner: null}
  });
});

test.serial("transfer.", async t => {
  t.deepEqual(await custodianActor.transfer(johnIdentity.getPrincipal(), BigInt(1)), {
    Ok: BigInt(17)
  });
  t.deepEqual(await custodianActor.transfer(johnIdentity.getPrincipal(), BigInt(2)), {
    Ok: BigInt(18)
  });
  t.deepEqual(await custodianActor.transfer(bobIdentity.getPrincipal(), BigInt(3)), {
    Ok: BigInt(19)
  });
  t.deepEqual(await aliceActor.transfer(bobIdentity.getPrincipal(), BigInt(4)), {
    Ok: BigInt(20)
  });
});

test.serial("verify stats after transfer.", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(20));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(2));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(20));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(2));
  });
});

test.serial("verify transfer transactions.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(17))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: custodianIdentity.getPrincipal()}],
          ["to", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(1)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(18))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: custodianIdentity.getPrincipal()}],
          ["to", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(2)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(19))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: custodianIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: custodianIdentity.getPrincipal()}],
          ["to", {Principal: bobIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(3)}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(20))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: aliceIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: aliceIdentity.getPrincipal()}],
          ["to", {Principal: bobIdentity.getPrincipal()}],
          ["token_identifier", {NatContent: BigInt(4)}]
        ]
      }
    });
  });
});

test.serial("verify transfer information.", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [johnIdentity.getPrincipal()],
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [johnIdentity.getPrincipal()],
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [bobIdentity.getPrincipal()],
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [bobIdentity.getPrincipal()],
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
      {
        owner: [johnIdentity.getPrincipal()],
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
      {
        owner: [johnIdentity.getPrincipal()],
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [aliceIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    );
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(3)),
      {
        owner: [bobIdentity.getPrincipal()],
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(4)),
      {
        owner: [bobIdentity.getPrincipal()],
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    );
  });

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(4)));
    }
  );
});

test.serial("setApprovalForAll(true).", async t => {
  t.deepEqual(await bobActor.setApprovalForAll(johnIdentity.getPrincipal(), true), {Ok: BigInt(21)});
  t.deepEqual(await johnActor.setApprovalForAll(bobIdentity.getPrincipal(), true), {Ok: BigInt(22)});

  // verify isApprovedForAll
  (
    await Promise.all([
      ...allActors.map(actor => actor.isApprovedForAll(bobIdentity.getPrincipal(), johnIdentity.getPrincipal())),
      ...allActors.map(actor => actor.isApprovedForAll(johnIdentity.getPrincipal(), bobIdentity.getPrincipal()))
    ])
  ).forEach(result => t.deepEqual(result, {Ok: true}));
});

test.serial("verify stats after setApprovalForAll(true).", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(22));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(2));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(22));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(2));
  });
});

test.serial("verify setApprovalForAll(true) transactions.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(21))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "setApprovalForAll",
        caller: bobIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: johnIdentity.getPrincipal()}],
          ["is_approved", {BoolContent: true}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(22))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "setApprovalForAll",
        caller: johnIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: bobIdentity.getPrincipal()}],
          ["is_approved", {BoolContent: true}]
        ]
      }
    });
  });
});

test.serial("verify setApprovalForAll(true) information.", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [johnIdentity.getPrincipal()],
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [johnIdentity.getPrincipal()],
        operator: [bobIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [bobIdentity.getPrincipal()],
        operator: [johnIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [bobIdentity.getPrincipal()],
        operator: [johnIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
      {
        owner: [johnIdentity.getPrincipal()],
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
      {
        owner: [johnIdentity.getPrincipal()],
        operator: [bobIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: false,
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    );
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(3)),
      {
        owner: [bobIdentity.getPrincipal()],
        operator: [johnIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(4)),
      {
        owner: [bobIdentity.getPrincipal()],
        operator: [johnIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: false,
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [],
        burned_at: [],
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    );
  });

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(4)));
    }
  );

  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(4)),
        {
          owner: [bobIdentity.getPrincipal()],
          operator: [johnIdentity.getPrincipal()],
          properties: [["D", {TextContent: "∆≈ç√∫"}]],
          is_burned: false,
          approved_by: [bobIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(4),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [aliceIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(3)),
        {
          owner: [bobIdentity.getPrincipal()],
          operator: [johnIdentity.getPrincipal()],
          properties: [["C", {Int32Content: 5678}]],
          is_burned: false,
          approved_by: [bobIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(3),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [custodianIdentity.getPrincipal()]
        }
      );
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(2)),
        {
          owner: [johnIdentity.getPrincipal()],
          operator: [bobIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          is_burned: false,
          approved_by: [johnIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(2),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [custodianIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === BigInt(1)),
        {
          owner: [johnIdentity.getPrincipal()],
          operator: [bobIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          is_burned: false,
          approved_by: [johnIdentity.getPrincipal()],
          burned_by: [],
          burned_at: [],
          token_identifier: BigInt(1),
          minted_by: custodianIdentity.getPrincipal(),
          transferred_by: [custodianIdentity.getPrincipal()]
        }
      );
    }
  );

  // verify operatorTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(4)));
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
    }
  );
});

test.serial("error on self approve when setApprovalForAll.", async t => {
  t.deepEqual(await johnActor.setApprovalForAll(johnIdentity.getPrincipal(), true), {Err: {SelfApprove: null}});
  t.deepEqual(await bobActor.setApprovalForAll(bobIdentity.getPrincipal(), true), {Err: {SelfApprove: null}});
  t.deepEqual(await johnActor.setApprovalForAll(johnIdentity.getPrincipal(), false), {Err: {SelfApprove: null}});
  t.deepEqual(await bobActor.setApprovalForAll(bobIdentity.getPrincipal(), false), {Err: {SelfApprove: null}});
});

test.serial("setApprovalForAll(false).", async t => {
  t.deepEqual(await bobActor.setApprovalForAll(johnIdentity.getPrincipal(), false), {Ok: BigInt(23)});
  t.deepEqual(await johnActor.setApprovalForAll(bobIdentity.getPrincipal(), false), {Ok: BigInt(24)});

  // verify isApprovedForAll
  (
    await Promise.all([
      ...allActors.map(actor => actor.isApprovedForAll(bobIdentity.getPrincipal(), johnIdentity.getPrincipal())),
      ...allActors.map(actor => actor.isApprovedForAll(johnIdentity.getPrincipal(), bobIdentity.getPrincipal()))
    ])
  ).forEach(result => t.deepEqual(result, {Ok: false}));
});

test.serial("verify setApprovalForAll(false) transactions.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(23))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "setApprovalForAll",
        caller: bobIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: johnIdentity.getPrincipal()}],
          ["is_approved", {BoolContent: false}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(24))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "setApprovalForAll",
        caller: johnIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: bobIdentity.getPrincipal()}],
          ["is_approved", {BoolContent: false}]
        ]
      }
    });
  });
});

test.serial("verify stats after setApprovalForAll(false).", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(24));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(2));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(24));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(2));
  });
});

test.serial("verify setApprovalForAll(false) information.", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(1)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(2)));
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(3)));
      t.true((result as {Ok: Array<bigint>}).Ok.includes(BigInt(4)));
    }
  );
});

test.serial("error on query non-existed operator (operator removed from tokenMetadata).", async t => {
  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );

  // verify operatorTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
});

test.serial("burn NFTs.", async t => {
  t.deepEqual(await johnActor.burn(BigInt(1)), {Ok: BigInt(25)});
  t.deepEqual(await bobActor.burn(BigInt(3)), {Ok: BigInt(26)});
  t.deepEqual(await johnActor.burn(BigInt(2)), {Ok: BigInt(27)});
  t.deepEqual(await bobActor.burn(BigInt(4)), {Ok: BigInt(28)});
});

test.serial("verify stats after burn.", async t => {
  // verify totalTransactions
  (await Promise.all(allActors.map(actor => actor.totalTransactions()))).forEach(result => {
    t.is(result, BigInt(28));
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.is(result, BigInt(4));
  });

  // verify cycles
  (await Promise.all(allActors.map(actor => actor.cycles()))).forEach(result => {
    t.truthy(result);
  });

  // verify totalUniqueHolders
  (await Promise.all(allActors.map(actor => actor.totalUniqueHolders()))).forEach(result => {
    t.is(result, BigInt(0));
  });

  // verify stats
  (await Promise.all(allActors.map(actor => actor.stats()))).forEach(result => {
    t.truthy(result.cycles);
    t.is(result.total_transactions, BigInt(28));
    t.is(result.total_supply, BigInt(4));
    t.is(result.total_unique_holders, BigInt(0));
  });
});

test.serial("verify burn transactions.", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(25))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "burn",
        caller: johnIdentity.getPrincipal(),
        details: [["token_identifier", {NatContent: BigInt(1)}]]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(26))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "burn",
        caller: bobIdentity.getPrincipal(),
        details: [["token_identifier", {NatContent: BigInt(3)}]]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(27))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "burn",
        caller: johnIdentity.getPrincipal(),
        details: [["token_identifier", {NatContent: BigInt(2)}]]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(28))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "burn",
        caller: bobIdentity.getPrincipal(),
        details: [["token_identifier", {NatContent: BigInt(4)}]]
      }
    });
  });
});

test.serial("verify burn information.", async t => {
  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [],
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        is_burned: true,
        token_identifier: BigInt(1),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()],
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [johnIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [],
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        is_burned: true,
        token_identifier: BigInt(2),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()],
        approved_by: [johnIdentity.getPrincipal()],
        burned_by: [johnIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [],
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        is_burned: true,
        token_identifier: BigInt(3),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [custodianIdentity.getPrincipal()],
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [bobIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: [],
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        is_burned: true,
        token_identifier: BigInt(4),
        minted_by: custodianIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()],
        approved_by: [bobIdentity.getPrincipal()],
        burned_by: [bobIdentity.getPrincipal()]
      }
    });
  });
});

test.serial("error on query - burned NFTs.", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(custodianIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(1))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(2))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(3))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf(BigInt(4))))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OwnerNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OwnerNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OwnerNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(custodianIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OwnerNotFound: null}})
  );

  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(custodianIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );

  // verify ownerTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenIdentifiers(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );

  // verify operatorTokenIdentifiers
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIdentifiers(custodianIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
});

test.serial("error on update(mint) - burned NFTs.", async t => {
  // mint
  t.deepEqual(await custodianActor.mint(aliceIdentity.getPrincipal(), BigInt(1), [["X", {Int64Content: BigInt(-1)}]]), {
    Err: {
      ExistedNFT: null
    }
  });
  t.deepEqual(await custodianActor.mint(bobIdentity.getPrincipal(), BigInt(1), [["Y", {Int64Content: BigInt(-1)}]]), {
    Err: {
      ExistedNFT: null
    }
  });
  t.deepEqual(await custodianActor.mint(johnIdentity.getPrincipal(), BigInt(1), [["Z", {Int64Content: BigInt(-1)}]]), {
    Err: {
      ExistedNFT: null
    }
  });
  t.deepEqual(
    await custodianActor.mint(custodianIdentity.getPrincipal(), BigInt(1), [[".", {Int64Content: BigInt(-1)}]]),
    {
      Err: {
        ExistedNFT: null
      }
    }
  );
});

test.serial("error on update(burn) - burned NFTs.", async t => {
  // burn
  t.deepEqual(await aliceActor.burn(BigInt(1)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await bobActor.burn(BigInt(3)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await johnActor.burn(BigInt(2)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await custodianActor.burn(BigInt(4)), {Err: {UnauthorizedOwner: null}});
});

test.serial("error on update(approve) - burned NFTs.", async t => {
  // approve
  t.deepEqual(await aliceActor.approve(bobIdentity.getPrincipal(), BigInt(1)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await bobActor.approve(johnIdentity.getPrincipal(), BigInt(2)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await johnActor.approve(custodianIdentity.getPrincipal(), BigInt(3)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await custodianActor.approve(aliceIdentity.getPrincipal(), BigInt(4)), {Err: {UnauthorizedOwner: null}});
});

test.serial("error on update(transfer) - burned NFTs.", async t => {
  // transfer
  t.deepEqual(await aliceActor.transfer(bobIdentity.getPrincipal(), BigInt(1)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await bobActor.transfer(johnIdentity.getPrincipal(), BigInt(2)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await johnActor.transfer(custodianIdentity.getPrincipal(), BigInt(3)), {Err: {UnauthorizedOwner: null}});
  t.deepEqual(await custodianActor.transfer(aliceIdentity.getPrincipal(), BigInt(4)), {Err: {UnauthorizedOwner: null}});
});

test.serial("error on update(transferFrom) - burned NFTs.", async t => {
  // transferFrom
  t.deepEqual(await aliceActor.transferFrom(bobIdentity.getPrincipal(), johnIdentity.getPrincipal(), BigInt(1)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await bobActor.transferFrom(johnIdentity.getPrincipal(), custodianIdentity.getPrincipal(), BigInt(2)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await johnActor.transferFrom(custodianIdentity.getPrincipal(), aliceIdentity.getPrincipal(), BigInt(3)), {
    Err: {UnauthorizedOwner: null}
  });
  t.deepEqual(await custodianActor.transferFrom(aliceIdentity.getPrincipal(), bobIdentity.getPrincipal(), BigInt(4)), {
    Err: {UnauthorizedOwner: null}
  });
});

test.serial("error on update(setApprovalForAll) - burned NFTs.", async t => {
  // set_approval_for_all
  t.deepEqual(await aliceActor.setApprovalForAll(bobIdentity.getPrincipal(), true), {Err: {OwnerNotFound: null}});
  t.deepEqual(await bobActor.setApprovalForAll(johnIdentity.getPrincipal(), false), {Err: {OwnerNotFound: null}});
  t.deepEqual(await johnActor.setApprovalForAll(custodianIdentity.getPrincipal(), true), {
    Err: {OwnerNotFound: null}
  });
  t.deepEqual(await custodianActor.setApprovalForAll(aliceIdentity.getPrincipal(), false), {
    Err: {OwnerNotFound: null}
  });
});
