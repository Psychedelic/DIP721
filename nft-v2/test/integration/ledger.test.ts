import {
  aliceActor,
  aliceIdentity,
  bobActor,
  bobIdentity,
  canisterOwnerActor,
  canisterOwnerIdentity,
  johnActor,
  johnIdentity
} from "../setup";
import {TokenMetadata} from "../factory/idl.d";
import test from "ava";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, canisterOwnerActor];

test.serial("mint OK - v1", async t => {
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

test.serial("mint ERROR", async t => {
  // mint error when caller is not an owner
  (
    await Promise.allSettled(
      normalActors.map(actor =>
        actor.mint(aliceIdentity.getPrincipal(), "Nft00001", [["A", {Nat64Content: BigInt(9999)}]])
      )
    )
  ).forEach(promise => t.is(promise.status, "rejected"));

  // mint error when existed nft
  t.deepEqual(
    await canisterOwnerActor.mint(bobIdentity.getPrincipal(), "Nft00001", [["Z", {Int64Content: BigInt(-1)}]]),
    {
      Err: {
        ExistedNFT: null
      }
    }
  );

  // transaction error when non-exist tx_id
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(0))))).forEach(result => {
    t.deepEqual(result, {
      Err: {
        TxNotFound: null
      }
    });
  });

  // tokenMetadata error when non-exist token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
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
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Err: {TokenNotFound: null}});
  });

  // ownerTokenIds error when non-exist owner
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OwnerNotFound: null}});
  });

  // ownerTokenMetadata error when non-exist owner
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(canisterOwnerIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OwnerNotFound: null}});
    }
  );

  // operatorOf error when non-exist token
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Err: {TokenNotFound: null}});
  });
});

test.serial("mint OK - v2", async t => {
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

test.serial("mint OK - v3", async t => {
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
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
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
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: aliceIdentity.getPrincipal(),
          operator: [],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          token_identifier: "Nft00001",
          minted_by: canisterOwnerIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: aliceIdentity.getPrincipal(),
          operator: [],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          token_identifier: "Nft00002",
          minted_by: canisterOwnerIdentity.getPrincipal()
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

test.serial("approve OK - v1", async t => {
  t.deepEqual(await bobActor.approve(aliceIdentity.getPrincipal(), "Nft00003"), {Ok: BigInt(5)});
  t.deepEqual(await johnActor.approve(aliceIdentity.getPrincipal(), "Nft00004"), {Ok: BigInt(6)});
  t.deepEqual(await aliceActor.approve(bobIdentity.getPrincipal(), "Nft00001"), {Ok: BigInt(7)});
  t.deepEqual(await aliceActor.approve(johnIdentity.getPrincipal(), "Nft00002"), {Ok: BigInt(8)});

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

test.serial("approve OK - v2", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(5))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: bobIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00003"}]
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
          ["token_identifier", {TextContent: "Nft00004"}]
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
          ["token_identifier", {TextContent: "Nft00001"}]
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
          ["token_identifier", {TextContent: "Nft00002"}]
        ]
      }
    });
  });
});

test.serial("approve OK - v3", async t => {
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
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: aliceIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: aliceIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: [aliceIdentity.getPrincipal()]});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00001")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [johnIdentity.getPrincipal()],
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
        operator: [aliceIdentity.getPrincipal()],
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
        operator: [aliceIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: aliceIdentity.getPrincipal(),
          operator: [bobIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          token_identifier: "Nft00001",
          minted_by: canisterOwnerIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: aliceIdentity.getPrincipal(),
          operator: [johnIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          token_identifier: "Nft00002",
          minted_by: canisterOwnerIdentity.getPrincipal()
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
      owner: bobIdentity.getPrincipal(),
      operator: [aliceIdentity.getPrincipal()],
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
      operator: [aliceIdentity.getPrincipal()],
      properties: [["D", {TextContent: "∆≈ç√∫"}]],
      token_identifier: "Nft00004",
      minted_by: canisterOwnerIdentity.getPrincipal()
    });
  });

  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00003"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: bobIdentity.getPrincipal(),
          operator: [aliceIdentity.getPrincipal()],
          properties: [["C", {Int32Content: 5678}]],
          token_identifier: "Nft00003",
          minted_by: canisterOwnerIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00004"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: johnIdentity.getPrincipal(),
          operator: [aliceIdentity.getPrincipal()],
          properties: [["D", {TextContent: "∆≈ç√∫"}]],
          token_identifier: "Nft00004",
          minted_by: canisterOwnerIdentity.getPrincipal()
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
        owner: aliceIdentity.getPrincipal(),
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
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
        owner: aliceIdentity.getPrincipal(),
        operator: [johnIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal()
      });
    }
  );

  // verify operatorTokenIds
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(aliceIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00004"));
  });
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00001"]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00002"]});
  });
});

test.serial("approve ERROR - v1", async t => {
  t.deepEqual(await aliceActor.approve(aliceIdentity.getPrincipal(), "Nft00001"), {Err: {SelfApprove: null}});
  t.deepEqual(await aliceActor.approve(aliceIdentity.getPrincipal(), "Nft00002"), {Err: {SelfApprove: null}});
  t.deepEqual(await bobActor.approve(bobIdentity.getPrincipal(), "Nft00003"), {Err: {SelfApprove: null}});
  t.deepEqual(await johnActor.approve(johnIdentity.getPrincipal(), "Nft00004"), {Err: {SelfApprove: null}});

  // operatorTokenMetadata error when non-existed operator
  (
    await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(canisterOwnerIdentity.getPrincipal())))
  ).forEach(result => {
    t.deepEqual(result, {Err: {OperatorNotFound: null}});
  });

  // operatorTokenIds error when non-existed operator
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(canisterOwnerIdentity.getPrincipal())))).forEach(
    result => {
      t.deepEqual(result, {Err: {OperatorNotFound: null}});
    }
  );
});

test.serial("approve ERROR - v2", async t => {
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00001"), {Err: {Unauthorized: null}});
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00002"), {Err: {Unauthorized: null}});
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00003"), {Err: {Unauthorized: null}});
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00004"), {Err: {Unauthorized: null}});
});

test.serial("approve OK - v4", async t => {
  t.deepEqual(await aliceActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00001"), {Ok: BigInt(9)});
  t.deepEqual(await aliceActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00002"), {Ok: BigInt(10)});
  t.deepEqual(await bobActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00003"), {Ok: BigInt(11)});
  t.deepEqual(await johnActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00004"), {Ok: BigInt(12)});
});

test.serial("approve OK - v5", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(9))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "approve",
        caller: aliceIdentity.getPrincipal(),
        details: [
          ["operator", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00001"}]
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
          ["operator", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00002"}]
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
          ["operator", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00003"}]
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
          ["operator", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00004"}]
        ]
      }
    });
  });
});

test.serial("approve OK - v6", async t => {
  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: [canisterOwnerIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: [canisterOwnerIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: [canisterOwnerIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: [canisterOwnerIdentity.getPrincipal()]});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00001")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [canisterOwnerIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Ok: {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [canisterOwnerIdentity.getPrincipal()],
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
        operator: [canisterOwnerIdentity.getPrincipal()],
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
        operator: [canisterOwnerIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: aliceIdentity.getPrincipal(),
          operator: [canisterOwnerIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          token_identifier: "Nft00001",
          minted_by: canisterOwnerIdentity.getPrincipal()
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
        {
          transferred_at: [],
          transferred_by: [],
          owner: aliceIdentity.getPrincipal(),
          operator: [canisterOwnerIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          token_identifier: "Nft00002",
          minted_by: canisterOwnerIdentity.getPrincipal()
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
      owner: bobIdentity.getPrincipal(),
      operator: [canisterOwnerIdentity.getPrincipal()],
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
      operator: [canisterOwnerIdentity.getPrincipal()],
      properties: [["D", {TextContent: "∆≈ç√∫"}]],
      token_identifier: "Nft00004",
      minted_by: canisterOwnerIdentity.getPrincipal()
    });
  });

  // verify operatorTokenMetadata
  (
    await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(canisterOwnerIdentity.getPrincipal())))
  ).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 4);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
      {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [canisterOwnerIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
      {
        transferred_at: [],
        transferred_by: [],
        owner: aliceIdentity.getPrincipal(),
        operator: [canisterOwnerIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00003"),
      {
        transferred_at: [],
        transferred_by: [],
        owner: bobIdentity.getPrincipal(),
        operator: [canisterOwnerIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00004"),
      {
        transferred_at: [],
        transferred_by: [],
        owner: johnIdentity.getPrincipal(),
        operator: [canisterOwnerIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal()
      }
    );
  });

  // verify operatorTokenIds
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(canisterOwnerIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00004"));
    }
  );
});

test.serial("approve ERROR - v3", async t => {
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

  // operatorTokenIds error when non-existed operator
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OperatorNotFound: null}});
  });
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OperatorNotFound: null}});
  });
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Err: {OperatorNotFound: null}});
  });
});

test.serial("transferFrom ERROR - v1", async t => {
  t.deepEqual(
    await canisterOwnerActor.transferFrom(
      canisterOwnerIdentity.getPrincipal(),
      canisterOwnerIdentity.getPrincipal(),
      "Nft00001"
    ),
    {
      Err: {SelfTransfer: null}
    }
  );
  t.deepEqual(await aliceActor.transferFrom(aliceIdentity.getPrincipal(), aliceIdentity.getPrincipal(), "Nft00002"), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await bobActor.transferFrom(bobIdentity.getPrincipal(), bobIdentity.getPrincipal(), "Nft00003"), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await johnActor.transferFrom(johnIdentity.getPrincipal(), johnIdentity.getPrincipal(), "Nft00004"), {
    Err: {SelfTransfer: null}
  });
});

// invalid owner
test.serial("transferFrom ERROR - v2", async t => {
  t.deepEqual(
    await canisterOwnerActor.transferFrom(
      canisterOwnerIdentity.getPrincipal(),
      aliceIdentity.getPrincipal(),
      "Nft00001"
    ),
    {
      Err: {Unauthorized: null}
    }
  );
  t.deepEqual(
    await aliceActor.transferFrom(canisterOwnerIdentity.getPrincipal(), aliceIdentity.getPrincipal(), "Nft00002"),
    {
      Err: {Unauthorized: null}
    }
  );
  t.deepEqual(
    await bobActor.transferFrom(canisterOwnerIdentity.getPrincipal(), bobIdentity.getPrincipal(), "Nft00003"),
    {
      Err: {Unauthorized: null}
    }
  );
  t.deepEqual(
    await johnActor.transferFrom(canisterOwnerIdentity.getPrincipal(), johnIdentity.getPrincipal(), "Nft00004"),
    {
      Err: {Unauthorized: null}
    }
  );
});

// invalid operator
test.serial("transferFrom ERROR - v3", async t => {
  t.deepEqual(
    await bobActor.transferFrom(aliceIdentity.getPrincipal(), canisterOwnerIdentity.getPrincipal(), "Nft00001"),
    {
      Err: {Unauthorized: null}
    }
  );
  t.deepEqual(
    await bobActor.transferFrom(aliceIdentity.getPrincipal(), canisterOwnerIdentity.getPrincipal(), "Nft00002"),
    {
      Err: {Unauthorized: null}
    }
  );
  t.deepEqual(
    await johnActor.transferFrom(bobIdentity.getPrincipal(), canisterOwnerIdentity.getPrincipal(), "Nft00003"),
    {
      Err: {Unauthorized: null}
    }
  );
  t.deepEqual(
    await aliceActor.transferFrom(johnIdentity.getPrincipal(), canisterOwnerIdentity.getPrincipal(), "Nft00004"),
    {
      Err: {Unauthorized: null}
    }
  );
});

test.serial("transferFrom OK - v1", async t => {
  // verify transaction
  t.deepEqual(
    await canisterOwnerActor.transferFrom(
      aliceIdentity.getPrincipal(),
      canisterOwnerIdentity.getPrincipal(),
      "Nft00001"
    ),
    {
      Ok: BigInt(13)
    }
  );
  t.deepEqual(
    await canisterOwnerActor.transferFrom(
      aliceIdentity.getPrincipal(),
      canisterOwnerIdentity.getPrincipal(),
      "Nft00002"
    ),
    {
      Ok: BigInt(14)
    }
  );
  t.deepEqual(
    await canisterOwnerActor.transferFrom(bobIdentity.getPrincipal(), canisterOwnerIdentity.getPrincipal(), "Nft00003"),
    {
      Ok: BigInt(15)
    }
  );
  t.deepEqual(
    await canisterOwnerActor.transferFrom(johnIdentity.getPrincipal(), aliceIdentity.getPrincipal(), "Nft00004"),
    {
      Ok: BigInt(16)
    }
  );
});

test.serial("transferFrom OK - v2", async t => {
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(13))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: aliceIdentity.getPrincipal()}],
          ["to", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00001"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(14))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: aliceIdentity.getPrincipal()}],
          ["to", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00002"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(15))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: bobIdentity.getPrincipal()}],
          ["to", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00003"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(16))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transferFrom",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: johnIdentity.getPrincipal()}],
          ["to", {Principal: aliceIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00004"}]
        ]
      }
    });
  });
});

test.serial("transferFrom OK - v3", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(1)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(canisterOwnerIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(3)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: canisterOwnerIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: canisterOwnerIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: canisterOwnerIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: aliceIdentity.getPrincipal()});
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

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00001")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: canisterOwnerIdentity.getPrincipal(),
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: canisterOwnerIdentity.getPrincipal(),
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00003")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: canisterOwnerIdentity.getPrincipal(),
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00004")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(aliceIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 1);
      t.like((result as {Ok: Array<TokenMetadata>}).Ok[0], {
        owner: aliceIdentity.getPrincipal(),
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      });
    }
  );
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(canisterOwnerIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 3);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
        {
          owner: canisterOwnerIdentity.getPrincipal(),
          operator: [],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          token_identifier: "Nft00001",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [canisterOwnerIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
        {
          owner: canisterOwnerIdentity.getPrincipal(),
          operator: [],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          token_identifier: "Nft00002",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [canisterOwnerIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00003"),
        {
          owner: canisterOwnerIdentity.getPrincipal(),
          operator: [],
          properties: [["C", {Int32Content: 5678}]],
          token_identifier: "Nft00003",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [canisterOwnerIdentity.getPrincipal()]
        }
      );
    }
  );

  // verify ownerTokenIds
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(aliceIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: ["Nft00004"]});
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(canisterOwnerIdentity.getPrincipal())))).forEach(
    result => {
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
      t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
    }
  );
});

test.serial("transfer ERROR - v1", async t => {
  t.deepEqual(await canisterOwnerActor.transfer(canisterOwnerIdentity.getPrincipal(), "Nft00001"), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await aliceActor.transfer(aliceIdentity.getPrincipal(), "Nft00002"), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await bobActor.transfer(bobIdentity.getPrincipal(), "Nft00003"), {
    Err: {SelfTransfer: null}
  });
  t.deepEqual(await johnActor.transfer(johnIdentity.getPrincipal(), "Nft00004"), {
    Err: {SelfTransfer: null}
  });
});

// invalid owner
test.serial("transfer ERROR - v2", async t => {
  t.deepEqual(await aliceActor.transfer(canisterOwnerIdentity.getPrincipal(), "Nft00001"), {
    Err: {Unauthorized: null}
  });
  t.deepEqual(await aliceActor.transfer(canisterOwnerIdentity.getPrincipal(), "Nft00002"), {
    Err: {Unauthorized: null}
  });
  t.deepEqual(await bobActor.transfer(canisterOwnerIdentity.getPrincipal(), "Nft00003"), {
    Err: {Unauthorized: null}
  });
  t.deepEqual(await johnActor.transfer(canisterOwnerIdentity.getPrincipal(), "Nft00004"), {
    Err: {Unauthorized: null}
  });
});

test.serial("transfer OK - v1", async t => {
  t.deepEqual(await canisterOwnerActor.transfer(johnIdentity.getPrincipal(), "Nft00001"), {
    Ok: BigInt(17)
  });
  t.deepEqual(await canisterOwnerActor.transfer(johnIdentity.getPrincipal(), "Nft00002"), {
    Ok: BigInt(18)
  });
  t.deepEqual(await canisterOwnerActor.transfer(bobIdentity.getPrincipal(), "Nft00003"), {
    Ok: BigInt(19)
  });
  t.deepEqual(await aliceActor.transfer(bobIdentity.getPrincipal(), "Nft00004"), {
    Ok: BigInt(20)
  });
});

test.serial("transfer OK - v2", async t => {
  // verify transaction
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(17))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["to", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00001"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(18))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["to", {Principal: johnIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00002"}]
        ]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.transaction(BigInt(19))))).forEach(result => {
    t.like(result, {
      Ok: {
        operation: "transfer",
        caller: canisterOwnerIdentity.getPrincipal(),
        details: [
          ["owner", {Principal: canisterOwnerIdentity.getPrincipal()}],
          ["to", {Principal: bobIdentity.getPrincipal()}],
          ["token_identifier", {TextContent: "Nft00003"}]
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
          ["token_identifier", {TextContent: "Nft00004"}]
        ]
      }
    });
  });
});

test.serial("transfer OK - v3", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
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

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00001")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: johnIdentity.getPrincipal(),
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: johnIdentity.getPrincipal(),
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00003")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: bobIdentity.getPrincipal(),
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00004")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: bobIdentity.getPrincipal(),
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
      {
        owner: johnIdentity.getPrincipal(),
        operator: [],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
      {
        owner: johnIdentity.getPrincipal(),
        operator: [],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    );
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00003"),
      {
        owner: bobIdentity.getPrincipal(),
        operator: [],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00004"),
      {
        owner: bobIdentity.getPrincipal(),
        operator: [],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    );
  });

  // verify ownerTokenIds
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00004"));
  });
});

test.serial("setApprovalForAll OK - v1", async t => {
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

test.serial("setApprovalForAll OK - v2", async t => {
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

test.serial("setApprovalForAll OK - v3", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
  });

  // verify operatorOf
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: [bobIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });
  (await Promise.all(allActors.map(actor => actor.operatorOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: [johnIdentity.getPrincipal()]});
  });

  // verify token
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00001")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: johnIdentity.getPrincipal(),
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00002")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: johnIdentity.getPrincipal(),
        operator: [bobIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00003")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: bobIdentity.getPrincipal(),
        operator: [johnIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    });
  });
  (await Promise.all(allActors.map(actor => actor.tokenMetadata("Nft00004")))).forEach(result => {
    t.like(result, {
      Ok: {
        owner: bobIdentity.getPrincipal(),
        operator: [johnIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    });
  });

  // verify ownerTokenMetadata
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(johnIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
      {
        owner: johnIdentity.getPrincipal(),
        operator: [bobIdentity.getPrincipal()],
        properties: [["A", {Nat64Content: BigInt(9999)}]],
        token_identifier: "Nft00001",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
      {
        owner: johnIdentity.getPrincipal(),
        operator: [bobIdentity.getPrincipal()],
        properties: [["B", {Int64Content: BigInt(1234)}]],
        token_identifier: "Nft00002",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    );
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenMetadata(bobIdentity.getPrincipal())))).forEach(result => {
    t.true("Ok" in result);
    t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00003"),
      {
        owner: bobIdentity.getPrincipal(),
        operator: [johnIdentity.getPrincipal()],
        properties: [["C", {Int32Content: 5678}]],
        token_identifier: "Nft00003",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [canisterOwnerIdentity.getPrincipal()]
      }
    );
    t.like(
      (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00004"),
      {
        owner: bobIdentity.getPrincipal(),
        operator: [johnIdentity.getPrincipal()],
        properties: [["D", {TextContent: "∆≈ç√∫"}]],
        token_identifier: "Nft00004",
        minted_by: canisterOwnerIdentity.getPrincipal(),
        transferred_by: [aliceIdentity.getPrincipal()]
      }
    );
  });

  // verify ownerTokenIds
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00004"));
  });

  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00004"),
        {
          owner: bobIdentity.getPrincipal(),
          operator: [johnIdentity.getPrincipal()],
          properties: [["D", {TextContent: "∆≈ç√∫"}]],
          token_identifier: "Nft00004",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [aliceIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00003"),
        {
          owner: bobIdentity.getPrincipal(),
          operator: [johnIdentity.getPrincipal()],
          properties: [["C", {Int32Content: 5678}]],
          token_identifier: "Nft00003",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [canisterOwnerIdentity.getPrincipal()]
        }
      );
    }
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(
    result => {
      t.true("Ok" in result);
      t.is((result as {Ok: Array<TokenMetadata>}).Ok.length, 2);
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00002"),
        {
          owner: johnIdentity.getPrincipal(),
          operator: [bobIdentity.getPrincipal()],
          properties: [["B", {Int64Content: BigInt(1234)}]],
          token_identifier: "Nft00002",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [canisterOwnerIdentity.getPrincipal()]
        }
      );
      t.like(
        (result as {Ok: Array<TokenMetadata>}).Ok.find(tokenMetadata => tokenMetadata.token_identifier === "Nft00001"),
        {
          owner: johnIdentity.getPrincipal(),
          operator: [bobIdentity.getPrincipal()],
          properties: [["A", {Nat64Content: BigInt(9999)}]],
          token_identifier: "Nft00001",
          minted_by: canisterOwnerIdentity.getPrincipal(),
          transferred_by: [canisterOwnerIdentity.getPrincipal()]
        }
      );
    }
  );

  // verify operatorTokenIds
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00004"));
  });
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
  });
});

test.serial("setApprovalForAll ERROR - v1", async t => {
  t.deepEqual(await johnActor.setApprovalForAll(johnIdentity.getPrincipal(), true), {Err: {SelfApprove: null}});
  t.deepEqual(await bobActor.setApprovalForAll(bobIdentity.getPrincipal(), true), {Err: {SelfApprove: null}});
  t.deepEqual(await johnActor.setApprovalForAll(johnIdentity.getPrincipal(), false), {Err: {SelfApprove: null}});
  t.deepEqual(await bobActor.setApprovalForAll(bobIdentity.getPrincipal(), false), {Err: {SelfApprove: null}});
});

test.serial("setApprovalForAll OK - v4", async t => {
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

test.serial("setApprovalForAll OK - v5", async t => {
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

test.serial("setApprovalForAll OK - v6", async t => {
  // verify balanceOf
  (await Promise.all(allActors.map(actor => actor.balanceOf(bobIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });
  (await Promise.all(allActors.map(actor => actor.balanceOf(johnIdentity.getPrincipal())))).forEach(result => {
    t.deepEqual(result, {Ok: BigInt(2)});
  });

  // verify ownerOf
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00001")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00002")))).forEach(result => {
    t.deepEqual(result, {Ok: johnIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00003")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
  });
  (await Promise.all(allActors.map(actor => actor.ownerOf("Nft00004")))).forEach(result => {
    t.deepEqual(result, {Ok: bobIdentity.getPrincipal()});
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

  // verify ownerTokenIds
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(johnIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00001"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00002"));
  });
  (await Promise.all(allActors.map(actor => actor.ownerTokenIds(bobIdentity.getPrincipal())))).forEach(result => {
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00003"));
    t.true((result as {Ok: Array<string>}).Ok.includes("Nft00004"));
  });
});

test.serial("setApprovalForAll ERROR - v2", async t => {
  // verify operatorTokenMetadata
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(johnIdentity.getPrincipal())))).forEach(
    result => t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenMetadata(bobIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );

  // verify operatorTokenIds
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(johnIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
  (await Promise.all(allActors.map(actor => actor.operatorTokenIds(bobIdentity.getPrincipal())))).forEach(result =>
    t.deepEqual(result, {Err: {OperatorNotFound: null}})
  );
});
