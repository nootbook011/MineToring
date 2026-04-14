# MineToring - Roadmap

This document outlines the development path for the **MineToring** framework. Our goal is to provide the most stable, extensible, and high-performance packet-based client for Minecraft Bedrock.

---

## Next Version Plans (v1.0)

### 1. Advanced World Interaction
* [ ] **Entity Tracking System**: Efficient real-time tracking and metadata storage for mobs and players.
* [ ] **High-level Actions API**: Expand the Actions module with new actions and add an EventEmitter to listen for high-level events (health, respawn, chat).
* [ ] **Stable Public API**: Finalize the structure of `Core` and `Main` classes to ensure long-term compatibility.

### 2. Technical Code Support & Maintenance
* [ ] **Full Documentation**: Comprehensive API reference manual in English and Russian.
* [ ] **New Tests**: Increase automated test coverage.
* [ ] **Examples**: A dedicated directory for code examples.

---

## Future Goals (Post-v1.0)

### Physics and Navigation
* **Physics Engine**: Development of a native collision engine for Bedrock block geometry.
* **Movement Logic**: Implement a basic system for bot movement within the world.
* **Advanced Pathfinding**: Integration of the A* algorithm or similar solutions, fully integrated with the physics engine.

### Low-level Optimizations
* **Custom Payload Decoder**: A lightweight engine for high-speed decoding of chunk and sub-chunk data.
* **Protocol Coverage Expansion**: Rapid updates and support for the latest versions of the Bedrock protocol.

---

## Contributing
We are looking for contributors! If you have experience with Minecraft physics, pathfinding, or low-level protocol optimization, feel free to open an **Issue** or submit a **Pull Request**.