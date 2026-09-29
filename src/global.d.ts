// Vite handles CSS imports; tell the type checker they exist.
declare module '*.css';

// Vite "?url" imports resolve to the asset's URL.
declare module '*?url' {
  const url: string;
  export default url;
}

// mammoth ships no types; describe the one function we use.
declare module 'mammoth/mammoth.browser.js' {
  const mammoth: {
    convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string, messages: unknown[] }>;
  };
  export default mammoth;
}
