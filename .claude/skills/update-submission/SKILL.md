---
name: update-submission
description: Update docs/SUBMISSION.md (the Space Apps submission draft) from recent work. Use after finishing a feature, adding a data source or library, or using an AI tool for content; also on "update submission", "sync submission".
---

# Update the submission draft

Keep `docs/SUBMISSION.md` in step with what's actually built, so Sunday's submission is copy-paste.

1. `git pull --rebase`, then look at what changed since the draft was last touched:
   `git log --oneline $(git log -1 --format=%H -- docs/SUBMISSION.md)..HEAD` and the diffs of those commits.
2. For each real change, update only the matching parts of `docs/SUBMISSION.md`:
   - **3.5 Detailed Project Description**: add or adjust the feature bullet (what it does, which challenge requirement it meets, status: built / mock / planned). Fill the "How it works", "score", or "worked example" parts if the code now defines them.
   - **3.7 NASA Data log**: new NASA dataset/API → exact name + ID + how the app uses it; flip "planned" → "used in app" when code uses it.
   - **3.8 Other References log**: every new npm package, dataset, image source, or paper.
   - **3.6 AI-use log**: any AI tool newly used (in-app model, generated images/text/code).
   - **Part 4 coverage table**: fill the "Where" column for requirements now met.
   - **3.2 Summary**: only if a headline feature changed.
3. Don't invent facts. Mark anything unverified "(verify)". Keep the existing structure and wording style; don't rewrite sections that are still accurate.
4. Commit as `Update submission draft` and push (pull --rebase first).
