import {
  aliceActor,
  aliceIdentity,
  bobActor,
  bobIdentity,
  canisterOwnerActor,
  canisterOwnerIdentity,
  johnActor,
  johnIdentity
} from "./setup";
import {TokenMetadata} from "./factory/idl.d";
import test from "ava";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, canisterOwnerActor];

test("OK - v1", async t => {
  // mint
  t.deepEqual(
    await canisterOwnerActor.mint(aliceIdentity.getPrincipal(), "Nft00001", [["A", {Nat64Content: BigInt(9999)}]]),
    {Ok: BigInt(1)}
  );

  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(1))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["to", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00001"}]
        ]
      }
    });
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00001")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });

  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: aliceIdentity.getPrincipal()});
  });

  // verify ownerTokenIds
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00001"]});
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
      });
    }
  );

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.deepEqual(result, BigInt(1));
  });
});

test("ERROR", async t => {
  // mint error when caller is not an owner
  (
    await Promise.allSettled(
      normalActors.map(actor =>
        actor.mint(aliceIdentity.getPrincipal(), "Nft00001", [["A", {Nat64Content: BigInt(9999)}]])
      )
    )
  ).forEach(promise => t.is(promise.status, "rejected"));

  // mint error on existed nft
  t.deepEqual(
    await canisterOwnerActor.mint(bobIdentity.getPrincipal(), "Nft00001", [["Z", {Int64Content: BigInt(-1)}]]),
    {
      Err: {
        ExistedNFT: null
      }
    }
  );

  // transaction error on non-exist tx_id
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(0))))).forEach(result => {
    t.deepEqual(result, {
      Err: {
        TxNotFound: null
      }
    });
  });

  // tokenMetadata error on non-exist token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Err: {
        TokenNotFound: null
      }
    });
  });

  // balanceOf error on non-exist owner
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });

  // ownerOf error on non-exist token
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Err: {TokenNotFound: null}});
  });

  // ownerTokenIds error on non-exist owner
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });

  // ownerTokenMetadata error on non-exist owner
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(canisterOwnerIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );

  // operatorOf error on non-exist token
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Err: {TokenNotFound: null}});
  });
});

test("OK - v2", async t => {
  t.deepEqual(
    await canisterOwnerActor.mint(aliceIdentity.getPrincipal(), "Nft00002", [["B", {Int64Content: BigInt(1234)}]]),
    {Ok: BigInt(2)}
  );
  t.deepEqual(await canisterOwnerActor.mint(bobIdentity.getPrincipal(), "Nft00003", [["C", {Int32Content: 5678}]]), {
    Ok: BigInt(3)
  });
  t.deepEqual(await canisterOwnerActor.mint(johnIdentity.getPrincipal(), "Nft00004", [["D", {TextContent: "∆≈ç√∫"}]]), {
    Ok: BigInt(4)
  });
});

test("OK - v3", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(2))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["to", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00002"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(3))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["to", {Principal: bobIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00003"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(4))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "mint",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["to", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00004"}]
        ]
      }
    });
  });
  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00003")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: bobIdentity.getPrincipal(),
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00004")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: johnIdentity.getPrincipal(),
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal()
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
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: aliceIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });

  // verify ownerTokenIds
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00001", "Nft00002"]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00003"]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00004"]});
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
      });
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[1], {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal()
      });
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: bobIdentity.getPrincipal(),
      operator: [],
      properties: [["C", {Int32Content: 5678}]],
      token_identifier: "Nft00003",
      minted_by: canisterOwnerIdentity.getPrincipal()
    });
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
    t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
      transferred_at: [],
      transferred_by: [],
      owner: johnIdentity.getPrincipal(),
      operator: [],
      properties: [["D", {TextContent: "∆≈ç√∫"}]],
      token_identifier: "Nft00004",
      minted_by: canisterOwnerIdentity.getPrincipal()
    });
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: []});
  });

  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.deepEqual(result, BigInt(4));
  });
});
