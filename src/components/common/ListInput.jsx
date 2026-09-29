import { useState } from "react";
import { joinList, parseList } from "../../utils/listInput";

// Text input bound to a list of strings ("React, SQL"). Keeps the raw text while
// typing so a trailing comma isn't stripped before the next item is typed.
export default function ListInput({ value, onChange, ...inputProps }) {
  const [text, setText] = useState(() => joinList(value));

  // Resync when the list changes from outside (e.g. preferences reset).
  if (joinList(parseList(text)) !== joinList(value)) {
    setText(joinList(value));
  }

  return (
    <input
      {...inputProps}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parseList(e.target.value));
      }}
    />
  );
}
