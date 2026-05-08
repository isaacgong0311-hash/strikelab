import { Metadata } from "next";
import PlaygroundClient from "./PlaygroundClient";

export const metadata: Metadata = { title: "Playground — StrikeLab" };

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
