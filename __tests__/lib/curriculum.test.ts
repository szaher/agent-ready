import { describe, expect, it } from "vitest";
import { getCurriculum, getModuleMeta, getLessonPath } from "@/lib/curriculum";

describe("getCurriculum", () => {
  it("returns all modules", async () => {
    const curriculum = await getCurriculum();
    expect(curriculum.modules).toHaveLength(10);
  });

  it("module 1 has 5 lessons", async () => {
    const curriculum = await getCurriculum();
    expect(curriculum.modules[0].lessons).toHaveLength(5);
  });

  it("module IDs are sequential starting at 1", async () => {
    const curriculum = await getCurriculum();
    const ids = curriculum.modules.map((m) => m.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe("getModuleMeta", () => {
  it("returns module by ID", async () => {
    const mod = await getModuleMeta(1);
    expect(mod?.title).toBe("Why Agent-Ready Matters");
  });

  it("returns undefined for invalid ID", async () => {
    const mod = await getModuleMeta(99);
    expect(mod).toBeUndefined();
  });
});

describe("getLessonPath", () => {
  it("returns correct MDX path", () => {
    const p = getLessonPath(1, "01-the-agentic-shift");
    expect(p).toContain("content/module-1/01-the-agentic-shift.mdx");
  });
});
