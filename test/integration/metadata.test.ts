import test, {Assertions} from "ava";

import {aliceActor, bobActor, custodianActor, custodianIdentity, johnActor} from "../setup";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, custodianActor];

test("CRUD name", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(custodianActor.setName("nft"));
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, ["nft"]));
});

test("CRUD logo", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(custodianActor.setLogo("nftLogo"));
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, ["nftLogo"]));
});

test("CRUD symbol", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(custodianActor.setSymbol("nftSymbol"));
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, ["nftSymbol"]));
});

test("CRUD custodians", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.custodians()))).forEach(result =>
    t.is(result.filter(custodians => custodians.toText() === custodianIdentity.getPrincipal().toText()).length, 1)
  );
  await t.notThrowsAsync(
    custodianActor.setCustodians([custodianIdentity.getPrincipal(), custodianIdentity.getPrincipal()])
  );
  (await Promise.all(allActors.map(actor => actor.custodians()))).forEach(result =>
    t.deepEqual(result, [custodianIdentity.getPrincipal()])
  );
});

test("interfaces", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.supportedInterfaces()))).forEach(result => {
    t.deepEqual(result, [{Approval: null}, {Mint: null}, {Burn: null}]);
  });
});

test("metadata", async t => {
  (await Promise.all(allActors.map(actor => actor.metadata()))).forEach(result => {
    t.deepEqual(result.name, ["nft"]);
    t.deepEqual(result.logo, ["nftLogo"]);
    t.deepEqual(result.symbol, ["nftSymbol"]);
    t.deepEqual(result.custodians, [custodianIdentity.getPrincipal()]);
  });
});

test("error on unauthorized metadata update", async t => {
  // setName error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.setName("nft")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setLogo error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.setLogo("nftLogo")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setSymbol error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.setSymbol("nftSymbol")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setCustodians error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.setCustodians([])))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
});
