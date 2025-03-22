// 全局变量存储解析后的星盘数据
let parsedData = null;
let selectedTemplate = 'general';

// 提示词模板
const promptTemplates = {
    general: `我有一份通过紫微斗数排盘软件生成的个人星盘数据，请根据这些数据为我做一个全面的紫微斗数解析。

基本信息：
{basic_info}

十二宫信息：
{palace_info}

长生十二神、博士十二神、流年将前十二神、流年岁前十二神信息：
{twelve_gods_info}

重要星耀组合：
{stars_info}

运限信息：
{horoscope_info}

{additional_requirements}

请基于上述完整数据进行紫微斗数分析，包括我的性格特点、人生走向、事业财运、婚姻感情、健康状况等方面。请详细解释各宫位的主要星耀以及它们的含义。`,

    career: `我有一份通过紫微斗数排盘软件生成的个人星盘数据，请重点分析我的事业和财运情况。

基本信息：
{basic_info}

十二宫完整信息：
{palace_info}

长生十二神、博士十二神、流年将前十二神、流年岁前十二神信息：
{twelve_gods_info}

关键宫位详情：
官禄宫：{official_palace}
财帛宫：{wealth_palace}
迁移宫：{travel_palace}
福德宫：{fortune_palace}

重要星耀组合：
{stars_info}

运限信息：
{horoscope_info}

{additional_requirements}

请根据以上完整数据详细分析我的事业发展方向、财富积累途径、工作特点和职业优势。也请指出可能的挑战和应对建议。`,

    relationship: `我有一份通过紫微斗数排盘软件生成的个人星盘数据，请重点分析我的感情和人际关系情况。

基本信息：
{basic_info}

十二宫完整信息：
{palace_info}

长生十二神、博士十二神、流年将前十二神、流年岁前十二神信息：
{twelve_gods_info}

关键宫位详情：
夫妻宫：{spouse_palace}
兄弟宫：{siblings_palace}
子女宫：{children_palace}
父母宫：{parents_palace}
友谊宫(三合)：{friends_palace}

重要星耀组合：
{stars_info}

运限信息：
{horoscope_info}

{additional_requirements}

请根据以上完整数据详细分析我的感情特点、婚姻状况、家庭关系和人际交往模式。`,

    health: `我有一份通过紫微斗数排盘软件生成的个人星盘数据，请重点分析我的健康状况。

基本信息：
{basic_info}

十二宫完整信息：
{palace_info}

长生十二神、博士十二神、流年将前十二神、流年岁前十二神信息：
{twelve_gods_info}

关键宫位详情：
命宫：{self_palace}
身宫：{body_palace}
疾厄宫：{illness_palace}

重要星耀组合：
{stars_info}

运限信息：
{horoscope_info}

{additional_requirements}

请根据以上完整数据详细分析我的体质特点、可能的健康风险和养生建议。`
};

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 文件输入事件
    const fileInput = document.getElementById('file-input');
    const fileLabel = document.getElementById('file-label');
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileLabel.textContent = `已选择文件: ${e.target.files[0].name}`;
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('data-input').value = event.target.result;
            };
            reader.readAsText(e.target.files[0]);
        }
    });
    
    // 解析数据按钮事件
    document.getElementById('parse-data-btn').addEventListener('click', parseData);
    
    // 模板选择事件
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            // 移除其他卡片的激活状态
            templateCards.forEach(c => c.classList.remove('active'));
            // 添加当前卡片的激活状态
            card.classList.add('active');
            // 设置选中的模板
            selectedTemplate = card.getAttribute('data-template');
        });
    });
    
    // 生成提示词按钮事件
    document.getElementById('generate-prompt-btn').addEventListener('click', generatePrompt);
    
    // 复制提示词按钮事件
    document.getElementById('copy-prompt-btn').addEventListener('click', copyPrompt);
    
    // 高级设置切换事件
    document.getElementById('advanced-toggle').addEventListener('click', toggleAdvancedSettings);
    
    // 更新模板按钮事件
    document.getElementById('update-template-btn').addEventListener('click', updateTemplateAndPrompt);
    
    // 默认选中"通用解析"模板
    document.querySelector('[data-template="general"]').classList.add('active');
});

// 解析星盘数据
function parseData() {
    try {
        // 获取输入数据
        const dataInput = document.getElementById('data-input').value.trim();
        
        if (!dataInput) {
            showError('请输入或上传星盘数据');
            return;
        }
        
        // 尝试解析JSON格式
        try {
            parsedData = JSON.parse(dataInput);
        } catch (e) {
            // 如果不是JSON格式，尝试提取TXT中的JSON部分
            try {
                // 寻找TXT文件中的JSON对象
                const jsonMatch = dataInput.match(/(\{[\s\S]*\})/);
                if (jsonMatch && jsonMatch[1]) {
                    parsedData = JSON.parse(jsonMatch[1]);
                } else {
                    throw new Error('无法解析数据格式');
                }
            } catch (error) {
                showError('数据格式错误，请确保上传正确的紫微斗数星盘数据');
                return;
            }
        }
        
        // 验证数据结构
        if (!parsedData || !parsedData.palaces || !Array.isArray(parsedData.palaces)) {
            showError('无效的紫微斗数星盘数据，找不到宫位信息');
            return;
        }
        
        // 显示关键信息
        displayKeyInfo();
        
        // 显示提示词选择卡片
        document.getElementById('prompt-card').style.display = 'block';
        
        // 隐藏错误消息
        document.getElementById('error-message').style.display = 'none';
    } catch (error) {
        showError(`解析数据失败: ${error.message}`);
    }
}

// 显示关键星盘信息
function displayKeyInfo() {
    const keyInfoContent = document.getElementById('key-info-content');
    
    // 基本信息
    let html = '<h3>基本信息</h3><ul>';
    
    if (parsedData.solarDate) html += `<li>阳历日期: ${parsedData.solarDate}</li>`;
    if (parsedData.lunarDate) html += `<li>农历日期: ${parsedData.lunarDate}</li>`;
    if (parsedData.chineseDate) html += `<li>四柱: ${parsedData.chineseDate}</li>`;
    if (parsedData.time) html += `<li>时辰: ${parsedData.time}</li>`;
    if (parsedData.gender) html += `<li>性别: ${parsedData.gender}</li>`;
    if (parsedData.fiveElementsClass) html += `<li>五行局: ${parsedData.fiveElementsClass}</li>`;
    if (parsedData.soul) html += `<li>命主: ${parsedData.soul}</li>`;
    if (parsedData.body) html += `<li>身主: ${parsedData.body}</li>`;
    
    html += '</ul>';
    
    // 宫位信息
    html += '<h3>重要宫位信息</h3><ul>';
    
    // 找到命宫
    const selfPalace = parsedData.palaces.find(palace => palace.name === '命宫');
    if (selfPalace) {
        const majorStars = selfPalace.majorStars.map(star => {
            let starInfo = star.name;
            if (star.brightness) starInfo += `(${star.brightness})`;
            if (star.mutagen) starInfo += `[${star.mutagen}]`;
            return starInfo;
        }).join('、');
        html += `<li>命宫: ${selfPalace.earthlyBranch}宫 ${majorStars ? `(${majorStars})` : ''}</li>`;
    }
    
    // 找到身宫
    const bodyPalace = parsedData.palaces.find(palace => palace.isBodyPalace);
    if (bodyPalace) {
        const majorStars = bodyPalace.majorStars.map(star => {
            let starInfo = star.name;
            if (star.brightness) starInfo += `(${star.brightness})`;
            if (star.mutagen) starInfo += `[${star.mutagen}]`;
            return starInfo;
        }).join('、');
        html += `<li>身宫: ${bodyPalace.name}宫 (${bodyPalace.earthlyBranch}) ${majorStars ? `(${majorStars})` : ''}</li>`;
    }
    
    html += '</ul>';
    
    keyInfoContent.innerHTML = html;
    document.getElementById('key-info-card').style.display = 'block';
}

// 生成AI提示词
function generatePrompt() {
    if (!parsedData) {
        showError('请先解析星盘数据');
        return;
    }
    
    // 获取额外要求
    const additionalRequirements = document.getElementById('additional-requirements').value.trim();
    
    // 生成基本信息
    const basicInfo = generateBasicInfo();
    
    // 生成宫位信息
    const palaceInfo = generatePalaceInfo();
    
    // 生成十二神信息
    const twelveGodsInfo = generateTwelveGodsInfo();
    
    // 生成星耀组合信息
    const starsInfo = generateStarsInfo();
    
    // 生成运限信息
    const horoscopeInfo = generateHoroscopeInfo();
    
    // 根据选择的模板生成提示词
    let templateText = promptTemplates[selectedTemplate];
    
    // 如果是特定模板，需要替换特定的宫位信息
    if (selectedTemplate === 'career') {
        const officialPalace = getPalaceInfoByName('官禄');
        const wealthPalace = getPalaceInfoByName('财帛');
        const travelPalace = getPalaceInfoByName('迁移');
        const fortunePalace = getPalaceInfoByName('福德');
        
        templateText = templateText
            .replace('{official_palace}', officialPalace)
            .replace('{wealth_palace}', wealthPalace)
            .replace('{travel_palace}', travelPalace)
            .replace('{fortune_palace}', fortunePalace);
    } else if (selectedTemplate === 'relationship') {
        const spousePalace = getPalaceInfoByName('夫妻');
        const siblingsPalace = getPalaceInfoByName('兄弟');
        const childrenPalace = getPalaceInfoByName('子女');
        const parentsPalace = getPalaceInfoByName('父母');
        
        // 友谊宫通常是命宫三合位置
        const commandPalace = parsedData.palaces.find(palace => palace.name === '命宫');
        let friendsPalace = '未提供';
        if (commandPalace) {
            const commandEarthlyBranch = commandPalace.earthlyBranch;
            // 简单计算三合位置（实际可能需要更复杂的计算）
            // 这里只是示例，完整实现需要考虑完整的地支三合规则
            friendsPalace = '命宫三合位置';
        }
        
        templateText = templateText
            .replace('{spouse_palace}', spousePalace)
            .replace('{siblings_palace}', siblingsPalace)
            .replace('{children_palace}', childrenPalace)
            .replace('{parents_palace}', parentsPalace)
            .replace('{friends_palace}', friendsPalace);
    } else if (selectedTemplate === 'health') {
        const selfPalace = getPalaceInfoByName('命宫');
        const bodyPalace = parsedData.palaces.find(palace => palace.isBodyPalace) 
            ? getPalaceInfoByName(parsedData.palaces.find(palace => palace.isBodyPalace).name)
            : '未找到';
        const illnessPalace = getPalaceInfoByName('疾厄');
        
        templateText = templateText
            .replace('{self_palace}', selfPalace)
            .replace('{body_palace}', bodyPalace)
            .replace('{illness_palace}', illnessPalace);
    }
    
    // 替换通用变量
    const prompt = templateText
        .replace('{basic_info}', basicInfo)
        .replace('{palace_info}', palaceInfo)
        .replace('{twelve_gods_info}', twelveGodsInfo)
        .replace('{stars_info}', starsInfo)
        .replace('{horoscope_info}', horoscopeInfo)
        .replace('{additional_requirements}', additionalRequirements);
    
    // 显示结果
    document.getElementById('prompt-result').value = prompt;
    document.getElementById('prompt-template').value = templateText;
    document.getElementById('result-card').style.display = 'block';
}

// 生成基本信息
function generateBasicInfo() {
    let info = '';
    
    if (parsedData.gender) info += `性别: ${parsedData.gender}\n`;
    if (parsedData.solarDate) info += `阳历出生日期: ${parsedData.solarDate}\n`;
    if (parsedData.lunarDate) info += `农历出生日期: ${parsedData.lunarDate}\n`;
    if (parsedData.chineseDate) info += `四柱: ${parsedData.chineseDate}\n`;
    if (parsedData.time) info += `出生时辰: ${parsedData.time} (${parsedData.timeRange || ''})\n`;
    if (parsedData.sign) info += `星座: ${parsedData.sign}\n`;
    if (parsedData.zodiac) info += `生肖: ${parsedData.zodiac}\n`;
    if (parsedData.fiveElementsClass) info += `五行局: ${parsedData.fiveElementsClass}\n`;
    if (parsedData.soul) info += `命主: ${parsedData.soul}\n`;
    if (parsedData.body) info += `身主: ${parsedData.body}\n`;
    if (parsedData.earthlyBranchOfSoulPalace) info += `命宫地支: ${parsedData.earthlyBranchOfSoulPalace}\n`;
    if (parsedData.earthlyBranchOfBodyPalace) info += `身宫地支: ${parsedData.earthlyBranchOfBodyPalace}\n`;
    
    // 添加原始数据中存在的其他基本信息
    if (parsedData.rawDates) {
        info += `\n原始日期数据:\n`;
        if (parsedData.rawDates.lunarDate) {
            const ld = parsedData.rawDates.lunarDate;
            info += `  农历: ${ld.lunarYear}年${ld.lunarMonth}月${ld.lunarDay}日${ld.isLeap ? '(闰月)' : ''}\n`;
        }
        if (parsedData.rawDates.chineseDate) {
            const cd = parsedData.rawDates.chineseDate;
            info += `  年柱: ${cd.yearly.join('')}, 月柱: ${cd.monthly.join('')}, 日柱: ${cd.daily.join('')}, 时柱: ${cd.hourly.join('')}\n`;
        }
    }
    
    if (parsedData.plugins && parsedData.plugins.length > 0) {
        info += `\n插件: ${parsedData.plugins.join(', ')}\n`;
    }
    
    if (parsedData.copyright) {
        info += `\n${parsedData.copyright}\n`;
    }
    
    return info;
}

// 获取指定宫位的完整信息
function getPalaceInfoByName(name) {
    const palace = parsedData.palaces.find(p => p.name === name);
    if (!palace) return '未提供';
    
    let palaceInfo = `${palace.heavenlyStem}${palace.earthlyBranch}宫`;
    
    if (palace.isOriginalPalace) palaceInfo += ' [来因宫]';
    if (palace.isBodyPalace) palaceInfo += ' [身宫]';
    
    let detailInfo = '';
    
    // 主星信息
    if (palace.majorStars && palace.majorStars.length > 0) {
        detailInfo += `\n  主星: ${palace.majorStars.map(star => {
            let starInfo = star.name;
            if (star.brightness) starInfo += `(${star.brightness})`;
            if (star.mutagen) starInfo += `[${star.mutagen}]`;
            return starInfo;
        }).join('、')}`;
    }
    
    // 辅星信息
    if (palace.minorStars && palace.minorStars.length > 0) {
        detailInfo += `\n  辅星: ${palace.minorStars.map(star => {
            let starInfo = star.name;
            if (star.brightness) starInfo += `(${star.brightness})`;
            if (star.mutagen) starInfo += `[${star.mutagen}]`;
            return starInfo;
        }).join('、')}`;
    }
    
    // 杂耀信息
    if (palace.adjectiveStars && palace.adjectiveStars.length > 0) {
        detailInfo += `\n  杂耀: ${palace.adjectiveStars.map(star => star.name).join('、')}`;
    }
    
    // 十二神信息
    if (palace.changsheng12) detailInfo += `\n  长生十二神: ${palace.changsheng12}`;
    if (palace.boshi12) detailInfo += `\n  博士十二神: ${palace.boshi12}`;
    if (palace.jiangqian12) detailInfo += `\n  流年将前十二神: ${palace.jiangqian12}`;
    if (palace.suiqian12) detailInfo += `\n  流年岁前十二神: ${palace.suiqian12}`;
    
    // 大限信息
    if (palace.decadal) {
        detailInfo += `\n  大限: ${palace.decadal.heavenlyStem || ''}${palace.decadal.earthlyBranch || ''} (${palace.decadal.range ? palace.decadal.range.join('-') : ''}岁)`;
    }
    
    // 小限信息
    if (palace.ages && palace.ages.length > 0) {
        detailInfo += `\n  小限年龄: ${palace.ages.join(', ')}`;
    }
    
    return palaceInfo + detailInfo;
}

// 生成十二神信息
function generateTwelveGodsInfo() {
    let info = '';
    
    parsedData.palaces.forEach(palace => {
        info += `${palace.name}宫 (${palace.heavenlyStem}${palace.earthlyBranch}):\n`;
        
        if (palace.changsheng12) info += `  长生十二神: ${palace.changsheng12}\n`;
        if (palace.boshi12) info += `  博士十二神: ${palace.boshi12}\n`;
        if (palace.jiangqian12) info += `  流年将前十二神: ${palace.jiangqian12}\n`;
        if (palace.suiqian12) info += `  流年岁前十二神: ${palace.suiqian12}\n`;
    });
    
    return info;
}

// 生成宫位信息
function generatePalaceInfo() {
    let info = '';
    
    parsedData.palaces.forEach(palace => {
        let palaceInfo = `${palace.name}宫 (${palace.heavenlyStem}${palace.earthlyBranch})`;
        
        if (palace.isOriginalPalace) palaceInfo += ' [来因宫]';
        if (palace.isBodyPalace) palaceInfo += ' [身宫]';
        
        info += `${palaceInfo}\n`;
        
        // 添加主星信息
        if (palace.majorStars && palace.majorStars.length > 0) {
            info += `  主星: ${palace.majorStars.map(star => {
                let starInfo = star.name;
                if (star.brightness) starInfo += `(${star.brightness})`;
                if (star.mutagen) starInfo += `[${star.mutagen}]`;
                return starInfo;
            }).join('、')}\n`;
        }
        
        // 添加辅星信息
        if (palace.minorStars && palace.minorStars.length > 0) {
            info += `  辅星: ${palace.minorStars.map(star => {
                let starInfo = star.name;
                if (star.brightness) starInfo += `(${star.brightness})`;
                if (star.mutagen) starInfo += `[${star.mutagen}]`;
                return starInfo;
            }).join('、')}\n`;
        }
        
        // 添加杂耀信息
        if (palace.adjectiveStars && palace.adjectiveStars.length > 0) {
            info += `  杂耀: ${palace.adjectiveStars.map(star => star.name).join('、')}\n`;
        }
        
        // 添加十二神信息
        if (palace.changsheng12) info += `  长生十二神: ${palace.changsheng12}\n`;
        if (palace.boshi12) info += `  博士十二神: ${palace.boshi12}\n`;
        if (palace.jiangqian12) info += `  流年将前十二神: ${palace.jiangqian12}\n`;
        if (palace.suiqian12) info += `  流年岁前十二神: ${palace.suiqian12}\n`;
        
        // 添加大限和小限信息
        if (palace.decadal) {
            info += `  大限: ${palace.decadal.heavenlyStem || ''}${palace.decadal.earthlyBranch || ''} (${palace.decadal.range ? palace.decadal.range.join('-') : ''}岁)\n`;
        }
        
        if (palace.ages && palace.ages.length > 0) {
            info += `  小限年龄: ${palace.ages.join(', ')}\n`;
        }
        
        info += '\n';
    });
    
    return info;
}

// 生成星耀组合信息
function generateStarsInfo() {
    let info = '';
    
    // 找出命宫的主星
    const commandPalace = parsedData.palaces.find(palace => palace.name === '命宫');
    if (commandPalace && commandPalace.majorStars && commandPalace.majorStars.length > 0) {
        info += `命宫主星: ${commandPalace.majorStars.map(star => {
            let starInfo = star.name;
            if (star.brightness) starInfo += `(${star.brightness})`;
            if (star.mutagen) starInfo += `[${star.mutagen}]`;
            return starInfo;
        }).join('、')}\n`;
    }
    
    // 找出身宫的主星
    const bodyPalace = parsedData.palaces.find(palace => palace.isBodyPalace);
    if (bodyPalace && bodyPalace.majorStars && bodyPalace.majorStars.length > 0) {
        info += `身宫(${bodyPalace.name}宫)主星: ${bodyPalace.majorStars.map(star => {
            let starInfo = star.name;
            if (star.brightness) starInfo += `(${star.brightness})`;
            if (star.mutagen) starInfo += `[${star.mutagen}]`;
            return starInfo;
        }).join('、')}\n`;
    }
    
    // 查找和列出所有特殊星耀的位置
    const specialStars = [
        { name: '紫微', type: 'major' },
        { name: '天府', type: 'major' },
        { name: '禄存', type: 'lucun' },
        { name: '天马', type: 'tianma' }
    ];
    
    info += '\n所有特殊星耀位置:\n';
    
    specialStars.forEach(specialStar => {
        const foundPalaces = parsedData.palaces.filter(palace => 
            palace.majorStars && palace.majorStars.some(star => 
                star.name === specialStar.name && star.type === specialStar.type
            )
        );
        
        if (foundPalaces.length > 0) {
            foundPalaces.forEach(palace => {
                const star = palace.majorStars.find(s => s.name === specialStar.name);
                let starInfo = specialStar.name;
                if (star.brightness) starInfo += `(${star.brightness})`;
                if (star.mutagen) starInfo += `[${star.mutagen}]`;
                info += `- ${starInfo} 在 ${palace.name}宫\n`;
            });
        }
    });
    
    // 查找花曜（桃花星）
    const flowerStars = ['红鸾', '天喜', '咸池', '天姚'];
    
    info += '\n桃花星位置:\n';
    
    flowerStars.forEach(flowerName => {
        parsedData.palaces.forEach(palace => {
            if (palace.adjectiveStars && palace.adjectiveStars.some(star => star.name === flowerName)) {
                info += `- ${flowerName} 在 ${palace.name}宫\n`;
            }
        });
    });
    
    return info;
}

// 生成运限信息
function generateHoroscopeInfo() {
    // 如果星盘数据中包含运限信息，则提取相关信息
    if (parsedData.horoscope) {
        let info = '';
        
        // 大限信息
        if (parsedData.horoscope.decadal) {
            const decadal = parsedData.horoscope.decadal;
            info += `大限: ${decadal.heavenlyStem}${decadal.earthlyBranch} (${decadal.startYear || ''}${decadal.endYear ? '-' + decadal.endYear : ''})\n`;
            
            if (decadal.palaceNames) {
                info += `  流经宫位: ${decadal.palaceNames.join('、')}\n`;
            }
            
            if (decadal.stars) {
                info += `  大限流耀: ${decadal.stars.map(star => {
                    let starInfo = star.name;
                    if (star.brightness) starInfo += `(${star.brightness})`;
                    if (star.mutagen) starInfo += `[${star.mutagen}]`;
                    return starInfo;
                }).join('、')}\n`;
            }
        }
        
        // 流年信息
        if (parsedData.horoscope.yearly) {
            const yearly = parsedData.horoscope.yearly;
            info += `流年: ${yearly.heavenlyStem}${yearly.earthlyBranch} (${yearly.year || ''})\n`;
            
            if (yearly.palaceNames) {
                info += `  流经宫位: ${yearly.palaceNames.join('、')}\n`;
            }
            
            if (yearly.stars) {
                info += `  流年流耀: ${yearly.stars.map(star => {
                    let starInfo = star.name;
                    if (star.brightness) starInfo += `(${star.brightness})`;
                    if (star.mutagen) starInfo += `[${star.mutagen}]`;
                    return starInfo;
                }).join('、')}\n`;
            }
        }
        
        // 流月信息
        if (parsedData.horoscope.monthly) {
            const monthly = parsedData.horoscope.monthly;
            info += `流月: ${monthly.heavenlyStem}${monthly.earthlyBranch} (${monthly.year || ''}年${monthly.month || ''}月)\n`;
            
            if (monthly.palaceNames) {
                info += `  流经宫位: ${monthly.palaceNames.join('、')}\n`;
            }
        }
        
        // 流日信息
        if (parsedData.horoscope.daily) {
            const daily = parsedData.horoscope.daily;
            info += `流日: ${daily.heavenlyStem}${daily.earthlyBranch} (${daily.year || ''}年${daily.month || ''}月${daily.day || ''}日)\n`;
            
            if (daily.palaceNames) {
                info += `  流经宫位: ${daily.palaceNames.join('、')}\n`;
            }
        }
        
        // 流时信息
        if (parsedData.horoscope.hourly) {
            const hourly = parsedData.horoscope.hourly;
            info += `流时: ${hourly.heavenlyStem}${hourly.earthlyBranch}\n`;
            
            if (hourly.palaceNames) {
                info += `  流经宫位: ${hourly.palaceNames.join('、')}\n`;
            }
        }
        
        return info;
    } else if (parsedData.palaces && parsedData.palaces.length > 0 && parsedData.palaces[0].decadal) {
        // 如果没有专门的运限信息，但宫位中包含大限信息
        let info = '大限信息：\n';
        
        parsedData.palaces.forEach(palace => {
            if (palace.decadal) {
                info += `${palace.name}宫: ${palace.decadal.heavenlyStem || ''}${palace.decadal.earthlyBranch || ''} (${palace.decadal.range ? palace.decadal.range.join('-') : ''}岁)\n`;
            }
        });
        
        return info;
    } else {
        return '未提供运限信息。';
    }
}

// 复制提示词到剪贴板
function copyPrompt() {
    const promptResult = document.getElementById('prompt-result');
    promptResult.select();
    document.execCommand('copy');
    
    // 显示复制成功信息
    const copyMessage = document.getElementById('copy-message');
    copyMessage.style.display = 'block';
    
    // 3秒后隐藏消息
    setTimeout(() => {
        copyMessage.style.display = 'none';
    }, 3000);
}

// 切换高级设置
function toggleAdvancedSettings() {
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedContent = document.getElementById('advanced-content');
    
    advancedToggle.classList.toggle('active');
    advancedContent.classList.toggle('active');
}

// 更新模板并重新生成提示词
function updateTemplateAndPrompt() {
    const customTemplate = document.getElementById('prompt-template').value;
    
    if (customTemplate.trim()) {
        // 更新当前选择的模板
        promptTemplates[selectedTemplate] = customTemplate;
        
        // 重新生成提示词
        generatePrompt();
    }
}

// 显示错误信息
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
} 