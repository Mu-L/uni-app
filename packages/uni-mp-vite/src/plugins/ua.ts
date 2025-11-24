import { parseVueRequest } from '@dcloudio/uni-cli-shared'
import type { Plugin } from 'vite'
const detect = require('../../lib/ua/UADetection-SDK.js')
const defaultConfig = require('../../lib/ua/config/default-config.js')

function displaySummary(result) {
  // 如果没有需要适配的问题，显示成功消息
  if (result.adaptation.needAdaptation === 0) {
    console.log(`项目 "${result.project.name}" 未检测到鸿蒙UA兼容性问题`)
    return
  }

  // 输出所有问题（全量输出，不限制数量）
  if (result.suggestions && result.suggestions.length > 0) {
    result.suggestions.forEach((item, index) => {
      console.log(`[${index + 1}] ${item.file}|${item.line}|${item.message}`)
    })
    console.log('')
  }

  // 输出总结
  console.log(
    `项目 "${result.project.name}" 检测出对于鸿蒙可能存在 ${result.adaptation.needAdaptation} 个UA兼容性问题，建议修复`
  )
}

export function uniUaPlugin(): Plugin {
  let isHotUpdate = true
  const set = new Set()
  return {
    name: 'uni:ua',
    enforce: 'pre',
    config() {
      isHotUpdate = false
      // init ua sdk
      const result = detect(process.env.UNI_INPUT_DIR, {
        consoleOutput: true,
        logFileOutput: true,
        reportOutput: true,
      })

      if (!result.success) {
        console.error('检测失败:', result.error.message)
        return
      }

      // 显示摘要
      if (defaultConfig.output.console.enabled) {
        displaySummary(result)
      }
    },
    transform(_, id) {
      if (isHotUpdate) {
        const { filename } = parseVueRequest(id)
        set.add(filename)
      }
    },
    buildEnd() {
      if (!isHotUpdate) {
        // run first
        isHotUpdate = true
      } else if (set.size) {
        // hot update
        for (const filename of set) {
          const result = detect(filename, {
            consoleOutput: true,
            logFileOutput: true,
            reportOutput: true,
          })
          if (!result.success) {
            console.error('检测失败:', result.error.message)
            return
          }

          // 显示摘要
          if (defaultConfig.output.console.enabled) {
            displaySummary(result)
          }
        }
      }
      set.clear()
    },
  }
}
