# Quacklyzer

This is a tool to analyze Kong's declarative configuration files (YAML).

## Features

- Upload and parse Kong's declarative configuration YAML files.
- Count the number of Services, Routes, and Consumers.
- List all the Plugins used in the configuration.
- Visualize the relationships between Services, Routes, and Plugins.
- Visualize the differences in decK files.

## Getting Started

First, run the development server using Docker Compose:

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
