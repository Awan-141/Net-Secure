"use server"

import * as JavaScriptObfuscator from "javascript-obfuscator"
import { parse as parseHTML } from "node-html-parser"
import * as typescript from "typescript"
import { minify as minifyCSS } from "csso"
import { format as prettierFormat } from "prettier"
import * as babelParser from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"
import { TStringArrayEncoding } from "javascript-obfuscator/typings/src/types/options/TStringArrayEncoding"
import { TStringArrayWrappersType } from "javascript-obfuscator/typings/src/types/options/TStringArrayWrappersType"
import * as esprima from 'esprima'

// Add custom error types
class ObfuscationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ObfuscationError';
  }
}

class DeobfuscationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeobfuscationError';
  }
}

// Add utility function for error handling
function handleProcessingError(error: unknown, operation: 'obfuscation' | 'deobfuscation'): string {
  console.error(`Error during ${operation}:`, error);
  if (error instanceof Error) {
    return error.message;
  }
  return `Unknown error during ${operation}`;
}

// Add type for HTML element attributes
interface HTMLAttribute {
  name: string;
  value: string;
}

type ObfuscationOptions = {
  compact?: boolean
  controlFlowFlattening?: boolean
  controlFlowFlatteningThreshold?: number
  deadCodeInjection?: boolean
  deadCodeInjectionThreshold?: number
  debugProtection?: boolean
  disableConsoleOutput?: boolean
  identifierNamesGenerator?: "dictionary" | "hexadecimal" | "mangled" | "mangled-shuffled"
  renameGlobals?: boolean
  renameProperties?: boolean
  rotateStringArray?: boolean
  selfDefending?: boolean
  shuffleStringArray?: boolean
  splitStrings?: boolean
  splitStringsChunkLength?: number
  stringArray?: boolean
  stringArrayEncoding?: string[]
  stringArrayThreshold?: number
  transformObjectKeys?: boolean
  unicodeEscapeSequence?: boolean
  // Add new language-specific options
  importObfuscation?: boolean
  minify?: boolean
  preserveDunder?: boolean
  preserveEvents?: boolean
  attributeScrambling?: boolean
}

type ObfuscateParams = {
  code: string
  fileType: string
  options: ObfuscationOptions
}

type DeobfuscateParams = {
  code: string
  fileType: string
}

export async function obfuscateCode({
  code,
  fileType,
  options,
}: ObfuscateParams): Promise<{ processedCode: string; error?: string }> {
  try {
    if (!code.trim()) {
      throw new ObfuscationError("No code provided");
    }

    // Add input validation
    if (!fileType || typeof fileType !== 'string') {
      throw new ObfuscationError("Invalid file type");
    }

    switch (fileType) {
      case "js":
      case "jsx":
        return { processedCode: obfuscateJS(code, options) };

      case "ts":
      case "tsx":
        return { processedCode: obfuscateTS(code, fileType, options) };

      case "py":
        return { processedCode: obfuscatePython(code, options) };

      case "html":
        return { processedCode: obfuscateHTML(code, options) };

      case "css":
        return { processedCode: obfuscateCSS(code) };

      default:
        throw new ObfuscationError(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    return {
      processedCode: "",
      error: handleProcessingError(error, 'obfuscation'),
    };
  }
}

export async function deobfuscateCode({
  code,
  fileType,
}: DeobfuscateParams): Promise<{ processedCode: string; error?: string }> {
  try {
    if (!code.trim()) {
      throw new DeobfuscationError("No code provided");
    }

    if (!fileType || typeof fileType !== 'string') {
      throw new DeobfuscationError("Invalid file type");
    }

    switch (fileType) {
      case "js":
        return { processedCode: await deobfuscateJS(code, "js") };

      case "ts":
        return { processedCode: await deobfuscateJS(code, "ts") };

      case "jsx":
        return { processedCode: await deobfuscateJS(code, "tsx") };

      case "tsx":
        return { processedCode: await deobfuscateJS(code, "tsx") };

      default:
        throw new DeobfuscationError(
          `This file type (${fileType}) is not currently supported for deobfuscation. ` +
          `Please use JavaScript (js), TypeScript (ts), or React (jsx/tsx) files.`
        );
    }
  } catch (error) {
    return {
      processedCode: "",
      error: handleProcessingError(error, 'deobfuscation'),
    };
  }
}

// JavaScript obfuscation
function obfuscateJS(code: string, options: ObfuscationOptions): string {
  const obfuscationOptions = {
    ...options,
    stringArray: true,
    rotateStringArray: true,
    shuffleStringArray: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersType: "variable",
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersChainedCalls: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    unicodeEscapeSequence: false,
    identifierNamesGenerator: options.identifierNamesGenerator as
      | "dictionary"
      | "hexadecimal"
      | "mangled"
      | "mangled-shuffled",
  }

  return JavaScriptObfuscator.obfuscate(code, {
    ...obfuscationOptions,
    stringArrayEncoding: obfuscationOptions.stringArrayEncoding as TStringArrayEncoding[] | undefined,
    stringArrayWrappersType: obfuscationOptions.stringArrayWrappersType as TStringArrayWrappersType | undefined,
  }).getObfuscatedCode()
}

// TypeScript obfuscation
function obfuscateTS(code: string, fileType: string, options: ObfuscationOptions): string {
  // First compile TypeScript to JavaScript
  const compilerOptions = {
    target: typescript.ScriptTarget.ES2020,
    module: typescript.ModuleKind.ESNext,
    jsx: fileType === "tsx" ? typescript.JsxEmit.React : typescript.JsxEmit.None,
  }

  const result = typescript.transpileModule(code, { compilerOptions })

  // Then obfuscate the resulting JavaScript
  return obfuscateJS(result.outputText, options)
}

// Python obfuscation
function obfuscatePython(code: string, options: ObfuscationOptions & { preserveDunder?: boolean }): string {
  const identifierMap = new Map<string, string>();
  let counter = 0;

  // Generate obfuscated identifier
  const generateIdentifier = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const prefix = '_' + counter++;
    const suffix = Array(5).fill(null)
      .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
      .join('');
    return prefix + suffix;
  };

  // Handle special Python identifiers
  const shouldPreserveIdentifier = (name: string) => {
    if (!options.preserveDunder) return false;
    return (name.startsWith('__') && name.endsWith('__')) || // Dunder methods
           ['self', 'cls', 'super'].includes(name); // Common special names
  };

  // Extract and store string literals
  const stringLiterals: string[] = [];
  const extractedCode = code.replace(/('''[\s\S]*?'''|"""[\s\S]*?"""|'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*")/g, 
    (match) => {
      const index = stringLiterals.length;
      stringLiterals.push(match);
      return `__STR${index}__`;
    }
  );

  // Process the code
  let obfuscated = extractedCode
    .split('\n')
    .map(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return line;

      // Handle imports
      if (line.includes('import ') || line.startsWith('from ')) {
        return options.importObfuscation 
          ? line.replace(/(?:import|from)\s+(\w+)/g, (match, name) => {
              if (!identifierMap.has(name)) {
                identifierMap.set(name, generateIdentifier());
              }
              return match.replace(name, identifierMap.get(name) ?? name);
            })
          : line;
      }

      // Handle function and class definitions
      line = line.replace(/(?:def|class)\s+(\w+)/g, (match, name) => {
        if (shouldPreserveIdentifier(name)) return match;
        if (!identifierMap.has(name)) {
          identifierMap.set(name, generateIdentifier());
        }
        return match.replace(name, identifierMap.get(name) ?? name);
      });

      // Handle variable assignments and references
      for (const [original, obfuscated] of identifierMap) {
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        line = line.replace(regex, obfuscated);
      }

      return line;
    })
    .join('\n');

  // Add dead code if enabled
  if (options.deadCodeInjection) {
    const deadCode = [
      '\nif False:',
      '    def ' + generateIdentifier() + '(): pass',
      '    class ' + generateIdentifier() + ': pass',
      '    try: raise Exception',
      '    except: pass',
    ].join('\n');
    obfuscated += deadCode;
  }

  // Restore string literals
  stringLiterals.forEach((str, i) => {
    obfuscated = obfuscated.replace(`__STR${i}__`, str);
  });

  return obfuscated;
}

// Enhanced HTML obfuscation
function obfuscateHTML(code: string, options: ObfuscationOptions & { preserveEvents?: boolean }) {
  const root = parseHTML(code);
  const classMap = new Map<string, string>();
  const idMap = new Map<string, string>();
  let counter = 0;

  // Generate random identifier
  const generateIdentifier = (prefix: string) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const suffix = Array(5).fill(null)
      .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
      .join('');
    return prefix + counter++ + suffix;
  };

  // Process all elements
  root.querySelectorAll('*').forEach(element => {
    // Handle classes
    const classString = element.getAttribute('class');
    if (classString) {
      const classes = classString.split(/\s+/);
      const newClasses = classes.map(cls => {
        if (!classMap.has(cls)) {
          classMap.set(cls, generateIdentifier('c'));
        }
        return classMap.get(cls)!;
      });
      element.setAttribute('class', newClasses.join(' '));
    }

    // Handle IDs
    const id = element.getAttribute('id');
    if (id) {
      if (!idMap.has(id)) {
        idMap.set(id, generateIdentifier('i'));
      }
      element.setAttribute('id', idMap.get(id)!);
    }

    // Handle event attributes
    if (!options.preserveEvents) {
      // Get all attributes as an array of objects
      const attributes = element.rawAttributes as Record<string, string>;
      Object.entries(attributes)
        .filter(([name]) => name.startsWith('on'))
        .forEach(([name, value]) => {
          try {
            const obfuscated = obfuscateJS(value, options);
            element.setAttribute(name, obfuscated);
          } catch (e) {
            console.warn('Failed to obfuscate event handler:', e);
          }
        });
    }
  });

  // Handle inline scripts
  root.querySelectorAll('script').forEach(script => {
    if (!script.getAttribute('src')) {
      try {
        const obfuscated = obfuscateJS(script.textContent || '', options);
        script.textContent = obfuscated;
      } catch (e) {
        console.warn('Failed to obfuscate inline script:', e);
      }
    }
  });

  // Handle inline styles
  root.querySelectorAll('style').forEach(style => {
    try {
      const obfuscated = obfuscateCSS(style.textContent || '');
      style.textContent = obfuscated;
    } catch (e) {
      console.warn('Failed to obfuscate inline style:', e);
    }
  });

  // Minify if requested
  let result = root.toString();
  if (options.minify) {
    result = result
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .trim();
  }

  return result;
}

// CSS obfuscation
function obfuscateCSS(code: string): string {
  // Minify CSS
  const result = minifyCSS(code, {
    restructure: true,
    forceMediaMerge: true,
  })

  let obfuscated = result.css

  // Replace class and ID names with shorter versions
  const classRegex = /\.([\w-]+)/g
  const idRegex = /#([\w-]+)/g

  const classMap: Record<string, string> = {}
  const idMap: Record<string, string> = {}
  let classCounter = 0
  let idCounter = 0

  // Replace class names
  obfuscated = obfuscated.replace(classRegex, (match, className) => {
    if (!classMap[className]) {
      classMap[className] = `c${classCounter++}`
    }
    return `.${classMap[className]}`
  })

  // Replace ID names
  obfuscated = obfuscated.replace(idRegex, (match, idName) => {
    if (!idMap[idName]) {
      idMap[idName] = `i${idCounter++}`
    }
    return `#${idMap[idName]}`
  })

  return obfuscated
}

// JavaScript/TypeScript deobfuscation
async function deobfuscateJS(code: string, fileType: string): Promise<string> {
  try {
    // Parse the code into an AST
    const ast = babelParser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "classProperties", "decorators-legacy", "objectRestSpread"],
    })

    // Traverse the AST to perform transformations
    traverse(ast, {
      // Rename obfuscated variables to more readable names
      Identifier(path) {
        const name = path.node.name
        // Check if this is an obfuscated name (usually hexadecimal or very short)
        if (/^[a-f0-9]{4,}$/i.test(name) || /^[a-zA-Z_][0-9]$/.test(name)) {
          // Don't rename certain identifiers
          if (
            path.parent.type === "ImportSpecifier" ||
            path.parent.type === "ImportDefaultSpecifier" ||
            path.parent.type === "ImportNamespaceSpecifier" ||
            path.parent.type === "ExportSpecifier"
          ) {
            return
          }

          // Generate a more readable name based on context
          let newName = "deobf_var"

          // Try to infer a better name from context
          if (
            path.parent.type === "FunctionDeclaration" ||
            path.parent.type === "FunctionExpression" ||
            path.parent.type === "ArrowFunctionExpression"
          ) {
            newName = "deobf_func"
          } else if (path.parent.type === "ClassDeclaration" || path.parent.type === "ClassExpression") {
            newName = "DeobfClass"
          } else if (path.parent.type === "ObjectProperty" && path.key === "key") {
            newName = "deobf_prop"
          }

          // Add a unique suffix
          path.node.name = `${newName}_${Math.floor(Math.random() * 1000)}`
        }
      },

      // Simplify string array access patterns
      CallExpression(path) {
        // Look for patterns like: _0x123456('0x1', 'abcd')
        if (
          t.isIdentifier(path.node.callee) &&
          /^[a-f0-9_]{6,}$/i.test(path.node.callee.name) &&
          path.node.arguments.length >= 1
        ) {
          // We can't actually know what the string would be without executing,
          // so we replace with a placeholder
          path.replaceWith(t.stringLiteral("DEOBFUSCATED_STRING"))
        }
      },

      // Remove self-defending code
      UnaryExpression(path) {
        if (
          path.node.operator === "!" &&
          t.isCallExpression(path.node.argument) &&
          t.isFunctionExpression(path.node.argument.callee)
        ) {
          // This is likely a self-executing function with a negation
          // Often used in self-defending code
          path.remove()
        }
      },
    })

    // Generate code from the transformed AST
    const output = generate(ast, {
      comments: true,
      compact: false,
      retainLines: true,
    })

    // Format the code with prettier
    const formattedCode = await prettierFormat(output.code, {
      parser: fileType.includes("ts") ? "typescript" : "babel",
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      printWidth: 100,
      trailingComma: "es5",
    })

    return formattedCode
  } catch (error) {
    console.error("Error during JS/TS deobfuscation:", error)

    // If AST transformation fails, try to at least format the code
    try {
      const formattedCode = await prettierFormat(code, {
        parser: fileType.includes("ts") ? "typescript" : "babel",
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        printWidth: 100,
      })
      return formattedCode
    } catch (formatError) {
      // If formatting also fails, return the original code
      return code
    }
  }
}

// HTML deobfuscation
async function deobfuscateHTML(code: string): Promise<string> {
  try {
    const root = parseHTML(code)

    // Deobfuscate inline JavaScript
    const scripts = root.querySelectorAll("script:not([src])")
    for (const script of scripts) {
      const jsCode = script.text
      try {
        const deobfuscated = await deobfuscateJS(jsCode, "js")
        script.set_content(deobfuscated)
      } catch (error) {
        // If deobfuscation fails, leave the script as is
        console.error("Error deobfuscating inline script:", error)
      }
    }

    // Deobfuscate inline CSS
    const styles = root.querySelectorAll("style")
    for (const style of styles) {
      const cssCode = style.text
      try {
        const deobfuscated = deobfuscateCSS(cssCode)
        style.set_content(deobfuscated)
      } catch (error) {
        // If deobfuscation fails, leave the style as is
        console.error("Error deobfuscating inline style:", error)
      }
    }

    // Format the HTML
    const formattedHTML = await prettierFormat(root.toString(), {
      parser: "html",
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
    })

    return formattedHTML
  } catch (error) {
    console.error("Error during HTML deobfuscation:", error)
    return code
  }
}

// CSS deobfuscation
function deobfuscateCSS(code: string): string {
  try {
    // For CSS, we mainly just format it nicely
    // We can't really recover the original class/ID names

    // Expand the minified CSS
    const deobfuscated = code
      .replace(/}/g, "}\n")
      .replace(/{/g, " {\n  ")
      .replace(/;/g, ";\n  ")
      .replace(/\n {2}}/g, "\n}")
      .replace(/,/g, ",\n")
      .replace(/\n\s*\n/g, "\n")

    return deobfuscated
  } catch (error) {
    console.error("Error during CSS deobfuscation:", error)
    return code
  }
}

