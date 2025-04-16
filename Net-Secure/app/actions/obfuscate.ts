"use server"

import * as JavaScriptObfuscator from "javascript-obfuscator"
import { parse as parseHTML } from "node-html-parser"
import * as typescript from "typescript"
import { minify as minifyCSS } from "csso"
import type { TStringArrayEncoding } from "javascript-obfuscator/typings/src/types/options/TStringArrayEncoding"
import type { TStringArrayWrappersType } from "javascript-obfuscator/typings/src/types/options/TStringArrayWrappersType"

type ObfuscationOptions = {
  compact?: boolean
  controlFlowFlattening?: boolean
  controlFlowFlatteningThreshold?: number
  deadCodeInjection?: boolean
  deadCodeInjectionThreshold?: number
  stringArrayEncoding?: TStringArrayEncoding[]
  stringArrayThreshold?: number
  renameProperties?: boolean
  selfDefending?: boolean
}

type ObfuscateParams = {
  code: string
  fileType: string
  options: ObfuscationOptions
}

export async function obfuscateCode({
  code,
  fileType,
  options,
}: ObfuscateParams): Promise<{ obfuscatedCode: string; error?: string }> {
  try {
    if (!code.trim()) {
      return { obfuscatedCode: "", error: "No code provided" }
    }

    switch (fileType) {
      case "js":
        return { obfuscatedCode: obfuscateJS(code, options) }

      case "ts":
        return { obfuscatedCode: obfuscateTS(code, "ts", options) }

      case "jsx":
        // JSX requires special handling to preserve React-specific syntax
        return { obfuscatedCode: obfuscateTS(code, "tsx", options) }

      case "tsx":
        return { obfuscatedCode: obfuscateTS(code, "tsx", options) }

      default:
        return {
          obfuscatedCode: "",
          error: `This file type (${fileType}) is not currently supported for secure obfuscation. Please use JavaScript (js), TypeScript (ts), or React (jsx/tsx) files.`,
        }
    }
  } catch (error) {
    console.error("Obfuscation error:", error)
    return {
      obfuscatedCode: "",
      error: `Error during obfuscation: ${(error as Error).message}`,
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
    stringArrayWrappersType: "variable" as TStringArrayWrappersType,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersChainedCalls: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    unicodeEscapeSequence: false,
  }

  return JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode()
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
  const classMap: Record<string, string> = {}
  const idMap: Record<string, string> = {}
  let classCounter = 0
  let idCounter = 0

  // Replace class names
  root.querySelectorAll("[class]").forEach((element) => {
    const classAttr = element.getAttribute("class")
    if (classAttr) {
      const classes = classAttr.split(/\s+/)
      const newClasses = classes.map((cls) => {
        if (!classMap[cls]) {
          classMap[cls] = `c${classCounter++}`
        }
        return classMap[cls]
      })
      element.setAttribute("class", newClasses.join(" "))
    }
  })

  // Replace ID names with null checks
  root.querySelectorAll("[id]").forEach((element) => {
    const id = element.getAttribute("id")
    if (id) {
      if (!classMap[id]) {
        idMap[id] = `i${idCounter++}`
      }
      element.setAttribute("id", idMap[id] || id)
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

