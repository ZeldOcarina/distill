import { describe, expect, it } from "bun:test";

import {
  DEFAULT_HOST,
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  DEFAULT_TIMEOUT_MS,
  parseCommand,
  resolveRuntimeDefaults,
  UsageError
} from "../src/config";

describe("parseCommand", () => {
  it("parses defaults and joins the question", () => {
    const command = parseCommand(["what", "changed?"], {}, {});

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "what changed?",
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        host: DEFAULT_HOST,
        apiKey: "",
        timeoutMs: DEFAULT_TIMEOUT_MS,
        thinking: false
      }
    });
  });

  it("supports explicit flags", () => {
    const command = parseCommand(
      [
        "--model",
        "mini",
        "--host=http://example.test",
        "--timeout-ms",
        "10",
        "--thinking",
        "true",
        "summarize"
      ],
      {},
      {}
    );

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "summarize",
        provider: "ollama",
        model: "mini",
        host: "http://example.test",
        apiKey: "",
        timeoutMs: 10,
        thinking: true
      }
    });
  });

  it("uses persisted defaults when present", () => {
    const command = parseCommand(
      ["summarize"],
      {},
      {
        model: "saved-model",
        host: "http://saved.test",
        timeoutMs: 50,
        thinking: true
      }
    );

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "summarize",
        provider: "ollama",
        model: "saved-model",
        host: "http://saved.test",
        apiKey: "",
        timeoutMs: 50,
        thinking: true
      }
    });
  });

  it("parses config set commands", () => {
    expect(parseCommand(["config", "model", "qwen3.5:2b"], {}, {})).toEqual({
      kind: "configSet",
      key: "model",
      value: "qwen3.5:2b"
    });

    expect(parseCommand(["config", "thinking", "false"], {}, {})).toEqual({
      kind: "configSet",
      key: "thinking",
      value: false
    });
  });

  it("prefers persisted config over environment variables", () => {
    expect(
      resolveRuntimeDefaults(
        {
          DISTILL_PROVIDER: "openai",
          DISTILL_MODEL: "env-model",
          OPENAI_BASE_URL: "https://env-openai.test",
          OLLAMA_HOST: "http://env-ollama.test",
          OPENAI_API_KEY: "env-key",
          DISTILL_TIMEOUT_MS: "999",
          DISTILL_THINKING: "true"
        },
        {
          provider: "ollama",
          model: "saved-model",
          host: "http://saved.test",
          apiKey: "saved-key",
          timeoutMs: 5,
          thinking: false
        }
      )
    ).toEqual({
      provider: "ollama",
      model: "saved-model",
      host: "http://saved.test",
      apiKey: "saved-key",
      timeoutMs: 5,
      thinking: false
    });
  });

  it("uses environment variables when persisted config is missing", () => {
    expect(
      resolveRuntimeDefaults(
        {
          DISTILL_PROVIDER: "openai",
          DISTILL_MODEL: "env-model",
          OPENAI_BASE_URL: "https://env-openai.test",
          OPENAI_API_KEY: "env-key",
          DISTILL_TIMEOUT_MS: "999",
          DISTILL_THINKING: "true"
        },
        {}
      )
    ).toEqual({
      provider: "openai",
      model: "env-model",
      host: "https://env-openai.test",
      apiKey: "env-key",
      timeoutMs: 999,
      thinking: true
    });
  });

  it("throws on missing question", () => {
    expect(() => parseCommand([], {}, {})).toThrow(UsageError);
  });
});
