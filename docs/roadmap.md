# 🚴‍♀️ Roadmap

## Highest priorities

- Add history support, either local history or cap

## High priorities

1. Write unit tests and javascript based tests (logic is heavily based on rollback, so don't use ic-kit)
2. Follow up with ToniqLabs about https://github.com/Toniq-Labs/extendable-token/issues/9 about including multiple assets support
3. ~~Rename interface methods with attributes follow coding guidelines~~

## Mid priority

1. Add support for ICP based fees
2. Support allowances
3. ~~Clean up warnings instead of surpressing them~~
4. Group use declarations (also follow the [style guide](style.md) regarding imports)
5. Remove explicit trapping in the code and support proper return values for errors
6. Change get_mut to thread local variables according to latest dFinity suggestions

⚠️ Warning: Please don't touch the files in the common's directory, they have been moved from the ic blockchain code with small modifications.
