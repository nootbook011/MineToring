# MineToring - Roadmap

Our goal is to create a stable, extensible, and high-performance Node.js client for **Minecraft Bedrock Edition**.

---

## Next Version Plans (v1.0)

### 1. Advanced World Interaction
* [x] **Entity Tracking System**: Efficient real-time tracking and metadata storage for mobs and players.
* [x] **High-Level Actions API**: Expand the Actions module with new actions and add an EventEmitter to listen for high-level events (respawn, chat).
* [x] **Native Data Decoder**: Built-in, high-performance network data decoder for chunk buffers, sub-chunks, and more, independent of third-party libraries.
* [ ] **Inventory and Items**: High-level API for working with block, entity, and item inventories. Local and network actions with inventory interfaces.
* [ ] **New Events**: New high-level events for mob and player actions within the bot's render distance. For example: `EntityHitEntity`, `EntityHit`, and similar.

### 2. Codebase & Support Maintenance
* [ ] **Multi-Version Refactoring**: Find a working solution to support multiple game versions on the fly.
* [x] **Full Documentation**: Detailed API reference manual in both English and Russian.
* [ ] **New Tests**: Write more automated tests.
* [x] **Examples**: A dedicated directory for code examples.

---

## Future Goals (Post-v1.0)

### Physics & Navigation
* **Physics Engine**: Develop a native engine to process, calculate, and simulate movement physics for players and entities.
* **Walking Mechanics**: Create a base API for movement around the world.
* **Advanced Pathfinding**: Implement the A* algorithm or similar solutions integrated with the physics engine and movement API.

### World Interaction
* **Basic Interaction**: High-level API for basic player input, using right-click and left-click on blocks and items while mimicking official client output.
* **Combat & Mining**: Ability to attack mobs and players, mine, place, and interact with blocks.

### Optimization
* **Protocol Coverage Expansion**: Maintain and promptly update support for new and older Bedrock protocol versions whenever feasible.

---

## Contributing
*We are looking for contributors!* If you have new ideas for the project or simply want to contribute, feel free to open an **Issue** or submit a **Pull Request**.