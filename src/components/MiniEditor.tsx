"use client";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

interface Props {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}

// The editor's contenteditable region inherits the browser's spellcheck /
// autocorrect / grammar-suggestion behavior by default, which on some
// browsers (Chrome's "Enhanced spell check" in particular) can splice inline
// suggested text — including URLs pulled from recent history — directly into
// the code as you type. Disabling all of it here is the standard CodeMirror
// fix; code isn't prose, none of these features are useful in it anyway.
const NO_BROWSER_TEXT_ASSIST = EditorView.contentAttributes.of({
  spellcheck: "false",
  autocorrect: "off",
  autocapitalize: "off",
  "data-gramm": "false", // also opts out Grammarly, which has the same failure mode
});

export default function MiniEditor({ value, onChange, readOnly }: Props) {
  return (
    <CodeMirror
      value={value}
      extensions={[python(), NO_BROWSER_TEXT_ASSIST]}
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
