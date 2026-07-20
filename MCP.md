# MCP Servers

Some parts of this content system connect to external services through MCP (Model Context Protocol) servers. MCP servers give Claude direct access to a service's tools, so a skill can hand work to that service without you leaving the conversation.

This page documents the servers that pair with these skills.

## OpusClip

OpusClip turns long-form video into short, captioned, vertical clips. Its MCP server exposes those tools to Claude, so the video side of this system can run end to end: script with `reels-scripting`, record, then clip, caption, reframe and schedule through OpusClip in the same chat.

The server is hosted and speaks streamable HTTP. There are two endpoints, one per auth method:

| Endpoint | Auth | Use when |
|---|---|---|
| `https://mcp.opus.pro/mcp` | OAuth (browser sign-in) | Interactive clients: Claude web and desktop, Claude Code on your machine, Cursor |
| `https://api.opus.pro/api/mcp` | API key (`Authorization: Bearer`) | Headless or remote environments where a browser sign-in flow is not possible |

Your OpusClip plan and credits carry through on both. The OAuth endpoint is the canonical one. OpusClip's own npm launcher points at it, and their docs treat it as the default. The API key endpoint sits on the REST API base and follows the auth scheme in [OpusClip's agent setup docs](https://help.opus.pro/api-reference/agent-setup). Confirm it against your dashboard before wiring it into automation.

### Setup with OAuth

**Claude Code**

```bash
claude mcp add --transport http opusclip https://mcp.opus.pro/mcp
```

Then run `/mcp` in Claude Code and complete the OAuth sign-in when prompted.

**Claude (web and desktop)**

Settings, then Connectors, then Add custom connector. Paste `https://mcp.opus.pro/mcp` and sign in with your OpusClip account.

**Cursor and other MCP clients**

Add the same URL as a remote HTTP MCP server in your client's MCP settings:

```json
{
  "mcpServers": {
    "opusclip": {
      "url": "https://mcp.opus.pro/mcp"
    }
  }
}
```

**Stdio-only clients (npx launcher)**

Some clients cannot connect to remote HTTP servers directly. OpusClip publishes an npm launcher, [`@opusclip/mcp`](https://www.npmjs.com/package/@opusclip/mcp), that bridges stdio to the hosted server:

```json
{
  "mcpServers": {
    "opusclip": {
      "command": "npx",
      "args": ["-y", "@opusclip/mcp"]
    }
  }
}
```

On the first tool call, a browser window opens to sign in and approve access. Same OAuth flow, same account, same credits. Needs Node.js 18+.

### Setup with an API key

For CI, servers, or any client that cannot open a browser. Create a key in the OpusClip dashboard under API Access, then export it in the shell that launches your agent:

```bash
export OPUSCLIP_API_KEY=your_key
claude mcp add --transport http opusclip https://api.opus.pro/api/mcp \
  --header "Authorization: Bearer ${OPUSCLIP_API_KEY}"
```

Never paste the key into chat. Chat content can end up in transcripts and logs. Set it as an environment variable like the other keys in this repo's [prerequisites](README.md#prerequisites).

### Key tools

The connector exposes 28 tools, all prefixed `opusclip_`. These are the ones this system leans on:

| Tool | What it does |
|---|---|
| `opusclip_submit_project` | Submit a video for AI clipping. OpusClip finds and scores the best moments |
| `opusclip_create_upload_link` | Get an upload link for a local video file |
| `opusclip_list_clips` / `opusclip_describe_clip` | Browse and inspect the generated clips |
| `opusclip_apply_editing_script` | Edit a clip: trim, reframe, layout, captions |
| `opusclip_get_transcript` | Pull the transcript |
| `opusclip_create_thumbnail_job` | Generate thumbnail options for a clip |
| `opusclip_create_social_copy_job` | Generate titles, descriptions and hashtags per platform |
| `opusclip_export_clip` | Export a finished clip |
| `opusclip_schedule_publish` | Schedule a clip to connected social accounts |
| `opusclip_get_usage` | Check remaining credits before a batch run |

The rest cover collections (`create_collection`, `add_clip_to_collection`, `export_collection`), publishing (`list_social_accounts`, `create_post_task`, `unschedule_publish`), brand templates, censoring, sharing and account info (`whoami`).

### Where it fits in this system

```
newsletter → reels-scripting → record long-form
                                    │
                                    ▼
                             OpusClip MCP
      submit_project → apply_editing_script → export_clip → schedule_publish
                                    │
                                    ▼
                    Reels, Shorts, TikTok, LinkedIn video
```

- `reels-scripting` writes the script and caption. OpusClip handles the edit and distribution after you record.
- Longer recordings (YouTube videos, webinars, podcast episodes) go straight to `opusclip_submit_project` to mine scored shorts without a new script.
- `opusclip_schedule_publish` replaces manual uploading. The caption and comment trigger from `reels-scripting` paste straight into the scheduled post, and `opusclip_create_social_copy_job` drafts platform variants.

### Notes

- **Plan requirement**: MCP and API access needs the Pro, Max or Enterprise plan. On the free plan the connector signs in and lists tools, but every call except `whoami` returns an upgrade error. After upgrading, reconnect the connector to refresh the tool list.
- Clipping spends credits, roughly 1 credit per minute of source video. Check headroom with `opusclip_get_usage` before batch runs.
- The connector is locked to the organisation picked at connect time. To switch orgs, disconnect and reconnect.
- The server works on a hosted video URL or an OpusClip project. For local files, get a link with `opusclip_create_upload_link` first.
- The API key endpoint sits on the same base as OpusClip's REST API (`https://api.opus.pro/api`). One key covers both.
- The server is listed in the official MCP Registry as `io.github.opus-pro/opusclip`.
- Official docs: [opus.pro/mcp](https://www.opus.pro/mcp) and [help.opus.pro/api-reference/agent-setup](https://help.opus.pro/api-reference/agent-setup).
