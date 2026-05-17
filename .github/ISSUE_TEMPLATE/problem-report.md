---
name: Problem report
about: Error, bug, or other problem with the framework.
title: ''
labels: bug
assignees: ''

---

# Technical info

## Context
What exactly is the problem with?
> To select the desired option, insert the "x" inside the square brackets: [x]

- [ ] **Bot**: Problem with using bot classes. (*not recognize server version, bot status error, client session is not saved, botOptions are lost..*)
- [ ] **Protocol**: Problem with Bedrock Protocol packets or their handling. (*Incorrect packet structure, incorrectly decoded payload data buffer..*)
- [ ] **World/Server**: Problem with storage architecture of world/server classes and all its components. (*Chunks, subChunks, entities, dimensions, biomes, blocks..*)
- [ ] **Other**: Tell us about the problem environment below.

## Versions
list of versions used at the time of problem occurrence.
If service was not in use, just leave the field blank.

- **MineToring framework**: `0.7.0`
- **NodeJS**: `24.11.0`
- **BedrockProtocol**: `1.21`
- **Target Server / BedrockBot / BedrockWorld**: `1.21.50`

---

# Problem
Detailed text description of error or bug.

## How to reproduce
Steps that are needed to reproduce the problem with code examples.

```javascript
import { BedrockProblem } from 'minetoring'

const problem = new BedrockProblem()
await problem.init() // There throws error
```

## Logs
Logs of errors or any other problems that are displayed in the console.
> (or just delete this field if there no logs)

```bash
Error: some error
    at BedrockClass (file://path/to/BedrockClass.js)
```
