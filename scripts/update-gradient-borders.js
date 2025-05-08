#!/usr/bin/env node

/**
 * This script automatically updates React Native components that use LinearGradient for borders
 * to use the new GradientBorder component which is compatible with both iOS and Android.
 *
 * Usage: node scripts/update-gradient-borders.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Path to source directory
const SRC_DIR = path.join(__dirname, '..', 'src');

// List of files to exclude (already updated)
const EXCLUDED_FILES = [
  'src/components/common/Input.tsx',
  'src/components/SearchBar.tsx',
  'src/screens/notes/NotesScreen.tsx',
  'src/components/common/GradientBorder.tsx',
];

// Function to find all component files
function findComponentFiles() {
  return glob.sync(path.join(SRC_DIR, '**/*.{tsx,jsx}'), { nodir: true });
}

// Check if the file contains LinearGradient as a border
function containsGradientBorder(content) {
  return (
    content.includes('LinearGradient') &&
    (content.includes('gradientBorder') ||
      (content.includes('borderRadius') && content.includes('colors=')))
  );
}

// Add import for GradientBorder
function addGradientBorderImport(content) {
  // Already has the import
  if (content.includes('import GradientBorder from')) {
    return content;
  }

  // Check if it imports from components/common
  if (content.includes('import { ') && content.includes(" } from '@components/common';")) {
    return content.replace(
      /import { (.*?) } from '@components\/common';/,
      "import { $1, GradientBorder } from '@components/common';",
    );
  }

  // Otherwise add new import, preferring relative paths
  // Find the right import path based on file location
  let importPath = "import GradientBorder from '../../components/common/GradientBorder';";

  // Look for the last import statement and add after it
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\n', lastImportIndex);
    if (endOfImport !== -1) {
      return (
        content.substring(0, endOfImport + 1) +
        importPath +
        '\n' +
        content.substring(endOfImport + 1)
      );
    }
  }

  return content;
}

// Process a single file
function processFile(filePath) {
  if (EXCLUDED_FILES.some(excluded => filePath.includes(excluded))) {
    console.log(`Skipping already updated file: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (!containsGradientBorder(content)) {
      return;
    }

    console.log(`Processing file: ${filePath}`);

    // Step 1: Add import
    let updatedContent = addGradientBorderImport(content);

    // Step 2: Replace LinearGradient with GradientBorder
    updatedContent = updatedContent.replace(
      /<LinearGradient\s+colors={(\[.*?\])}\s+start={{.*?}}\s+end={{.*?}}\s+style={\[(.*?)\]}>(.+?)<\/LinearGradient>/gs,
      (match, colors, style, children) => {
        // Extract borderRadius from style if present
        let borderRadius = '8';
        const borderRadiusMatch = style.match(/borderRadius:\s*(\d+)/);
        if (borderRadiusMatch) {
          borderRadius = borderRadiusMatch[1];
        }

        return `<GradientBorder colors={${colors}} borderRadius={${borderRadius}} style={[${style}]}>${children}</GradientBorder>`;
      },
    );

    // Also handle the case where style is not in an array
    updatedContent = updatedContent.replace(
      /<LinearGradient\s+colors={(\[.*?\])}\s+start={{.*?}}\s+end={{.*?}}\s+style=(.*?)>(.+?)<\/LinearGradient>/gs,
      (match, colors, style, children) => {
        // Extract borderRadius from style or set default
        let borderRadius = '8';
        const borderRadiusMatch = style.match(/borderRadius:\s*(\d+)/);
        if (borderRadiusMatch) {
          borderRadius = borderRadiusMatch[1];
        }

        return `<GradientBorder colors={${colors}} borderRadius={${borderRadius}} style=${style}>${children}</GradientBorder>`;
      },
    );

    // Update the file content if changes were made
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`Updated file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file: ${filePath}`);
    console.error(error);
  }
}

// Main script execution
const componentFiles = findComponentFiles();
componentFiles.forEach(processFile);
