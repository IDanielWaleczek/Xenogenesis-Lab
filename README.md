# Xenogenesis Lab

> Engineer an alien world, design life for it, and discover what survives.

[Live application](https://www.danielwaleczek.com) · [MIT License](LICENSE)

Xenogenesis Lab is an AI-guided astrobiology simulator set during the first biosphere experiment on the fictional world Vespera. It turns the question “what could live here?” into an interactive scientific experiment.

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

## Explore the experiment

Build a world by changing gravity, temperature, atmosphere, water, radiation, stellar energy, humidity, and magnetic protection. The persistent 3D planet responds with terrain, water and ice, clouds or vapor, atmosphere and radiation.

Design an organism from compatible traits across body structure, physiology, senses, reproduction, and complexity. Every choice has a visible effect on the procedural organism and a scientific tradeoff.

Run a deterministic survival analysis to explore:

- life-support conditions and eleven suitability metrics;
- six representative habitats;
- population change across 200 model years;
- environmental pressure and recovery events;
- survivability, regional refuges, trait tradeoffs, and outcomes.

There is no single correct creature or planet. Different biological strategies can succeed under different environmental conditions.

## Built with Codex and GPT-5.6

Codex with GPT-5.6 accelerated the development of Xenogenesis Lab across the full product: planning the interactive flow, building the TypeScript and React application, implementing the deterministic simulation, creating the custom WebGL shaders, integrating structured AI services, writing tests, reviewing bilingual English/Polish copy, and improving documentation.

GPT-5.6 also has a visible role inside the application as the **Life Sciences Consultant**. After a simulation, it interprets structured evidence, explains risks and tradeoffs, and recommends one focused follow-up experiment. It does not calculate habitability, population, or outcomes: those remain the responsibility of the deterministic simulation engine.

For the optional organism field illustration, GPT-5.6 provides constrained visual direction and `gpt-image-2` produces the image. The visual request is grounded in the engineered planet, selected traits, survivability, and regional context, so it represents the experiment rather than inventing a disconnected creature.

## Technology

- Next.js, React, and TypeScript
- Three.js, React Three Fiber, and custom GLSL shaders
- Zod for validated data contracts
- OpenAI Responses API with GPT-5.6
- OpenAI Image API with `gpt-image-2`
- Vitest and ESLint

## Architecture

```text
Interactive laboratory
├── Planet engineering and lifeform design
├── Deterministic simulation and visual analysis
└── Procedural WebGL world and organism
        │
        ├── World model: validated planetary inputs and derived conditions
        ├── Simulator: viability, traits, regions, population, and outcomes
        └── Server routes: GPT-5.6 consultation and gpt-image-2 illustration
```

The simulation engine owns the calculated world state and survival outcome. The renderer makes that state explorable, while GPT-5.6 explains it and supports a controlled visual interpretation. This separation keeps each experiment reproducible and the role of AI clear.

## Run locally

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable the AI features locally, create a `.env.local` file in the project root and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key
```

The key is used by the server-only AI routes and must not be exposed in client-side code or committed to the repository. The hosted application already has its server configuration in place.

## Available commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Run ESLint
npm test          # Run unit tests
```

## Scientific scope

Xenogenesis Lab is a scientifically inspired educational model, not a complete climate, geology, radiation-transport, ecosystem, genetics, or evolutionary simulation. It uses deterministic, documented model conventions to make coupled planetary and biological tradeoffs easier to explore.

For the full model assumptions and boundaries, see [Science Rules](docs/SCIENCE_RULES.md). For the project story, see [Project Story](docs/projectstory.md).

## Credits
https://youtu.be/p1wtKlqisWs

Background music:
"Titan" by Scott Buckley
Licensed under CC BY 4.0
https://www.scottbuckley.com.au

## License

Released under the [MIT License](LICENSE).
