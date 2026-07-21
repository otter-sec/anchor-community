#!/usr/bin/env bash

export RUST_LOG=

echo "============= Contact tests:"
pushd packages/tests && bun test && popd
echo "============= SDK tests:"
pushd packages/sdk && bun test && popd
echo "============= CLI tests:"
pushd packages/cli && bun test && popd