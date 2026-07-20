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

Your OpusClip plan and credits carry through on both.

### Setup with OAuth

**Claude Code**

```bash
claude mcp add --transport http opusclip https://mcp.opus.pro/mcp
```

Then run `/mcp` in Claude Code and complete the OAuth sign-in when prompted.

**Claude (web and desktop)**

Settings, then Connectors, then Add custom connector. Paste `https://mcp.opus.pro/mcp` and sign in with your OpusClip account.

**Cursor and other MCP clients**

Add the same URL as a remote HTTP MCP server in your client's MCP settings.

### Setup with an API key

For CI, servers, or any client that cannot open a browser. Create a key in the OpusClip dashboard under API Access, then export it in the shell that launches your agent:

```bash
export OPUSCLIP_API_KEY=your_key
claude mcp add --transport http opusclip https://api.opus.pro/api/mcp \
  --header "Authorization: Bearer ${OPUSCLIP_API_KEY}"
```

Never paste the key into chat. Chat content can end up in transcripts and logs. Set it as an environment variable like the other keys in this repo's [prerequisites](README.md#prerequisites).

### Key tools

The connector exposes a large tool set. These are the ones this system leans on:

| Tool | What it does |
|---|---|
| `clip` | Cut highlight clips from a long video |
| `find_viral_moments` | Score moments in a video for clip potential |
| `caption` | Add animated subtitles |
| `reframe` | Convert aspect ratio with subject tracking (16:9 to 9:16) |
| `repurpose` | Re-edit a clip natively for a target platform |
| `schedule_post` | Queue a finished clip to social accounts |

### Where it fits in this system

```
newsletter → reels-scripting → record long-form
                                    │
                                    ▼
                          OpusClip MCP
                clip → caption → reframe → schedule_post
                                    │
                                    ▼
                    Reels, Shorts, TikTok, LinkedIn video
```

- `reels-scripting` writes the script and caption. OpusClip handles the edit and distribution after you record.
- Longer recordings (YouTube videos, webinars, podcast episodes) go straight to `clip` and `find_viral_moments` to mine shorts without a new script.
- `schedule_post` replaces manual uploading. The caption and comment trigger from `reels-scripting` paste straight into the scheduled post.

### Notes

- Clipping and exporting spend OpusClip credits from your connected account. Check your plan before batch runs.
- The server needs a hosted video URL or an OpusClip project to work on. Upload or import your recording to OpusClip first if it only exists locally.
- The API key endpoint sits on the same base as OpusClip's REST API (`https://api.opus.pro/api`). One key covers both.
- Official docs: [opus.pro/mcp](https://www.opus.pro/mcp) and [help.opus.pro/api-reference/agent-setup](https://help.opus.pro/api-reference/agent-setup).
