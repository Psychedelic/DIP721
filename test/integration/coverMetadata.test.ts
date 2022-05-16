import test from "ava";

import {aliceActor, bobActor, custodianActor, johnActor} from "../setup";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, custodianActor];

test("COVER metadata.", async t => {
  (await Promise.all(allActors.map(actor => actor.gitCommitHash()))).forEach(result =>
    t.true(typeof result === "string" && result !== "")
  );
  (await Promise.all(allActors.map(actor => actor.rustToolchainInfo()))).forEach(result =>
    t.true(typeof result === "string" && result !== "")
  );
  (await Promise.all(allActors.map(actor => actor.dfxInfo()))).forEach(result =>
    t.true(typeof result === "string" && result !== "")
  );
});
