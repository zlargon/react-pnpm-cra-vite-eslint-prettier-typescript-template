#!/bin/bash
set -e

# setup git hooks path
git config core.hooksPath ghooks
echo "[GIT] git hooks has been installed."
