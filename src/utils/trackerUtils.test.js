import { describe, expect, it } from "vitest";
import { dueSoon, groupByStatus, withReminders } from "./trackerUtils";

const app = (id, fields) => ({ id, status: "saved", deadline: "", reminder: "", ...fields });

describe("groupByStatus", () => {
  it("returns one column per status, in pipeline order", () => {
    const columns = groupByStatus([app("a", { status: "interviewing" }), app("b")]);
    expect(columns.map((c) => c.status)).toEqual([
      "saved",
      "applied",
      "interviewing",
      "offer",
      "rejected",
    ]);
    expect(columns[0].applications.map((a) => a.id)).toEqual(["b"]);
    expect(columns[2].applications.map((a) => a.id)).toEqual(["a"]);
  });
});

describe("withReminders", () => {
  it("keeps applications with a deadline or a reminder", () => {
    const apps = [app("a", { deadline: "2026-10-01" }), app("b", { reminder: "Ping" }), app("c")];
    expect(withReminders(apps).map((a) => a.id)).toEqual(["a", "b"]);
  });
});

describe("dueSoon", () => {
  it("flags open applications due within 3 days", () => {
    const days = { "2026-10-01": 1, "2026-10-10": 10, "2026-09-01": -5 };
    const apps = [
      app("soon", { deadline: "2026-10-01" }),
      app("later", { deadline: "2026-10-10" }),
      app("past", { deadline: "2026-09-01" }),
      app("done", { deadline: "2026-10-01", status: "offer" }),
    ];
    expect(dueSoon(apps, (d) => days[d]).map((a) => a.id)).toEqual(["soon"]);
  });
});
