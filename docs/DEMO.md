# Five-minute demonstration

1. Start `npm run dev`, open the page, and state that **all operational values are simulated**.
2. The initial checkpoint is 14:30: six settlement anchors, two high-concern settlements and one suspected blockage. Select a map marker; inspect Situation, Evidence and Access tabs.
3. Mundakkai has an urgent medical request. R17 is suspected blocked and avoided; R22 is unknown, so its candidate access is explicitly unverified.
4. Open **Field reports**. Read FR-105 and duplicate FR-106. The seeded structured-field preview is not a working NLP service.
5. Select **Verify closure** for FR-105. Enter a fictional verification reason and confirm. The scenario advances to 14:45, R17 becomes confirmed closed, and a reason is recorded in Activity log. R22 remains the candidate corridor.
6. Advance once to 15:00. R22 is now suspected blocked too. Mundakkai is operationally isolated; the UI displays no usable route instead of inventing one. The action queue raises loss of access while the medical request remains first.
7. Advance to 15:15. A verified R22 closure and conflicting R17 open report appear. R17 stays closed; reviewing the conflicting report records attention, but does not resolve or reopen it.
8. Assign a demo coordinator/team from **Action queue**. No actual dispatch occurs. Export a JSON brief and inspect **Activity log**.
9. Optionally submit a fictional manual report. It appears as manual intake, pending review, with no automated road/priority changes.
10. Reset to 14:00. Working reports, assignments and review marks clear; session audit remains. Replaying is reversible; refreshing clears the entire session.

Play advances one checkpoint every eight seconds and stops advancing at the final checkpoint. Direct timeline selection permits inspecting any checkpoint. Rainfall is static seeded context in this milestone; timeline changes demonstrate evidence/access transitions, not a weather model.

If base tiles fail to load, the UI shows a notice and retains scenario markers, corridors, controls and panels. The tile provider requires internet access. Map lines must never be used for real navigation.
