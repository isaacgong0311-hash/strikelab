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

// Without this, CodeMirror's default no-wrap behavior forces horizontal
// scrolling on any line wider than the pane — trivially true on mobile,
// where the decorative comment dividers (e.g. "# ── Helpers ─────...")
// in the starter code are 60-80 chars wide against a ~340px viewport. The
// editor pane scrolled internally rather than breaking page layout, so this
// was easy to miss without measuring, but it made every lesson's exercise
// less readable on a phone. Wrapping is a net improvement on desktop too —
// no code line in this codebase's lessons is long enough that wrapping ever
// kicks in unintentionally.
const LINE_WRAP = EditorView.lineWrapping;

export default function MiniEditor({ value, onChange, readOnly }: Props) {
  return (
    <CodeMirror
      value={value}
      extensions={[python(), NO_BROWSER_TEXT_ASSIST, LINE_WRAP]}
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
