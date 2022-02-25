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

test.serial("Mint OK - v1", async t => {
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

test.serial("Mint ERROR", async t => {
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
    t.like(result, {
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

test.serial("Mint OK - v2", async t => {
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

test.serial("Mint OK - v3", async t => {
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

test.serial("Approve OK - v1", async t => {
  t.deepEqual(await bobActor.approve(aliceIdentity.getPrincipal(), "Nft00003"), {Ok: BigInt(5)});
  t.deepEqual(await johnActor.approve(aliceIdentity.getPrincipal(), "Nft00004"), {Ok: BigInt(6)});
  t.deepEqual(await aliceActor.approve(bobIdentity.getPrincipal(), "Nft00001"), {Ok: BigInt(7)});
  t.deepEqual(await aliceActor.approve(johnIdentity.getPrincipal(), "Nft00002"), {Ok: BigInt(8)});
});

test.serial("Approve OK - v2", async t => {
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

test.serial("Approve OK - v3", async t => {
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

test.serial("Approve ERROR - v1", async t => {
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

test.serial("Approve ERROR - v2", async t => {
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00001"), {Err: {Unauthorized: null}});
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00002"), {Err: {Unauthorized: null}});
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00003"), {Err: {Unauthorized: null}});
  t.deepEqual(await canisterOwnerActor.approve(aliceIdentity.getPrincipal(), "Nft00004"), {Err: {Unauthorized: null}});
});

test.serial("Approve OK - v4", async t => {
  t.deepEqual(await aliceActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00001"), {Ok: BigInt(9)});
  t.deepEqual(await aliceActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00002"), {Ok: BigInt(10)});
  t.deepEqual(await bobActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00003"), {Ok: BigInt(11)});
  t.deepEqual(await johnActor.approve(canisterOwnerIdentity.getPrincipal(), "Nft00004"), {Ok: BigInt(12)});
});

test.serial("Approve OK - v5", async t => {
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

test.serial("Approve OK - v6", async t => {
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

test.serial("Approve ERROR - v3", async t => {
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
