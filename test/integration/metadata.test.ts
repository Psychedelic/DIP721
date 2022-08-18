import test, {Assertions} from "ava";

import {aliceActor, bobActor, custodianActor, custodianIdentity, johnActor} from "../setup";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, custodianActor];

test("CRUD name", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.dip721_name()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(custodianActor.set_name("nft"));
  (await Promise.all(allActors.map(actor => actor.dip721_name()))).forEach(result => t.deepEqual(result, ["nft"]));
});

test("CRUD logo", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.dip721_logo()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(custodianActor.set_logo("nftLogo"));
  (await Promise.all(allActors.map(actor => actor.dip721_logo()))).forEach(result => t.deepEqual(result, ["nftLogo"]));
});

test("CRUD symbol", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.dip721_symbol()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(custodianActor.set_symbol("nftSymbol"));
  (await Promise.all(allActors.map(actor => actor.dip721_symbol()))).forEach(result =>
    t.deepEqual(result, ["nftSymbol"])
  );
});

test("CRUD custodians", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.dip721_custodians()))).forEach(result =>
    t.is(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.filter((custodians: any) => custodians.toText() === custodianIdentity.getPrincipal().toText()).length,
      1
    )
  );
  await t.notThrowsAsync(
    custodianActor.set_custodians([custodianIdentity.getPrincipal(), custodianIdentity.getPrincipal()])
  );
  (await Promise.all(allActors.map(actor => actor.dip721_custodians()))).forEach(result =>
    t.deepEqual(result, [custodianIdentity.getPrincipal()])
  );
});

test("interfaces", async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.dip721_supported_interfaces()))).forEach(result => {
    t.deepEqual(result, [{Approval: null}, {Mint: null}, {Burn: null}]);
  });
});

test("metadata", async t => {
  (await Promise.all(allActors.map(actor => actor.dip721_metadata()))).forEach(result => {
    t.deepEqual(result.name, ["nft"]);
    t.deepEqual(result.logo, ["nftLogo"]);
    t.deepEqual(result.symbol, ["nftSymbol"]);
    t.deepEqual(result.custodians, [custodianIdentity.getPrincipal()]);
  });
});

test("error on unauthorized metadata update", async t => {
  // setName error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.set_name("nft")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setLogo error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.set_logo("nftLogo")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setSymbol error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.set_symbol("nftSymbol")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setCustodians error when caller is not an custodian
  (await Promise.allSettled(normalActors.map(actor => actor.set_custodians([])))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
});
