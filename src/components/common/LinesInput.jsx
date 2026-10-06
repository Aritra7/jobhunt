import { useState } from "react";

const toList = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Textarea bound to a list of lines (bullets, results). Keeps the raw text
 * while typing so pressing Enter for a new line isn't undone.
 * @param {{ value: string[], onChange: (lines: string[]) => void } & Record<string, any>} props
 */
export default function LinesInput({ value, onChange, ...textareaProps }) {
  const [text, setText] = useState(() => value.join("\n"));

  // Resync when the list changes from outside (e.g. new drafts).
  if (toList(text).join("\n") !== value.join("\n")) {
    setText(value.join("\n"));
  }

  return (
    <textarea
      {...textareaProps}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(toList(e.target.value));
      }}
    />
  );
}
