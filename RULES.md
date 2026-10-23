# RJB Art Studio — Operating Rules

## Deployment and Publishing Rules
- **NEVER** run `npm run publish`, `npm run deploy`, any `netlify` command, or `git push`. The user publishes themselves, ONCE, after all updates are done.
- **WHY:** The Netlify free plan has a limited number of credits per billing cycle (300). Every live deploy costs 15 credits, and if they run out the live site pauses. Never deploy "to verify" or "to finish".
- **Allowed actions:** Edit files, `npm run build`, `npm run check`, `git add -A` and `git commit` (local only). Test on `localhost:5180`.
- `scripts/publish.mjs` refuses to deploy unless the user types `DEPLOY` at an interactive prompt, and aborts if there is no interactive terminal.
- **Always end every final reply with:** "Not published. Ready for your review."

## General Workflow
- No questions. Short replies.
- FIRST run `git log` and `git status` and skip anything already done.
- After EACH item run `npm run build`; if it passes, `git add -A` and `git commit` (local only).
- Never leave a file half-edited.
- If quota runs low, stop after the last finished item and state which one.
