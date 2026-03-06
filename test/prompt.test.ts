import { describe, expect, it } from "bun:test";

import { buildBatchPrompt, buildWatchPrompt } from "../src/prompt";

describe("prompt builders", () => {
  it("keeps compact summary instructions by default", () => {
    const prompt = buildBatchPrompt("summarize the test output", "12 passed");

    expect(prompt).toContain("You compress command output for another paid language model.");
    expect(prompt).toContain("Use the same language as the question.");
    expect(prompt).toContain("Keep the answer extremely short.");
    expect(prompt).not.toContain(
      "Do not summarize, paraphrase, translate, interpret, or compress anything."
    );
  });

  it("switches batch prompts to verbatim instructions when the question forbids summarization", () => {
    const prompt = buildBatchPrompt(
      "reproduza exatamente as linhas 41-60 do README.md, sem resumir",
      "example input"
    );

    expect(prompt).toContain("You relay command output for another paid language model.");
    expect(prompt).toContain(
      "Do not summarize, paraphrase, translate, interpret, or compress anything."
    );
    expect(prompt).toContain(
      "Preserve the original wording, punctuation, spacing, indentation, and line breaks for the requested content."
    );
    expect(prompt).not.toContain("Keep the answer extremely short.");
    expect(prompt).not.toContain("Use the same language as the question.");
  });

  it("switches watch prompts to verbatim instructions when the question forbids summarization", () => {
    const prompt = buildWatchPrompt(
      "show the exact changed lines without summarizing",
      "tests: 12 passed",
      "tests: 11 passed"
    );

    expect(prompt).toContain(
      "Do not summarize, paraphrase, translate, interpret, or compress anything."
    );
    expect(prompt).toContain(
      "Preserve the original wording, punctuation, spacing, indentation, and line breaks for the changed content you return."
    );
    expect(prompt).not.toContain("Keep the answer extremely short.");
    expect(prompt).not.toContain("Use the same language as the question.");
  });
});
