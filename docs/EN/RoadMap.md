# MineToring - Roadmap

This document outlines the development path for the **MineToring** framework. Our goal is to provide the most stable, extensible, and high-performance packet-based client for Minecraft Bedrock.

---

## Phase 1: Core Stability (Current: v0.6)
Focusing on the architectural foundation and reliable data handling.

* [x] **Zero Data Loss Engine**: Refactored `SubChunks` and `Blobs` systems to eliminate data loss during world loading.
* [x] **Client Simulation**: Implemented `simulateChunksLoading` to mimic real client behavior and chunk wait-times.
* [x] **Plugin & Adapter System**: Modular architecture allowing custom network processors and logic extensions.

---

## Phase 2: Toward Production Ready (v1.0)
Bridging the gap between a "data engine" and a "functional bot".

### 1. Advanced World Interaction
* [ ] **Entity Tracking System**: Efficient real-time tracking and metadata storage for mobs and players.
* [ ] **High-Level Inventory API**: Abstracted interface for window management, container interactions, and crafting.
* [ ] **Stable Public API**: Finalizing the `Core` and `Main` class structures to ensure long-term compatibility.

### 2. Intelligent Automation
* [ ] **Enhanced Event System**: Granular events for world changes, entity actions, and server-side requests.
* [ ] **Full Documentation**: Comprehensive API reference in both English and Russian.

---

## Phase 3: Future Horizons (Post-v1.0)
Complex systems for high-level automation.

### Physics & Navigation
* **Physics Engine**: Developing a native collision engine for Bedrock block geometry.
* **Movement system**: Make a system for basic bot movement in the world.
* **Advanced Pathfinding**: Implementation of A* or similar algorithms integrated with the physics engine.

### Low-Level Optimizations
* **Custom Payload Decoder**: A lightweight engine for high-speed decoding of sub-chunk and chunk data.
* **Extended Protocol Reach**: Maintaining and expanding support for the latest Bedrock protocol versions.

---

## Contributing
We are looking for contributors! If you have experience with Minecraft physics, pathfinding, or low-level protocol optimization, feel free to open an **Issue** or submit a **Pull Request**.