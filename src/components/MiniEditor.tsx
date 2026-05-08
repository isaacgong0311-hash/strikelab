"use client";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

interface Props {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}

export default function MiniEditor({ value, onChange, readOnly }: Props) {
  return (
    <CodeMirror
      value={value}
      extensions={[python()]}
      theme={oneDark}
      onChange={onChange}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: !readOnly,
        autocompletion: true,
        foldGutter: false,
      }}
      style={{ fontSize: "0.85rem" }}
    />
  );
}
