# Client Sessions in Minecraft Bedrock

**Sessions** are a collection of data that allows a player (or bot) to re-authorize on a server while preserving progress, location, and inventory.

> **Example:** A bot leaves the game and re-enters just like a regular player — appearing in the same spot with all items in their inventory.

---

## Session Data Composition

Data is divided into critical identification fields and auxiliary information.

### Mandatory Data
*These fields are decisive for linking data to a specific player.*

* `uuid` — Unique client identifier on the server.
* `selfSignedId` — Unique digital signature of the client.

### Optional Data
*Can be used by anti-cheats or proxy servers to verify device "authenticity".*

* `pfid` — Added in newer versions. Does not affect game data: the player authorizes successfully even if this field is modified or missing.
* `deviceId` — Device ID. Similar to `pfid`, it plays a secondary role.

---

## Lifecycle and Application

### Where is the data transmitted?
The authorization process takes place inside the **Login Packet**, where all main identifiers (`uuid`, `selfSignedId`, etc.) are transmitted.

### Practical Usage
Within the **CustomPClient** class of the **MineToring** library, sessions are used for local storage of bot data. This allows the system to "remember" the client state and restore it upon restart without creating a new player profile on the server.