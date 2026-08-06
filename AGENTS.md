<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Commit authorship

Commits in this repo are authored by the repo owner only. Never add
`Co-Authored-By:` trailers for Claude or any other assistant, and never add
`Generated with Claude Code` or `Claude-Session` footers to commit messages. The
message body should describe the change and nothing else.

`.claude/hooks/session-start.sh` sets the git identity on each Claude Code on
the web session. Don't override `user.name` or `user.email` from inside a
session.
