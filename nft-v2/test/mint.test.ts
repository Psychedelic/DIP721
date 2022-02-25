import {aliceActor, aliceIdentity, bobActor, canisterOwnerActor, canisterOwnerIdentity, johnActor} from "./setup";
import {TokenMetadata} from "./factory/idl.d";
import test from "ava";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, canisterOwnerActor];

test("OK", async t => {
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
  // verify totalSupply
  (await Promise.all(allActors.map(actor => actor.totalSupply()))).forEach(result => {
    t.deepEqual(result, BigInt(1));
  });
  // fail case
});

test("ERROR", async t => {
  (
    await Promise.allSettled(
      normalActors.map(actor =>
        actor.mint(aliceIdentity.getPrincipal(), "Nft00001", [["A", {Nat64Content: BigInt(9999)}]])
      )
    )
  ).forEach(promise => t.is(promise.status, "rejected"));
});
