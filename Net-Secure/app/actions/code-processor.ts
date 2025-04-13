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
      return { processedCode: "", error: "No code provided" }
    }

    switch (fileType) {
      case "js":
      case "jsx":
        return { processedCode: obfuscateJS(code, options) }

      case "ts":
      case "tsx":
        return { processedCode: obfuscateTS(code, fileType, options) }

      case "html":
        return { processedCode: obfuscateHTML(code, options) }

      case "css":
        return { processedCode: obfuscateCSS(code) }

      default:
        return {
          processedCode: "",
          error: `Unsupported file type: ${fileType}`,
        }
    }
  } catch (error) {
    console.error("Obfuscation error:", error)
    return {
      processedCode: "",
      error: `Error during obfuscation: ${(error as Error).message}`,
    }
  }
}

export async function deobfuscateCode({
  code,
  fileType,
}: DeobfuscateParams): Promise<{ processedCode: string; error?: string }> {
  try {
    if (!code.trim()) {
      return { processedCode: "", error: "No code provided" }
    }

    switch (fileType) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return { processedCode: await deobfuscateJS(code, fileType) }

      case "html":
        return { processedCode: await deobfuscateHTML(code) }

      case "css":
        return { processedCode: deobfuscateCSS(code) }

      default:
        return {
          processedCode: "",
          error: `Unsupported file type: ${fileType}`,
        }
    }
  } catch (error) {
    console.error("Deobfuscation error:", error)
    return {
      processedCode: "",
      error: `Error during deobfuscation: ${(error as Error).message}`,
    }
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

// HTML obfuscation
function obfuscateHTML(code: string, options: ObfuscationOptions): string {
  const root = parseHTML(code)

  // Obfuscate inline JavaScript
  const scripts = root.querySelectorAll("script:not([src])")
  for (const script of scripts) {
    const jsCode = script.text
    const obfuscated = obfuscateJS(jsCode, options)
    script.set_content(obfuscated)
  }

  // Obfuscate inline CSS
  const styles = root.querySelectorAll("style")
  for (const style of styles) {
    const cssCode = style.text
    const obfuscated = obfuscateCSS(cssCode)
    style.set_content(obfuscated)
  }

  // Obfuscate element IDs and classes
  const classMap: Record<string, string> = {}
  const idMap: Record<string, string> = {}
  let classCounter = 0
  let idCounter = 0

  // Replace class names
  root.querySelectorAll("[class]").forEach((element) => {
    const classes = element.getAttribute("class").split(/\s+/)
    const newClasses = classes.map((cls) => {
      if (!classMap[cls]) {
        classMap[cls] = `c${classCounter++}`
      }
      return classMap[cls]
    })
    element.setAttribute("class", newClasses.join(" "))
  })

  // Replace ID names
  root.querySelectorAll("[id]").forEach((element) => {
    const id = element.getAttribute("id")
    if (id) {
      if (!idMap[id]) {
        idMap[id] = `i${idCounter++}`
      }
      element.setAttribute("id", idMap[id])
    }
  })

  return root.toString()
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

