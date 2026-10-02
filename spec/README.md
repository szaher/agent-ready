# Agent Ready Specification

The machine-readable contract for agent readiness. The course in `content/` is
the human-facing explanation. This directory is the normative, versioned
definition that tools such as [Agentic Dev](https://github.com/szaher/agentic-dev)
assess repositories against.

```text
spec/
├── v1/                 authored sources for spec major version 1
│   ├── spec.yaml       metadata, vocabularies, pillars, dimensions, includes
│   ├── maturity.yaml   the five maturity levels and their semantics
│   ├── evidence.yaml   the evidence vocabulary rules may reference
│   └── schema.json     JSON Schema for the bundle and each source file
├── tools/              loader, validator, and canonical bundler
└── dist/               generated, canonical JSON bundle (consumed downstream)
```

Validate with `pnpm spec:check` and regenerate the bundle with `pnpm spec:build`.

> Status: model and vocabulary. The initial requirement set, the generated
> bundle, and the full documentation follow in the next change.
