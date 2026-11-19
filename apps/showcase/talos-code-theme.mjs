// Shiki theme for the docs' fenced code blocks. Every colour is a CSS variable
// (set in DocsShell.astro), so tokens follow the Talos palette and a palette
// change needs no rebuild of the highlighter. Shiki's built-in `css-variables`
// theme was dropped because it paints tag names and string literals with one
// variable (token-string-expression), which leaves HTML and Astro samples
// two-tone.
const v = (name) => `var(--talos-code-${name})`;

export default {
  name: "talos",
  type: "dark",
  colors: {
    "editor.background": v("bg"),
    "editor.foreground": v("fg"),
  },
  tokenColors: [
    { settings: { foreground: v("fg"), background: v("bg") } },
    {
      scope: ["comment", "punctuation.definition.comment", "string.quoted.docstring.multi"],
      settings: { foreground: v("comment"), fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.operator.new",
        "keyword.control",
        "variable.language.this",
      ],
      settings: { foreground: v("keyword") },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace", "punctuation.definition.tag"],
      settings: { foreground: v("punctuation") },
    },
    {
      scope: ["string", "string.quoted", "string.template", "string.unquoted", "markup.inline.raw"],
      settings: { foreground: v("string") },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other",
        "keyword.other.unit",
        "support.constant",
      ],
      settings: { foreground: v("constant") },
    },
    {
      scope: ["entity.name.tag", "support.class.component", "entity.name.tag.css"],
      settings: { foreground: v("tag") },
    },
    {
      scope: ["entity.other.attribute-name", "support.type.property-name", "meta.property-name"],
      settings: { foreground: v("attribute") },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
        "variable.function",
      ],
      settings: { foreground: v("function") },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.class", "support.type", "entity.other.inherited-class"],
      settings: { foreground: v("type") },
    },
    {
      scope: ["variable.parameter", "variable.other.property", "variable.other.object.property", "meta.object-literal.key"],
      settings: { foreground: v("property") },
    },
    {
      scope: ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.other.attribute-name.pseudo-class.css"],
      settings: { foreground: v("tag") },
    },
    {
      scope: ["variable.other.env", "variable.other.normal.shell", "variable.css", "variable.argument.css"],
      settings: { foreground: v("constant") },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: v("function"), fontStyle: "bold" },
    },
    { scope: ["markup.inserted"], settings: { foreground: v("tag") } },
    { scope: ["markup.deleted"], settings: { foreground: v("deleted") } },
  ],
};
