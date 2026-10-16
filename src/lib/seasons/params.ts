import { createHmac } from "node:crypto";

/**
 * Each student gets their own numbers for a challenge (proving-ground spec
 * §6.3): the same student always gets the same values, different students
 * get different ones, and nobody can work out another student's without the
 * server secret. Server only (node:crypto).
 */
export interface ParamSpec {
  name: string;
  min: number;
  max: number;
  step: number;
}

export type Params = Record<string, number>;

function decimalsOf(step: number): number {
  const text = String(step);
  return text.includes(".") ? text.split(".")[1].length : 0;
}

export function deriveParams(
  specs: readonly ParamSpec[],
  seed: { challengeId: string; userId: string },
  secret: string
): Params {
  if (!secret) throw new Error("SEASON_PARAM_SECRET is not set");
  const out: Params = {};
  specs.forEach((spec, i) => {
    const digest = createHmac("sha256", secret)
      .update(`${seed.challengeId}\u0000${seed.userId}\u0000${spec.name}\u0000${i}`)
      .digest();
    const unit = digest.readUInt32BE(0) / 0x1_0000_0000; // [0, 1)
    const steps = Math.floor((spec.max - spec.min) / spec.step + 1e-9);
    const k = Math.min(steps, Math.floor(unit * (steps + 1)));
    out[spec.name] = Number((spec.min + k * spec.step).toFixed(decimalsOf(spec.step)));
  });
  return out;
}
