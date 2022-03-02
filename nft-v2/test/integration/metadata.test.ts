import {aliceActor, bobActor, canisterOwnerActor, canisterOwnerIdentity, johnActor} from "../setup";
import test, {Assertions} from "ava";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, canisterOwnerActor];

const testName = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setName("nft"));
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, ["nft"]));
};

const testLogo = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setLogo("nftLogo"));
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, ["nftLogo"]));
};

const testSymbol = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setSymbol("nftSymbol"));
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, ["nftSymbol"]));
};

const testOwners = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.owners()))).forEach(result =>
    t.is(result.filter(owner => owner.toText() === canisterOwnerIdentity.getPrincipal().toText()).length, 1)
  );
  await t.notThrowsAsync(
    canisterOwnerActor.setOwners([canisterOwnerIdentity.getPrincipal(), canisterOwnerIdentity.getPrincipal()])
  );
  (await Promise.all(allActors.map(actor => actor.owners()))).forEach(result =>
    t.deepEqual(result, [canisterOwnerIdentity.getPrincipal()])
  );
};

test("CRUD - OK", async t => {
  await Promise.all([testName(t), testLogo(t), testSymbol(t), testOwners(t)]);
  (await Promise.all(allActors.map(actor => actor.metadata()))).forEach(result => {
    t.deepEqual(result.name, ["nft"]);
    t.deepEqual(result.logo, ["nftLogo"]);
    t.deepEqual(result.symbol, ["nftSymbol"]);
    t.deepEqual(result.owners, [canisterOwnerIdentity.getPrincipal()]);
  });
  (await Promise.all(allActors.map(actor => actor.supportedInterfaces()))).forEach(result => {
    t.deepEqual(result, [{Approval: null}, {Mint: null}, {Burn: null}, {TransactionHistory: null}]);
  });
});

test("CRUD - ERROR", async t => {
  // setName error when caller is not an owner
  (await Promise.allSettled(normalActors.map(actor => actor.setName("nft")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setLogo error when caller is not an owner
  (await Promise.allSettled(normalActors.map(actor => actor.setLogo("nftLogo")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setSymbol error when caller is not an owner
  (await Promise.allSettled(normalActors.map(actor => actor.setSymbol("nftSymbol")))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
  // setOwners error when caller is not an owner
  (await Promise.allSettled(normalActors.map(actor => actor.setOwners([])))).forEach(promise =>
    t.is(promise.status, "rejected")
  );
});
