import { astro, star } from "iztro";

// 全局变量
let globalAstrolabe = null;
let globalHoroscope = null;
let globalStars = null;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 设置运限日期为今天
    document.getElementById('horoscope-date').valueAsDate = new Date();

    // 切换日期类型显示/隐藏闰月选项
    document.getElementById('birth-type').addEventListener('change', (e) => {
        const lunarOptions = document.getElementById('lunar-options');
        if (e.target.value === 'lunar') {
            lunarOptions.style.display = 'block';
        } else {
            lunarOptions.style.display = 'none';
        }
    });

    // 标签页切换
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活动标签
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // 激活当前标签
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // 计算星盘按钮事件
    document.getElementById('calculate-btn').addEventListener('click', calculateAstrolabe);

    // 导出按钮事件
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));
    document.getElementById('export-txt').addEventListener('click', () => exportData('txt'));
});

// 计算星盘
function calculateAstrolabe() {
    try {
        // 获取表单数据
        const birthType = document.getElementById('birth-type').value;
        const birthDate = document.getElementById('birth-date').value;
        const timeIndex = parseInt(document.getElementById('time-index').value);
        const gender = document.getElementById('gender').value;
        const fixLeap = document.getElementById('fix-leap').value === 'true';
        const language = document.getElementById('language').value;
        const isLeapMonth = document.getElementById('is-leap-month').value === 'true';
        const horoscopeDate = new Date(document.getElementById('horoscope-date').value);

        // 验证输入
        if (!birthDate) {
            alert('请输入出生日期');
            return;
        }

        // 格式化日期为 "YYYY-M-D" 格式
        const dateObj = new Date(birthDate);
        const formattedDate = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;

        // 根据不同的日期类型获取星盘
        if (birthType === 'solar') {
            globalAstrolabe = astro.bySolar(formattedDate, timeIndex, gender, fixLeap, language);
        } else {
            globalAstrolabe = astro.byLunar(formattedDate, timeIndex, gender, isLeapMonth, fixLeap, language);
        }

        // 获取运限
        globalHoroscope = globalAstrolabe.horoscope(horoscopeDate);

        // 获取流耀 (大限和流年)
        const decadalHS = globalHoroscope.decadal.heavenlyStem;
        const decadalEB = globalHoroscope.decadal.earthlyBranch;
        const yearlyHS = globalHoroscope.yearly.heavenlyStem;
        const yearlyEB = globalHoroscope.yearly.earthlyBranch;

        const decadalStars = star.getHoroscopeStar(decadalHS, decadalEB, 'decadal');
        const yearlyStars = star.getHoroscopeStar(yearlyHS, yearlyEB, 'yearly');
        
        globalStars = {
            decadal: decadalStars,
            yearly: yearlyStars
        };

        // 显示结果
        displayResults();

        // 启用导出按钮
        document.getElementById('export-json').disabled = false;
        document.getElementById('export-txt').disabled = false;
    } catch (error) {
        console.error(error);
        alert(`计算错误: ${error.message}`);
    }
}

// 显示结果
function displayResults() {
    // 显示星盘数据
    document.getElementById('astrolabe-result').textContent = JSON.stringify(globalAstrolabe, null, 2);
    
    // 显示运限数据
    document.getElementById('horoscope-result').textContent = JSON.stringify(globalHoroscope, null, 2);
    
    // 显示流耀数据
    document.getElementById('stars-result').textContent = JSON.stringify(globalStars, null, 2);
}

// 导出数据
function exportData(format) {
    if (!globalAstrolabe) {
        alert('请先计算星盘');
        return;
    }

    const exportData = {
        astrolabe: globalAstrolabe,
        horoscope: globalHoroscope,
        stars: globalStars
    };

    let content;
    let filename;
    let mimeType;

    if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = 'iztro_astrolabe.json';
        mimeType = 'application/json';
    } else {
        content = `星盘数据:\n${JSON.stringify(globalAstrolabe, null, 2)}\n\n运限数据:\n${JSON.stringify(globalHoroscope, null, 2)}\n\n流耀数据:\n${JSON.stringify(globalStars, null, 2)}`;
        filename = 'iztro_astrolabe.txt';
        mimeType = 'text/plain';
    }

    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


