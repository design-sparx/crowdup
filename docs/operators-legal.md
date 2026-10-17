# Operator legal checklist

The Terms (`/terms`), Privacy (`/privacy`) and Security (`/security`) pages ship as templates. They describe the product as built: donations only, payments through Stripe Connect direct charges (the platform never holds funds), data stored in Supabase, and no application emails in v1. They are not legal advice. Have a qualified lawyer review them before you accept real donations.

## What to adapt

1. Edit `src/data/legal.ts` and replace each placeholder:
   - `company`: your legal entity name
   - `contactEmail`: a monitored address for legal, privacy and abuse reports
   - `postalAddress`: your registered address
   - `jurisdiction`: governing law and venue
   - `lastUpdated`: the date of your last revision
2. Remove the yellow "Template notice" in `src/components/LegalDocument.tsx` once reviewed.
3. Review the wording in `src/pages/Terms.tsx`, `Privacy.tsx` and `Security.tsx` against your situation, for example:
   - data protection rights and retention periods in your region (GDPR, UK GDPR, CCPA and similar)
   - fundraising, charity, tax and consumer rules that apply to organizers and to you
   - liability limits and minimum age
4. Update `SECURITY.md` and the vulnerability reporting section of `/security` if you use a different reporting channel.
5. If you add features that change data use (analytics, application emails, other processors), update the Privacy page and this list.
