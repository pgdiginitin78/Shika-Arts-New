const fs = require("fs");

const files = [
  "src/pages/Corporate.jsx",
  "src/pages/Wedding.jsx",
  "src/pages/Occasions.jsx",
  "src/pages/PackagingStudio.jsx"
];

const parentFunc = `
  const findParentCategoryName = (nodes, slug) => {
    if (!nodes) return "All";
    for (const topNode of nodes) {
      if (topNode.slug === slug || findCategoryBySlug(topNode.children, slug)) {
        return topNode.name;
      }
    }
    return "All";
  };
`;

for (const path of files) {
  let content = fs.readFileSync(path, "utf-8");

  if (!content.includes("const findParentCategoryName")) {
    const regex = /(const findCategoryBySlug = [\s\S]*?\};\r?\n)/;
    if (regex.test(content)) {
      content = content.replace(regex, `$1${parentFunc}`);
      fs.writeFileSync(path, content);
      console.log("Patched function into", path);
    } else {
      console.log("Regex failed for", path);
    }
  }
}
