import {aliceActor, bobActor, canisterOwnerActor, canisterOwnerIdentity, johnActor} from "./setup";
import test, {Assertions} from "ava";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, canisterOwnerActor];

const testName = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, []));
  for (const actor of normalActors) {
    await t.throwsAsync(actor.setName("nft"));
  }
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setName("nft"));
  (await Promise.all(allActors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, ["nft"]));
};

const testLogo = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, []));
  for (const actor of normalActors) {
    await t.throwsAsync(actor.setLogo("nftLogo"));
  }
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setLogo("nftLogo"));
  (await Promise.all(allActors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, ["nftLogo"]));
};

const testSymbol = async (t: Assertions) => {
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, []));
  for (const actor of normalActors) {
    await t.throwsAsync(actor.setSymbol("nftSymbol"));
  }
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setSymbol("nftSymbol"));
  (await Promise.all(allActors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, ["nftSymbol"]));
};

test("metadata", async t => {
  await Promise.all([testName(t), testLogo(t), testSymbol(t)]);
  (await Promise.all(allActors.map(actor => actor.metadata()))).forEach(result => {
    t.deepEqual(result.name, ["nft"]);
    t.deepEqual(result.logo, ["nftLogo"]);
    t.deepEqual(result.symbol, ["nftSymbol"]);
    t.is(result.owners.filter(owner => owner.toText() === canisterOwnerIdentity.getPrincipal().toText()).length, 1);
    t.is(result.owners.length, 2);
  });
  (await Promise.all(allActors.map(actor => actor.supportedInterfaces()))).forEach(result => {
    t.deepEqual(result, [{Approval: null}, {Mint: null}, {Burn: null}, {TransactionHistory: null}]);
  });
});
