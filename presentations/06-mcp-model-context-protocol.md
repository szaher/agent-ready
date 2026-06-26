---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'MCP — Model Context Protocol'
paginate: true
---

<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: { primaryColor: "#e0f0ff", primaryTextColor: "#151515", primaryBorderColor: "#0066cc", lineColor: "#0066cc", secondaryColor: "#daf2f2", tertiaryColor: "#f2f2f2", noteBkgColor: "#fef0f0", noteTextColor: "#151515", fontFamily: "Red Hat Text, sans-serif" }});
</script>

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# MCP — Model Context Protocol

## The Universal Connector for AI Agents

Agent Ready Academy | Module 6

<!-- Speaker note: This module covers the Model Context Protocol, which is rapidly becoming the standard way to connect AI agents to external tools and data sources. -->

---

# Agenda

- The integration problem MCP solves
- MCP architecture and transport layers
- The three primitives: tools, resources, prompts
- Configuring existing MCP servers
- Building your own MCP server
- Production deployment and security
- Hands-on exercise and next steps

<!-- Speaker note: We will move from concepts to code. By the end, participants will understand how to both consume and build MCP servers. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## What Is MCP?

The USB-C moment for AI integrations.

<!-- Speaker note: Start with the problem before introducing the solution. Ask the audience how many integrations they have had to build for LLM applications. -->

---

# The M x N Problem

Every AI application needs to connect to external systems -- databases, APIs, file systems, SaaS tools. Without a standard, you get **M models x N integrations** = a combinatorial explosion.

<div class="mermaid">
graph LR
    subgraph Models["AI Models"]
        M1[Claude]
        M2[GPT]
        M3[Gemini]
    end
    subgraph Integrations["Integrations"]
        I1[GitHub]
        I2[Jira]
        I3[Database]
        I4[Slack]
    end
    M1 --- I1
    M1 --- I2
    M1 --- I3
    M1 --- I4
    M2 --- I1
    M2 --- I2
    M2 --- I3
    M2 --- I4
    M3 --- I1
    M3 --- I2
    M3 --- I3
    M3 --- I4
    style Models fill:#fef0f0,stroke:#cc0000
    style Integrations fill:#ebf8ff,stroke:#3182ce
</div>

**12 custom connectors** -- and every new model or tool adds an entire row or column.

<!-- Speaker note: Draw the analogy: before USB-C, every phone had a different charger. MCP is the universal port for AI. -->

---

# MCP: One Protocol to Connect Them All

**Model Context Protocol (MCP)** is an open standard that provides a single, consistent interface between AI applications and external data sources or tools.

- **Open standard** -- created by Anthropic, adopted across the ecosystem
- **JSON-RPC 2.0** -- familiar, language-agnostic wire format
- **Bidirectional** -- server can send notifications, not just respond
- **Composable** -- connect multiple servers to one host simultaneously

> Think of MCP as the USB-C of AI: one protocol, any tool, any model.

<div class="callout">

**Key insight:** MCP turns M x N integrations into M + N adapters. Each model implements one client; each tool implements one server.

</div>

<!-- Speaker note: Emphasize that MCP is not proprietary -- it is an open spec that any model provider or tool builder can implement. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## MCP Architecture

Hosts, clients, servers, and transports.

<!-- Speaker note: Now we peel back the layers. Understanding the architecture is essential before writing any code. -->

---

# Architecture Overview

<div class="mermaid">
graph LR
    subgraph Host["Host Application"]
        H[Claude Desktop / IDE / Agent]
        C1[MCP Client 1]
        C2[MCP Client 2]
        H --- C1
        H --- C2
    end
    C1 -->|"JSON-RPC (stdio)"| S1[MCP Server: GitHub]
    C2 -->|"JSON-RPC (SSE)"| S2[MCP Server: Database]
    S1 --> G[(GitHub API)]
    S2 --> D[(PostgreSQL)]
    style Host fill:#ebf8ff,stroke:#3182ce
</div>

**Three roles in every MCP deployment:**

- **Host** -- the AI application the user interacts with (Claude Desktop, an IDE, your agent)
- **Client** -- lives inside the host; maintains a 1:1 session with one server
- **Server** -- exposes tools, resources, or prompts over the MCP protocol

<!-- Speaker note: A single host can run many clients in parallel -- one per MCP server. Each client-server pair is an independent session. -->

---

# Transport Layers

MCP supports two transport mechanisms. Choose based on your deployment model.

| Aspect          | stdio                                    | HTTP + SSE                             |
|-----------------|------------------------------------------|----------------------------------------|
| How it works    | Server runs as a child process           | Server runs as an HTTP endpoint        |
| Connection      | stdin/stdout pipes                       | HTTP POST + Server-Sent Events stream  |
| Best for        | <span class="vs-good">Local tools</span> | <span class="vs-good">Remote / shared servers</span> |
| Latency         | <span class="vs-good">Minimal</span>     | <span class="vs-neutral">Network-dependent</span> |
| Auth support    | <span class="vs-neutral">Implicit (OS-level)</span> | <span class="vs-good">OAuth 2.1 built-in</span> |
| Multi-tenant    | <span class="vs-bad">No</span>           | <span class="vs-good">Yes</span>       |
| Deployment      | Bundled with host                        | Standalone service                     |

*Streamable HTTP is the newer variant that replaces legacy SSE -- it supports both streaming and request-response over a single HTTP endpoint.*

<!-- Speaker note: stdio is simpler for local development. SSE/Streamable HTTP is what you deploy in production when multiple users share the same server. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## The Three Primitives

Tools, resources, and prompts.

<!-- Speaker note: Everything an MCP server can expose falls into one of three categories. Understanding these is the key to designing good servers. -->

---

# Tools, Resources, and Prompts

| Primitive    | What It Is                        | Who Controls It       | Example                              |
|--------------|-----------------------------------|-----------------------|--------------------------------------|
| **Tools**    | Actions the model can invoke      | Model (with approval) | `create_issue`, `run_query`, `send_email` |
| **Resources** | Read-only data the model can access | Application / user   | File contents, DB schemas, API docs  |
| **Prompts**  | Reusable prompt templates         | User-triggered        | "Summarize this PR", "Explain error" |

### How They Interact

- **Tools** let the model *do* things -- call APIs, write files, execute queries
- **Resources** let the model *read* things -- without side effects, like a GET request
- **Prompts** are pre-built templates that combine instructions with dynamic arguments

> Tools are function calls. Resources are context injection. Prompts are workflows.

<!-- Speaker note: The most commonly used primitive is tools. Resources and prompts are powerful but less widely implemented so far. Focus your first MCP server on tools. -->

---

# Protocol Flow: Tool Invocation

A complete tool call follows this sequence:

<div class="mermaid">
sequenceDiagram
    participant User
    participant Host as Host (Claude Desktop)
    participant Client as MCP Client
    participant Server as MCP Server
    participant API as External API

    Host->>Client: initialize session
    Client->>Server: initialize (capabilities)
    Server-->>Client: capabilities response
    Client->>Server: tools/list
    Server-->>Client: tool definitions + schemas
    User->>Host: "Create a GitHub issue for this bug"
    Host->>Client: tool call: create_issue({title, body})
    Client->>Server: tools/call (JSON-RPC)
    Server->>API: POST /repos/.../issues
    API-->>Server: 201 Created
    Server-->>Client: result (issue URL)
    Client-->>Host: display result to user
</div>

<!-- Speaker note: Walk through each arrow. Emphasize the initialize handshake -- it is where capability negotiation happens. The host learns what tools are available before the user ever sends a message. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Using MCP Servers

Plug into the ecosystem of existing servers.

<!-- Speaker note: Before building your own, learn to use what already exists. The MCP ecosystem has hundreds of community servers. -->

---

# Configuring MCP Servers

MCP servers are configured in a JSON file. Here is an example for Claude Desktop:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres",
               "postgresql://user:pass@localhost:5432/mydb"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem",
               "/Users/me/projects"]
    }
  }
}
```

Each entry is a separate MCP server. The host spawns each as a child process using `stdio` transport.

<!-- Speaker note: Show where this file lives -- on macOS it is ~/Library/Application Support/Claude/claude_desktop_config.json. For VS Code, it is in .vscode/mcp.json or settings.json. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## Building an MCP Server

Define tools, handle requests, ship it.

<!-- Speaker note: Now we write code. We will build a minimal MCP server in TypeScript using the official SDK. -->

---

# Building a Server with the TypeScript SDK

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// Define a tool with input validation via Zod
server.tool(
  "get_forecast",
  "Get the weather forecast for a city",
  { city: z.string(), days: z.number().min(1).max(7).default(3) },
  async ({ city, days }) => {
    const data = await fetch(
      `https://api.weather.example/forecast?city=${city}&days=${days}`
    );
    const forecast = await data.json();
    return {
      content: [{ type: "text", text: JSON.stringify(forecast, null, 2) }],
    };
  }
);

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

<!-- Speaker note: Walk through the four pieces: create server, define tool with name + description + schema + handler, create transport, connect. The Zod schema is what the model sees as the tool's input_schema. -->

---

# Anatomy of a Tool Definition

Every MCP tool has four parts that map directly to what the model needs:

| Part            | Purpose                                  | Example                              |
|-----------------|------------------------------------------|--------------------------------------|
| **Name**        | Unique identifier the model calls        | `get_forecast`                       |
| **Description** | Natural language -- helps the model decide *when* to use it | `"Get the weather forecast for a city"` |
| **Input schema** | JSON Schema (via Zod) -- the model knows *what* to pass | `{ city: string, days: number }`     |
| **Handler**     | Your async function -- executes the action and returns results | Calls weather API, returns JSON      |

<div class="callout">

**Tip:** Write descriptions as if you are explaining the tool to a colleague. The model uses this text to decide whether to call the tool, so clarity beats brevity.

</div>

<!-- Speaker note: The most common mistake is a vague description. "Does stuff with weather" will confuse the model. "Get the weather forecast for a city, returning temperature and conditions for the next N days" gives it everything it needs. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 6

## MCP in Production

Security, authentication, and deployment.

<!-- Speaker note: Building an MCP server is easy. Running one safely in production requires thinking about trust boundaries, authentication, and access control. -->

---

# Security and Deployment Checklist

### Authentication and Authorization

- **stdio servers** inherit the host's OS-level permissions -- no extra auth needed
- **HTTP servers** should implement **OAuth 2.1** (MCP's built-in auth spec)
- Always apply the **principle of least privilege** -- expose only the tools users need

### Input Validation

- Validate every input with schemas (Zod, JSON Schema) -- never trust the model's output blindly
- Sanitize inputs that reach databases or shell commands to prevent injection

### Deployment Patterns

- **Local:** Bundle the server binary, spawn via stdio -- simplest option
- **Sidecar:** Run the MCP server in a container next to your app
- **Shared service:** Deploy as an HTTP endpoint behind your API gateway with OAuth

<div class="callout">

**Warning:** An MCP tool is code execution triggered by a model. Treat every tool handler with the same rigor as a public API endpoint.

</div>

<!-- Speaker note: The biggest production risk is prompt injection causing unintended tool calls. Defense in depth: validate inputs, require human approval for destructive actions, log everything. -->

---

# Summary

## What We Covered

- **The problem:** M x N integrations collapse to M + N with a standard protocol
- **Architecture:** Hosts, clients, servers communicating over JSON-RPC via stdio or HTTP
- **Three primitives:** Tools (actions), resources (data), prompts (templates)
- **Using servers:** JSON configuration to connect existing MCP servers
- **Building servers:** TypeScript SDK with Zod schemas for tool definitions
- **Production:** OAuth 2.1 auth, input validation, least-privilege access

## Next Steps

1. Install two MCP servers in Claude Desktop and test them
2. Build a single-tool MCP server using the TypeScript SDK
3. Read the full MCP specification at **modelcontextprotocol.io**
4. Explore the MCP server registry for community-built servers

<!-- Speaker note: Module 6 complete. Encourage participants to start with a simple tool that wraps an API they already use. The best way to learn MCP is to build a server for your own workflow. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Thank you for attending

Agent Ready Academy -- Module 6: MCP

<!-- Speaker note: Open the floor for questions. Common follow-ups: how does MCP compare to OpenAI function calling (MCP is transport + discovery, function calling is just the schema), and whether MCP works with non-Anthropic models (yes, it is an open standard). -->
