import { Metadata } from "next";
import { Suspense } from "react";
import PlaygroundClient from "./PlaygroundClient";

export const metadata: Metadata = { title: "Playground — StrikeLab" };

export default function PlaygroundPage() {
  return (
    <Suspense>
      <PlaygroundClient />
    </Suspense>
  );
}
