import assert from "node:assert/strict";
import test from "node:test";
import { getStandingResult } from "../matches/matches.service.js";
import { sortStandingsRows } from "./standings.service.js";

test("getStandingResult respeta puntos configurados del torneo", () => {
  const rules = { pointsWin: 4, pointsDraw: 2, pointsLoss: 1 };

  assert.deepEqual(getStandingResult(3, 1, rules), {
    won: 1,
    drawn: 0,
    lost: 0,
    points: 4,
    goalsFor: 3,
    goalsAgainst: 1
  });
  assert.equal(getStandingResult(2, 2, rules).points, 2);
  assert.equal(getStandingResult(0, 1, rules).points, 1);
});

test("sortStandingsRows ordena por puntos, diferencia y goles a favor", () => {
  const rows = [
    { team: { name: "B" }, points: 4, goalDiff: 1, goalsFor: 5 },
    { team: { name: "A" }, points: 6, goalDiff: 0, goalsFor: 2 },
    { team: { name: "C" }, points: 4, goalDiff: 3, goalsFor: 4 }
  ];

  const sorted = sortStandingsRows(rows, ["GOAL_DIFF", "GOALS_FOR"]);

  assert.deepEqual(
    sorted.map((row) => row.team.name),
    ["A", "C", "B"]
  );
});
