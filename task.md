Here's the full diff of what changed, plain-language:

app/api/onboarding/route.ts

1. Filename sanitization — Airtable's file-upload API can reject filenames with odd characters (spaces, unicode, parens) with a cryptic error. Every filename now gets normalized to safe ASCII before being sent.
2. No more raw provider errors shown to applicants — previously, whatever error message Airtable returned was displayed directly to the person filling out the form (that's the "The string did not match the expected pattern" text you saw). Now they see a plain, generic message, while the full Airtable error gets logged server-side (console.error) so it's visible in Vercel logs instead of being a dead end.
3. Retry no longer duplicates data — before, hitting "Retry" after a failure re-ran the entire submission, creating a second Airtable record and re-uploading files that had already succeeded. Now the server accepts a recordId + list of already-uploaded files from the client and resumes instead of restarting.

app/page.tsx 4. Image compression before upload (the actual fix for your 413 error) — phone-camera photos for the ID/void-cheque/speed-test uploads were pushing the request past Vercel's function payload limit, causing 413 FUNCTION_PAYLOAD_TOO_LARGE. Images are now downscaled (≤1800px) and re-encoded as JPEG in the browser, stepping down quality until they're under ~1.5MB each, before they're ever sent. 5. Client tracks resume state (recordId / uploadedKeys) so a retry sends only what's missing, working with the server-side resume logic above. 6. Better error handling on the client — a 413 now shows a specific "your file is too large" message instead of failing to parse the response as JSON and showing something confusing; and progress from a partial failure is remembered for the retry.

Net effect: the confirmed root cause (oversized uploads → 413) is addressed, plus two related bugs (leaking raw API errors, duplicate-record risk on retry) that surfaced while investigating. As noted, this already auto-deployed to main/production via whatever auto-commit process is running in this environment — still unverified against a real live submission.
