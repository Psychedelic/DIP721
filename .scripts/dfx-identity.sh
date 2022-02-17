#!/bin/bash

ALICE_HOME=$(mktemp -d 2>/dev/null || mktemp -d -t alice-temp)
BOB_HOME=$(mktemp -d 2>/dev/null || mktemp -d -t bob-temp)

ALICE_PRINCIPAL_ID=$(HOME=$ALICE_HOME dfx identity get-principal)
BOB_PRINCIPAL_ID=$(HOME=$BOB_HOME dfx identity get-principal)
DEFAULT_PRINCIPAL_ID=$(HOME=$HOME dfx identity get-principal)

ALICE_PEM="$ALICE_HOME/.config/dfx/identity/default/identity.pem"
BOB_PEM="$BOB_HOME/.config/dfx/identity/default/identity.pem"
DEFAULT_PEM="$HOME/.config/dfx/identity/default/identity.pem"

echo "🙋‍♀️ Identities"
echo "ALICE_PRINCIPAL_ID $ALICE_PRINCIPAL_ID"
echo "BOB_PRINCIPAL_ID $BOB_PRINCIPAL_ID"
echo "DEFAULT_PRINCIPAL_ID $DEFAULT_PRINCIPAL_ID"