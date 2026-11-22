/** Rules for a submitted explanation. Shared by the submit route and the attempt workspace so the two can't drift. */
export const MIN_EXPLANATION = 20;
export const MAX_EXPLANATION = 2000;

/**
 * The most an official score can be: correctness 70 plus speed 10 (AUTO_MAX in
 * scripts/seasons/score-core.mjs; scoring.test.ts keeps the two equal). The
 * explanation is read by a person and isn't part of this number.
 */
export const OFFICIAL_SCORE_MAX = 80;
