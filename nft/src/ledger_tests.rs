#[cfg(test)]
mod tests {

    use crate::ledger::*;
    use crate::types::*;

    use ic_kit::mock_principals::*;
    use ic_kit::MockContext;

    fn setup_ledger() -> Ledger {
        MockContext::new().inject();
        let mut ledger = Ledger::default();
        let mut metadata_desc = vec![MetadataPart {
            purpose: MetadataPurpose::Rendered,
            key_val_data: vec![MetadataKeyVal {
                key: "location".to_owned(),
                val: MetadataVal::TextContent("mycanister1".to_owned()),
            }],
            data: vec![],
        }];
        ledger.mintNFT(&alice(), &metadata_desc).unwrap();
        metadata_desc[0].key_val_data[0].val = MetadataVal::TextContent("mycanister2".to_owned());
        ledger.mintNFT(&alice(), &metadata_desc).unwrap();
        metadata_desc[0].key_val_data[0].val = MetadataVal::TextContent("mycanister3".to_owned());
        ledger.mintNFT(&bob(), &metadata_desc).unwrap();
        ledger
    }

    // BEGIN DIP-721 //
    #[test]
    fn basic_interface() {
        let mut ledger = setup_ledger();
        assert_eq!(ledger.owner_of(&"0".to_owned()).unwrap(), alice());
        assert_eq!(ledger.owner_of(&"2".to_owned()).unwrap(), bob());

        assert_eq!(ledger.total_supply(), 3);
        assert_eq!(ledger.balance_of(&User::principal(alice())), 2);
        assert_eq!(ledger.balance_of(&User::principal(bob())), 1);
        assert_eq!(ledger.balance_of(&User::principal(john())), 0);

        assert_eq!(ledger.get_metadata_for_user(&alice()).len(), 2);

        assert_eq!(ledger.get_metadata(0).unwrap().len(), 1);

        ledger.transfer(
            &User::principal(alice()),
            &User::principal(bob()),
            &"0".to_owned(),
        );
        assert_eq!(ledger.owner_of(&"0".to_owned()).unwrap(), bob());
    }

    #[should_panic]
    #[test]
    fn owner_of_non_existent_token() {
        let mut ledger = setup_ledger();
        ledger.transfer(
            &User::principal(alice()),
            &User::principal(bob()),
            &"42".to_owned(),
        );
    }

    #[should_panic]
    #[test]
    fn transfer_token_not_owned() {
        let mut ledger = setup_ledger();
        ledger.transfer(
            &User::principal(john()),
            &User::principal(bob()),
            &"0".to_owned(),
        );
    }

    // END DIP-721 //
}
