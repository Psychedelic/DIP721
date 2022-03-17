#### Mint example

```
$ dfx canister --network ic call nft mint \
  "(
    principal \"v4ehh-6sqi7-irvn2-s43ef-enl26-h7vtu-kymgf-ikejl-k7mdv-wypuo-kqe\",
    1:nat,
    vec {
      record {
        \"location\";
        variant {
          TextContent = \"my_url\"
        }
      };
      record {
        \"custom\";
        variant {
          NestedContent = vec {
            record {
              \"nested_custom\";
              variant {
                NatContent = 1:nat
              }
            }
          }
        }
      }
    }
  )"
(
  variant {
    Ok = record {
      transferred_at = null;
      transferred_by = null;
      owner = opt principal "v4ehh-6sqi7-irvn2-s43ef-enl26-h7vtu-kymgf-ikejl-k7mdv-wypuo-kqe";
      operator = null;
      properties = vec {
        record { "location"; variant { TextContent = "my_url" } };
        record {
          "custom";
          variant {
            NestedContent = vec {
              record { "nested_custom"; variant { NatContent = 1 : nat } };
            }
          };
        };
      };
      is_burned = false;
      token_identifier = 1 : nat;
      burned_at = null;
      burned_by = null;
      minted_at = 1_647_345_528_522_580_000 : nat64;
      minted_by = principal "j3dqd-46f74-s45g5-yt6qa-c5vyq-4zv7t-y4iie-omikc-cjngg-olpgg-rqe";
    }
  },
)
```
