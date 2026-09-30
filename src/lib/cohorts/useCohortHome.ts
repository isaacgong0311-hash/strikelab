"use client";

import { useEffect, useState } from "react";

export interface CohortHome {
  id: string;
  name: string;
}

// One request per page load, shared by the nav and the dashboard. Not kept
// across loads, so a class joined a minute ago shows up on the next page.
let memo: { userId: string; promise: Promise<CohortHome | null> } | null = null;

function loadCohortHome(userId: string): Promise<CohortHome | null> {
  if (memo?.userId !== userId) {
    const promise = fetch("/api/classes/joined")
      .then((res) => (res.ok ? res.json() : { classes: [] }))
      .then((data: { classes?: { id: string; name: string; isCohort?: boolean }[] }) => {
        const first = data.classes?.find((c) => c.isCohort);
        return first ? { id: first.id, name: first.name } : null;
      })
      .catch(() => null);
    memo = { userId, promise };
  }
  return memo.promise;
}

/**
 * The first launched cohort a signed-in student belongs to, or null. A
 * cohort student's primary action is their cohort home, not the curriculum
 * (frontend master plan §4).
 */
export function useCohortHome(userId: string | null | undefined): CohortHome | null {
  const [state, setState] = useState<{ userId: string; cohort: CohortHome | null } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadCohortHome(userId).then((cohort) => {
      if (active) setState({ userId, cohort });
    });
    return () => {
      active = false;
    };
  }, [userId]);

  return userId && state?.userId === userId ? state.cohort : null;
}
