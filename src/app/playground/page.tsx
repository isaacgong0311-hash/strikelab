import { Metadata } from "next";
import { Suspense } from "react";
import PlaygroundClient from "./PlaygroundClient";

export const metadata: Metadata = { title: "Python Options Playground" };

export default function PlaygroundPage() {
  return (
    <Suspense>
      <PlaygroundClient />
    </Suspense>
  );
}
