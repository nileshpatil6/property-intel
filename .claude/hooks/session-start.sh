#!/bin/bash
set -euo pipefail

# Claude Code on the web runs in a fresh container whose global git identity is
# Claude <noreply@anthropic.com>, with commit signing enabled against an
# Anthropic SSH key. Left alone, every commit made from a web session lands in
# this repo's history under Claude's name instead of the repo owner's.
#
# Local Claude Code sessions already use the machine's own git identity, so this
# only needs to run in the remote environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

git config --local user.name "nileshpatil6"
git config --local user.email "technil6436@gmail.com"

# The container signs commits with an Anthropic key. Signing as Anthropic while
# authoring as the repo owner makes GitHub show the commit as "Unverified", so
# turn signing off rather than leave a broken badge on every commit.
git config --local commit.gpgsign false
git config --local tag.gpgsign false

echo "git identity set to $(git config user.name) <$(git config user.email)>"
