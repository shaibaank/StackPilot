
---

## Socket Events

| Event               | Direction       | Description                           |
|---------------------|-----------------|---------------------------------------|
| `terminal:init`     | client → server | Start terminal session                |
| `terminal:write`    | client → server | Send keystrokes to PTY                |
| `terminal:resize`   | client → server | Sync terminal size                    |
| `terminal:data`     | server → client | PTY output to browser                 |
| `ports:update`      | server → client | Fresh port mappings                   |
| `filetree:update`   | server → client | File tree refresh on workspace change |
| `agent:run-command` | server → client | Agent pipes commands to terminal      |

---

## Supported Languages

| Language   | Docker Image  |
|------------|---------------|
| JavaScript | node:alpine   |
| TypeScript | node:alpine   |
| Python     | python:alpine |
| Go         | golang:alpine |
| Rust       | rust:slim     |

---

## Known Limitations

- Port mappings only refresh for newly created containers — delete and recreate to update
- APEX chat history is session-only, not persisted to DB yet
- Large workspaces may exceed the 8000 char context window sent to APEX
- Windows Docker uses `//./pipe/docker_engine` as the socket path
