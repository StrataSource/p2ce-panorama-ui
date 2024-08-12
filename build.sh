#!/usr/bin/env bash

set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

npm i
npm run build
