/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2025-2025. All rights reserved.
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const heavyConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: false,
  deadCodeInjectionThreshold: 0,
  debugProtection: true,
  debugProtectionInterval: 2000,
  disableConsoleOutput: true,
  identifierNamesGenerator: "hexadecimal",
  identifiersPrefix: "",
  log: false,
  numbersToExpressions: false,
  renameGlobals: true,
  renameProperties: false,
  selfDefending: true,
  simplify: true,
  splitStrings: false,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ["base64"],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 2,
  stringArrayWrappersType: "variable",
  stringArrayThreshold: 0.8,
  transformObjectKeys: false,
  unicodeEscapeSequence: false
};

const filesToObfuscate = [
  'index.js',
  'harmony-sdk.js',
  'config/default-config.js',
  'lib/core/enhanced-analyzer-core.js',
  'lib/core/enhanced-detection-patterns.js',
  'lib/processors/code-extractor.js',
  'lib/processors/context-analyzer.js',
  'lib/processors/result-processor.js',
  'lib/formatters/report-formatter.js',
  'lib/formatters/report-generator.js',
  'lib/utils/file-scanner.js',
  'lib/utils/logger.js',
  'lib/utils/md5-generator.js',
  'lib/utils/statistics-calculator.js',
  'lib/utils/suggestion-generator.js',
  'lib/utils/utils.js'
];

const skipFiles = [
  'sample-usage.js',
  'package.json',
  'README.md',
  '.gitignore',
  '.npmignore',
  'UADetection-SDK.js',
];

const excludeDirs = [
  'node_modules',
  '.hbuilderx',
  'test-harmony-demo',
  'obfuscated-sdk',
  '.git',
  'logs',
  'reports'
];

function obfuscateFile(filePath) {
  try {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(sourceCode, heavyConfig);
    return result.getObfuscatedCode();
  } catch (error) {
    console.error(`混淆失败: ${filePath}`, error.message);
    return null;
  }
}

function createObfuscatedVersion() {
  const outputDir = './obfuscated-sdk';
  
  console.log('开始混淆构建...\n');
  
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  
  function copyDirs(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!excludeDirs.includes(item)) {
          copyDirs(srcPath, destPath);
        }
      }
    });
  }
  
  copyDirs('.', outputDir);
  
  let success = 0;
  let failed = 0;
  
  filesToObfuscate.forEach(file => {
    const fullPath = path.join('.', file);
    const outputPath = path.join(outputDir, file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`文件不存在: ${file}`);
      failed++;
      return;
    }
    
    console.log(`混淆: ${file}`);
    const obfuscated = obfuscateFile(fullPath);
    
    if (obfuscated) {
      fs.writeFileSync(outputPath, obfuscated);
      console.log(`完成: ${file}\n`);
      success++;
    } else {
      failed++;
    }
  });
  
  skipFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(path.join(outputDir, file), content);
      console.log(`复制: ${file}`);
    }
  });
  
  console.log(`\n混淆完成！`);
  console.log(`成功: ${success} 个文件`);
  console.log(`失败: ${failed} 个文件`);
  console.log(`输出目录: ${outputDir}\n`);
}

createObfuscatedVersion();