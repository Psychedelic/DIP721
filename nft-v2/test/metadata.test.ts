import {aliceActor, bobActor, canisterOwnerActor, canisterOwnerIdentity, johnActor} from "./setup";
import test, {Assertions} from "ava";

const actors = [aliceActor, bobActor, johnActor, canisterOwnerActor];

const testName = async (t: Assertions) => {
  (await Promise.all(actors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, []));
  await t.throwsAsync(aliceActor.setName("nft"));
  await t.throwsAsync(bobActor.setName("nft"));
  await t.throwsAsync(johnActor.setName("nft"));
  (await Promise.all(actors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setName("nft"));
  (await Promise.all(actors.map(actor => actor.name()))).forEach(result => t.deepEqual(result, ["nft"]));
};

const testLogo = async (t: Assertions) => {
  (await Promise.all(actors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, []));
  await t.throwsAsync(aliceActor.setLogo("nftLogo"));
  await t.throwsAsync(bobActor.setLogo("nftLogo"));
  await t.throwsAsync(johnActor.setLogo("nftLogo"));
  (await Promise.all(actors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setLogo("nftLogo"));
  (await Promise.all(actors.map(actor => actor.logo()))).forEach(result => t.deepEqual(result, ["nftLogo"]));
};

const testSymbol = async (t: Assertions) => {
  (await Promise.all(actors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, []));
  await t.throwsAsync(aliceActor.setSymbol("nftSymbol"));
  await t.throwsAsync(bobActor.setSymbol("nftSymbol"));
  await t.throwsAsync(johnActor.setSymbol("nftSymbol"));
  (await Promise.all(actors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, []));
  await t.notThrowsAsync(canisterOwnerActor.setSymbol("nftSymbol"));
  (await Promise.all(actors.map(actor => actor.symbol()))).forEach(result => t.deepEqual(result, ["nftSymbol"]));
};

test("test metadata", async t => {
  await Promise.all([testName(t), testLogo(t), testSymbol(t)]);
  (await Promise.all(actors.map(actor => actor.metadata()))).forEach(result => {
    t.deepEqual(result.name, ["nft"]);
    t.deepEqual(result.logo, ["nftLogo"]);
    t.deepEqual(result.symbol, ["nftSymbol"]);
    t.is(result.owners.filter(owner => owner.toText() === canisterOwnerIdentity.getPrincipal().toText()).length, 1);
    t.is(result.owners.length, 2);
  });
});
