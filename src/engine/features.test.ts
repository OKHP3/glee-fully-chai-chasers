import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { addTreat, consumeForVisit, emptyTreatJar, rollCatVisit } from "./features";

describe("treat jar", () => {
  it("caps each treat at 12", () => {
    let jar = emptyTreatJar();
    for (let i = 0; i < 20; i++) jar = addTreat(jar, "bougie");
    expect(jar.bougie).toBe(12);
  });
});

describe("rollCatVisit — canon S7", () => {
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
