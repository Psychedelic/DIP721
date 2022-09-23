import test from "ava";

import {aliceActor, bobActor, custodianActor, johnActor} from "../setup";

const normalActors = [aliceActor, bobActor, johnActor];
const allActors = [...normalActors, custodianActor];

test("Cover metadata.", async t => {
  (await Promise.all(allActors.map(actor => actor.git_commit_hash()))).forEach(result =>
    t.true(typeof result === "string" && result !== "")
  );
  (await Promise.all(allActors.map(actor => actor.rust_toolchain_info()))).forEach(result =>
    t.true(typeof result === "string" && result !== "")
  );
  (await Promise.all(allActors.map(actor => actor.dfx_info()))).forEach(result =>
    t.true(typeof result === "string" && result !== "")
  );
});
