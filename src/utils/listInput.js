// "React, SQL" <-> ["React", "SQL"] for comma-separated text inputs.
export function parseList(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinList(items) {
  return items.join(", ");
}
