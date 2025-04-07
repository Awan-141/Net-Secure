"use server"

import * as JavaScriptObfuscator from "javascript-obfuscator"
import { parse as parseHTML } from "node-html-parser"
import * as typescript from "typescript"
import { minify as minifyCSS } from "csso"

type ObfuscationOptions = {
  compact?: boolean
  controlFlowFlattening?: boolean
  controlFlowFlatteningThreshold?: number
  deadCodeInjection?: boolean
  deadCodeInjectionThreshold?: number
  stringArrayEncoding?: string
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
      case "jsx":
        return { obfuscatedCode: obfuscateJS(code, options) }

      case "ts":
      case "tsx":
        return { obfuscatedCode: obfuscateTS(code, fileType, options) }

      case "html":
        return { obfuscatedCode: obfuscateHTML(code, options) }

      case "css":
        return { obfuscatedCode: obfuscateCSS(code) }

      default:
        return {
          obfuscatedCode: "",
          error: `Unsupported file type: ${fileType}`,
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
    stringArrayWrappersType: "variable",
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
    if (!idMap[id]) {
      idMap[id] = `i${idCounter++}`
    }
    element.setAttribute("id", idMap[id])
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

