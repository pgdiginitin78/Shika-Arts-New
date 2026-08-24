const fs = require("fs");

const files = [
  { path: "src/pages/Corporate.jsx", var: "corporateCat" },
  { path: "src/pages/Wedding.jsx", var: "weddingCat" },
  { path: "src/pages/Occasions.jsx", var: "occasionCat" },
  { path: "src/pages/PackagingStudio.jsx", var: "packagingCat" },
  { path: "src/pages/CustomizedGifts.jsx", var: "customizedCat" },
  { path: "src/pages/Delicacies.jsx", var: "delicaciesCat" }
];

for (const { path, var: catVar } of files) {
  let content = fs.readFileSync(path, "utf-8");

  // Add findParentCategoryName if it doesn't exist
  if (!content.includes("const findParentCategoryName")) {
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
    // Insert after findCategoryBySlug
    const findCatRegex = /(const findCategoryBySlug = [\s\S]*?};\n)/;
    content = content.replace(findCatRegex, `$1${parentFunc}`);
  }

  // Update the matched block
  const exactMatchRegex = new RegExp(`(if \\(matched\\) \\{\\s*setSelectedSlug\\(matched\\.slug\\);\\s*setSelectedId\\(matched\\.id\\);\\s*setFilterMode\\("exact"\\);\\s*}) else \\{`, "g");
  
  if (exactMatchRegex.test(content)) {
    content = content.replace(exactMatchRegex, `if (matched) {
        setSelectedSlug(matched.slug);
        setSelectedId(matched.id);
        setFilterMode("exact");
        setActiveCategory(findParentCategoryName(${catVar}?.children, tagParam));
      } else {`);
  } else {
    // If it was already replaced, don't worry.
    console.log("No match found or already patched for", path);
  }

  fs.writeFileSync(path, content);
  console.log(`Patched ${path}`);
}
