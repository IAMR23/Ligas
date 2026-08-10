import assert from "node:assert/strict";
import test from "node:test";
import { generateRoundRobinRounds } from "./fixture.generator.js";

function flatten(rounds) {
  return rounds.flatMap((round) => round);
}

function assertRoundRobin(teamCount, roundTrip) {
  const teams = Array.from({ length: teamCount }, (_, index) => `team-${index + 1}`);
  const rounds = generateRoundRobinRounds(teams, { roundTrip });
  const matches = flatten(rounds);
  const expectedMatches = roundTrip ? teamCount * (teamCount - 1) : (teamCount * (teamCount - 1)) / 2;
  const pairCounts = new Map();

  assert.equal(matches.length, expectedMatches);

  for (const match of matches) {
    assert.notEqual(match.homeTeamId, match.awayTeamId);
    assert.ok(teams.includes(match.homeTeamId));
    assert.ok(teams.includes(match.awayTeamId));

    const key = [match.homeTeamId, match.awayTeamId].sort().join(":");
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  }

  for (let leftIndex = 0; leftIndex < teams.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < teams.length; rightIndex += 1) {
      const left = teams[leftIndex];
      const right = teams[rightIndex];
      assert.equal(pairCounts.get([left, right].sort().join(":")), roundTrip ? 2 : 1);
    }
  }
}

test("fixture round-robin para 4 equipos solo ida", () => {
  assertRoundRobin(4, false);
});

test("fixture round-robin para 5 equipos solo ida con descanso", () => {
  assertRoundRobin(5, false);
});

test("fixture round-robin para 10 equipos solo ida", () => {
  assertRoundRobin(10, false);
});

test("fixture round-robin para 4, 5 y 10 equipos ida y vuelta", () => {
  assertRoundRobin(4, true);
  assertRoundRobin(5, true);
  assertRoundRobin(10, true);
});
