import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { addTreat, CAT_QUIP_POOLS, collectTreat, consumeForVisit, emptyTreatJar, rollCatVisit, settleTreatJar } from "./features";

describe("treat jar", () => {
  it("pays one Chicken Comet spin and resets only that bag at twenty-four", () => {
    let jar = emptyTreatJar();
    for (let i = 0; i < 23; i++) jar = addTreat(jar, "chicken");

    const completed = collectTreat(jar, "chicken");

    expect(completed.jar).toEqual({ chicken: 0, salmon: 0, bougie: 0 });
    expect(completed.freeSpinsAwarded).toBe(1);
  });

  it("awards Salmon Stars and Bougie Bites independently", () => {
    const jar = { chicken: 4, salmon: 23, bougie: 23 };

    const salmon = collectTreat(jar, "salmon");
    const bougie = collectTreat(salmon.jar, "bougie");

    expect(salmon.jar).toEqual({ chicken: 4, salmon: 0, bougie: 23 });
    expect(salmon.freeSpinsAwarded).toBe(2);
    expect(bougie.jar).toEqual({ chicken: 4, salmon: 0, bougie: 0 });
    expect(bougie.freeSpinsAwarded).toBe(3);
  });

  it("keeps collecting after a completed bag resets", () => {
    let jar = emptyTreatJar();
    for (let i = 0; i < 24; i++) jar = addTreat(jar, "bougie");
    for (let i = 0; i < 3; i++) jar = addTreat(jar, "bougie");

    expect(jar.bougie).toBe(3);
  });

  it("settles completed persisted bags independently", () => {
    const settled = settleTreatJar({ chicken: 24, salmon: 25, bougie: 0 });
    expect(settled.jar).toEqual({ chicken: 0, salmon: 1, bougie: 0 });
    expect(settled.completed).toEqual(["chicken", "salmon"]);
    expect(settled.freeSpinsAwarded).toBe(3);
  });
});

describe("rollCatVisit — canon S7", () => {
  it("rotates through distinct Phoebe and Joey vernacular pools", () => {
    const phoebeQuips = new Set<string>();
    const joeyQuips = new Set<string>();
    const jar = { chicken: 1, salmon: 0, bougie: 1 };

    for (let seed = 0; seed < 2000; seed++) {
      const visit = rollCatVisit(mulberry32(seed), jar, 20);
      if (visit?.cat === "phoebe") phoebeQuips.add(visit.quip);
      if (visit?.cat === "joey") joeyQuips.add(visit.quip);
    }

    expect(phoebeQuips.size).toBeGreaterThan(1);
    expect(joeyQuips.size).toBeGreaterThan(1);
    const phoebePool = new Set<string>([...CAT_QUIP_POOLS.phoebe.fed, ...CAT_QUIP_POOLS.phoebe.unfed]);
    const joeyPool = new Set<string>([...CAT_QUIP_POOLS.joey.fed, ...CAT_QUIP_POOLS.joey.unfed]);
    expect([...phoebeQuips].every((quip) => phoebePool.has(quip))).toBe(true);
    expect([...joeyQuips].every((quip) => joeyPool.has(quip))).toBe(true);
  });

  it("never lets Joey assist without Bougie Bites in the jar", () => {
    const jar = { chicken: 5, salmon: 5, bougie: 0 };
    for (let seed = 0; seed < 500; seed++) {
      const visit = rollCatVisit(mulberry32(seed), jar, 20);
      if (visit?.cat === "joey") {
        expect(visit.fed).toBe(false);
      }
    }
  });

  it("lets Phoebe assist with any treat in the jar", () => {
    const jar = { chicken: 1, salmon: 0, bougie: 0 };
    let sawFedPhoebe = false;
    for (let seed = 0; seed < 500; seed++) {
      const visit = rollCatVisit(mulberry32(seed), jar, 20);
      if (visit?.cat === "phoebe" && visit.fed) sawFedPhoebe = true;
    }
    expect(sawFedPhoebe).toBe(true);
  });

  it("consumeForVisit only removes a treat when the cat was fed", () => {
    const jar = { chicken: 1, salmon: 0, bougie: 1 };
    const unfed = consumeForVisit(jar, { cat: "joey", fed: false, quip: "" });
    expect(unfed).toEqual(jar);
    const fed = consumeForVisit(jar, { cat: "joey", fed: true, quip: "" });
    expect(fed.bougie).toBe(0);
  });
});
