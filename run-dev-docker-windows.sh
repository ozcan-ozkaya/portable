#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"
cd $MY_DIR

winpty docker run --rm -it \
    -p 5001:5001 \
    -v "c:\Users\MI\.kube":/root/.kube \
    -e NODE_ENV=development \
    kubevious/portable:dev