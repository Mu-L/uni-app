/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2025-2025. All rights reserved.
 */

// UADetection-SDK.js - UA检测SDK标准化接口
const detectHarmonyAdaptationStatus = require('./harmony-sdk');
const defaultConfig = require('./config/default-config');

/**
 * UA检测SDK - 主接口
 * @param {string} projectPath - 项目路径
 * @param {object} options - 可选配置
 * @param {boolean} options.simpleMode - 简洁模式（默认true）
 * @param {boolean} options.consoleOutput - 控制台输出（默认true）
 * @param {boolean} options.logFileOutput - 日志文件输出（默认true）
 * @param {boolean} options.reportOutput - JSON报告输出（默认false）
 * @param {object} options.customConfig - 完全自定义配置
 * @returns {object} 检测结果
 */
function detect(projectPath, options = {}) {
    // 参数验证
    if (!projectPath || typeof projectPath !== 'string') {
        return {
            success: false,
            error: {
                code: 'INVALID_PATH',
                message: '项目路径无效'
            }
        };
    }

    // 合并配置（customConfig > options > defaultConfig）
    const config = options.customConfig || buildConfig(options);

    try {
        // 调用底层检测
        const result = detectHarmonyAdaptationStatus(projectPath, config);
        return result;
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'DETECTION_ERROR',
                message: error.message,
                stack: error.stack
            }
        };
    }
}

/**
 * 根据选项构建配置
 * @param {object} options - 选项
 * @returns {object} 配置对象
 */
function buildConfig(options) {
    const {
        simpleMode = true,
        consoleOutput = true,
        logFileOutput = true,
        reportOutput = false
    } = options;

    return {
        output: {
            console: {
                ...defaultConfig.output.console,
                enabled: consoleOutput,
                simpleMode: simpleMode
            },
            logFile: {
                ...defaultConfig.output.logFile,
                enabled: logFileOutput
            },
            report: {
                ...defaultConfig.output.report,
                enabled: reportOutput
            }
        },
        report: defaultConfig.report
    };
}

module.exports = detect;