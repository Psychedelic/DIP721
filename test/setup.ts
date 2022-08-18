import {readFileSync} from "fs";

import {Actor, HttpAgent, Identity} from "@dfinity/agent";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {CapRouter} from "@psychedelic/cap-js";
import fetch from "isomorphic-fetch";

import {idlFactory} from "./factory/idl";
import {_SERVICE as Service} from "./factory/idl.d";

export const host = "http://127.0.0.1:8000";

export const aliceIdentity = Ed25519KeyIdentity.generate();
export const bobIdentity = Ed25519KeyIdentity.generate();
export const johnIdentity = Ed25519KeyIdentity.generate();

// for testing only
// principal id = "xxzsj-nukpm-lgp77-ogouk-7u72u-qvpnj-ppjgn-o736o-z4ezi-jvegq-uae"
const secretKey = readFileSync("./custodian-test-secret", {encoding: "utf8"});
export const custodianIdentity = Ed25519KeyIdentity.fromSecretKey(Buffer.from(secretKey, "hex"));

export const nftCanisterId = JSON.parse(readFileSync("../.dfx/local/canister_ids.json", {encoding: "utf8"}))["nft"]
  .local as string;
export const capCanisterId = JSON.parse(readFileSync("../cap/.dfx/local/canister_ids.json", {encoding: "utf8"}))[
  "cap-router"
].local as string;

const createActor = async (identity: Identity): Promise<Service> => {
  const agent = new HttpAgent({host, fetch, identity});

  const actor = Actor.createActor<Service>(idlFactory, {
    canisterId: nftCanisterId,
    agent
  });

  // Fetch root key for certificate validation during development
  await agent.fetchRootKey().catch(err => {
    console.error("Unable to fetch root key. Check to ensure that your local replica is running");
    throw err;
  });

  return actor;
};

export const aliceActor = await createActor(aliceIdentity);
export const bobActor = await createActor(bobIdentity);
export const johnActor = await createActor(johnIdentity);
export const custodianActor = await createActor(custodianIdentity);

export const capRouter = await CapRouter.init({
  canisterId: capCanisterId,
  host
});
