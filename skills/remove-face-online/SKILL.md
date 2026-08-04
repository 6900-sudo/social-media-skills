---
name: remove-face-online
description: >
  Remove or minimise your face and personal photos across the web. Produces a removal map, ready-to-send takedown request templates (privacy, GDPR Article 17, CCPA), a search de-indexing plan, a data broker opt-out list, and ongoing protection settings. Writes a tracker file so you can chase each request. Use this skill whenever the user says "remove my face online", "take my photo down", "get me off Google image search", "delete my pictures from a website", "right to be forgotten", "someone posted my photo", "opt out of a people-search site", or wants help scrubbing their image from the internet. Also trigger when the user uploads a photo of themselves and asks to get it removed from search or a specific site.
---

# Remove Face Online

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain what you will produce. Start input gathering immediately.

If the user has described a non-consensual intimate image, doxxing, stalking, or harassment, jump to the Safety fast-track section first, then return to Step 1.

## Step 1. Gather inputs

Call AskUserQuestion in one batch.

```json
[
  {
    "question": "What do you want removed?",
    "header": "Scope",
    "multiSelect": false,
    "options": [
      {"label": "One specific photo", "description": "A single image on a page you can link me to"},
      {"label": "All photos of me", "description": "Every photo of my face you can find across the web"},
      {"label": "A search result", "description": "My face showing up in Google image or web search"},
      {"label": "A people-search listing", "description": "A data broker or people-search site with my details"}
    ]
  },
  {
    "question": "Who controls the page hosting it?",
    "header": "Control",
    "multiSelect": false,
    "options": [
      {"label": "I do", "description": "My own account, profile, or website"},
      {"label": "Someone else", "description": "A third party posted it or runs the site"},
      {"label": "A data broker", "description": "A people-search or profile-aggregator site"},
      {"label": "Not sure", "description": "Help me work out who to contact"}
    ]
  },
  {
    "question": "Which region are you in? (sets which laws you can use)",
    "header": "Region",
    "multiSelect": false,
    "options": [
      {"label": "UK", "description": "UK GDPR and Data Protection Act 2018"},
      {"label": "EU / EEA", "description": "EU GDPR, right to be forgotten"},
      {"label": "California / US", "description": "CCPA / CPRA and state privacy laws"},
      {"label": "Elsewhere", "description": "I will rely on platform policy and direct requests"}
    ]
  },
  {
    "question": "How urgent is this?",
    "header": "Urgency",
    "multiSelect": false,
    "options": [
      {"label": "Routine cleanup", "description": "Old photos I would rather were not there"},
      {"label": "Actively harmful", "description": "Harassment, doxxing, or an intimate image shared without consent"}
    ]
  }
]
```

If the user picked "Actively harmful", go to the Safety fast-track section before continuing.

Then ask them to paste the URLs, or the search terms that surface the images, so you can build the map. Wait for all inputs before proceeding.

## Step 2. Build the removal map

Sort every location the user gives you into one of four buckets. Output as a table.

| # | Where it appears | Bucket | Route to use |
|---|---|---|---|
| 1 | [URL or platform] | Owned / Third-party / Search index / Data broker | [Step below] |

Rules for sorting:
- Owned account or site: Step 3
- Third-party site someone else runs: Step 4
- Google or Bing search result: Step 5
- People-search or profile aggregator: Step 6

Every removal needs both the original source removed (Steps 3, 4, 6) and the search cache cleared (Step 5). Removing a page does not clear the search snapshot on its own.

## Step 3. Owned accounts: settings walkthrough

For anything the user controls, the fastest fix is to delete or lock it down at source. Give the exact path per platform.

- Facebook / Instagram: delete the post or photo. Set profile and photo visibility to Friends or Private. Turn on tag review so nothing new appears without approval.
- TikTok: delete the video. Set the account to Private. Turn off "Suggest your account to others".
- YouTube: set the video to Private or Unlisted, or delete it. Remove your face from the channel banner and avatar.
- LinkedIn: remove the photo. Under Visibility, turn off public profile visibility and turn off search engine indexing of your profile.
- X: delete the post. Under Privacy, turn on "Protect your posts" and turn off photo tagging.
- GitHub and portfolio sites: delete or replace the image file. If it is your own site, also do Step 5 and the noindex step in Step 7.

Confirm each one is done before ticking it off in the tracker.

## Step 4. Third-party sites: takedown request templates

For a page someone else runs, send a removal request. Find the contact first: a privacy or contact email on the site, the abuse address for the host, or the domain registrant via a WHOIS lookup. If the region is UK or EU, look for a Data Protection Officer (DPO) address, which usually gets the fastest response.

Pick the template that matches the user's region. Fill in the bracketed fields from their inputs. Output each in its own code block.

### Template A: General privacy removal

```
Subject: Request to remove my photograph

Hello,

I am writing to ask you to remove a photograph of me from your website.

Page: [URL]
Image: [description or direct image URL]

I did not consent to this image being published and I would like it taken down. Please confirm once it has been removed.

Thank you,
[Name]
[Contact email]
```

### Template B: UK / EU erasure (GDPR Article 17)

```
Subject: Erasure request under Article 17 UK GDPR

Hello,

I am the data subject in the image below and I am exercising my right to erasure under Article 17 of the UK GDPR.

Page: [URL]
Image: [description or direct image URL]

Please erase this personal data. If you believe you have a lawful basis to keep it, please tell me what that basis is. Under Article 12 you must respond within one month.

Regards,
[Name]
[Contact email]
```

For EU, swap "UK GDPR" for "GDPR (Regulation 2016/679)".

### Template C: California / US removal (CCPA)

```
Subject: Request to delete my personal information

Hello,

Under the California Consumer Privacy Act, I request that you delete my personal information, including the photograph of me on the page below.

Page: [URL]
Image: [description or direct image URL]

Please confirm deletion and tell me if you have shared this image with any third parties.

Regards,
[Name]
[Contact email]
```

If a site ignores a GDPR request after a month, the user can escalate to their data protection regulator (the ICO in the UK). Note that in the output but do not draft the complaint unless asked.

## Step 5. Search engine de-indexing

Removing the page is only half the job. Clear the search index too.

- Google: use the Results about you tool and the Refresh Outdated Content tool at google.com/webmasters/tools/removals. Submit each image and page URL. If the page is gone, "outdated content" clears the cached snapshot within hours to days.
- Google personal info removal: for pages showing contact details, ID numbers, or explicit imagery, use Google's "remove personal information" request, which has a dedicated fast path for non-consensual intimate imagery.
- Bing: use the Bing Content Removal Tool for the same URLs.

List every URL to submit in the tracker so none are missed.

## Step 6. Data broker and people-search opt-outs

For people-search sites, each one has its own opt-out. Identify which sites list the user, then walk the opt-out per site. Common ones to check: search the user's name plus town on Google and note any profile-aggregator domains that appear.

For each broker found, output:
- Site name
- Opt-out URL
- What they will ask for (usually the listing URL and an email to confirm)

Tell the user these often relist after a few months, so the tracker should include a recheck date 90 days out.

## Step 7. Ongoing protection

Once the current images are handled, lock the door.

- If it is your own site: add the page to robots.txt to block crawlers, and add a `<meta name="robots" content="noindex">` tag to any page you control but cannot delete.
- Social settings: private accounts, tag review on, and turn off "suggest my profile" everywhere.
- Face match monitoring: set a Google Alert for your name. Run a reverse image search on your main photo every few months.
- New photos: ask friends and event pages not to tag you, and check the privacy setting before anyone posts.

## Step 8. Write the tracker

Write a file named `face-removal-tracker.md` in the project root. This is the working list the user chases. Use this format:

```markdown
# Face removal tracker

Updated: [date]

| # | Location | Bucket | Action | Status | Sent | Follow-up |
|---|---|---|---|---|---|---|
| 1 | [URL] | Third-party | GDPR erasure email | Sent | 2026-08-04 | 2026-09-04 |
| 2 | [URL] | Search index | Google outdated content | To do | | |
```

Status values: To do, Sent, Removed, Relisted. Set the follow-up date one month out for GDPR requests and 90 days for data broker opt-outs. Tell the user to update the file as replies come in.

## Safety fast-track

If the user reports an intimate image shared without consent, doxxing, stalking, or harassment, lead with these before the general steps. Be calm and direct. Do not lecture.

- Intimate images: StopNCII.org creates a hash of the image so partner platforms block it without the user uploading the image itself. For under-18s, use Take It Down (NCMEC). In the UK, the Revenge Porn Helpline can act on the user's behalf.
- Report inside the platform first: every major platform has a non-consensual intimate imagery report path that is faster than a generic takedown.
- Doxxing or threats: keep evidence (screenshots with URLs and dates) before anything is removed, in case it is needed for a report to the police or the platform.
- If the user is in immediate danger, tell them to contact their local emergency number.

Then return to Step 1 for the wider cleanup.

## Rules

- Only ever help the user remove images of themselves, or images they are lawfully entitled to have removed. If a request is about someone else, stop and ask for the relationship and lawful basis first.
- Never add the user's photos to this or any repository, or upload them to any third-party service. The goal is fewer copies online, not more.
- Always pair a source removal (Steps 3, 4, 6) with a search de-index (Step 5). One without the other leaves the image findable.
- Always write `face-removal-tracker.md` to the project root and state the filename to the user.
- Fill every bracketed field in a template before showing it. Never output a template with placeholders left in.
- Set realistic expectations: platform removals are usually quick, third-party sites take 7 to 14 days, GDPR erasure has a one-month legal deadline, and data brokers often relist.
- British English throughout. Short sentences. No em dashes. No semicolons.
- Do not offer legal advice beyond pointing at the right law and regulator. Suggest a solicitor for anything contested.
