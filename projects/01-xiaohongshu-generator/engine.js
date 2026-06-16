/* engine.js — 小红书爆款笔记生成引擎 v2.0
 * 双模式：智能模板（免费）+ AI增强（接入 OpenAI 兼容 API） */
(function () {
  'use strict';

  window.XHSEngine = {

    /* ---- 配置 ---- */
    config: {
      apiKey: '',
      apiBase: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    },

    /* 从 localStorage 加载配置 */
    loadConfig() {
      try {
        const saved = localStorage.getItem('xhse_config');
        if (saved) Object.assign(this.config, JSON.parse(saved));
      } catch (_) {}
    },

    /* 保存配置到 localStorage */
    saveConfig() {
      localStorage.setItem('xhse_config', JSON.stringify(this.config));
    },

    /* ---- 标题模板库 ---- */
    titleTemplates: {
      种草: [
        "后悔没早入！{topic}真的太香了😭",
        "用了{topic}一个月，我的脸/生活变成了这样...",
        "姐妹们冲！！{topic}简直是{keyword1}天花板✨",
        "千万别买{topic}！不然你会...爱不释手🥰",
        "我宣布{topic}是我今年买得最值的东西！！",
        "{topic}｜{keyword1}到我想安利给全世界🌍",
        "谁懂啊！！{topic}真的改变了我的人生😭",
        "被问了800遍的{topic}，今天全交代了📝",
        "预算{keyword1}？{topic}直接封神了好吗！",
        "第一次用{topic}就被惊艳到了...真不是广😮",
        "求求你们试试{topic}！{keyword1}到尖叫的程度",
        "闲置率0%！{topic}是那种越用越上头的存在",
        "用了{topic}才知道什么叫「原来可以这样」",
        "同事以为我换了张脸...其实只是入了{topic}",
        "轻奢感拉满但{keyword1}！{topic}真的懂我",
      ],
      测评: [
        "{topic}深度测评｜用了30天说真话🗣️",
        "全网最全{topic}测评！{keyword1}和{keyword2}到底怎么选",
        "{topic}真的好用吗？硬核实测给你答案🔍",
        "测评｜{topic}到底值不值得买？附真实数据📊",
        "我替你们踩了{topic}的坑...这些点千万注意⚠️",
        "{keyword1}党vs{keyword2}党，{topic}的真相来了",
        "花了{keyword1}块买{topic}，测完发现...",
        "热门{topic}横评｜贵的就一定好吗？实测对比",
        "别被种草骗了！{topic}真实优缺点全曝光",
        "素人实测{topic}：那些博主不说的细节我都挖了",
      ],
      教程: [
        "手把手教你用{topic}，{keyword1}上手就行！📚",
        "{topic}超全攻略｜新手也能轻松掌握🔥",
        "保姆级{topic}教程，看这一篇就够了！",
        "零基础学会{topic}！{keyword1}操作详解🎯",
        "{topic}的{n}个隐藏技巧，90%的人都不知道💡",
        "我终于搞懂了{topic}！整理了一份超详细笔记",
        "{topic}从入门到精通｜每天只要{keyword1}分钟",
        "别再瞎搞了！{topic}的正确打开方式在这里",
        "给所有{keyword1}朋友的{topic}私藏教程",
        "看完立省{keyword1}元！{topic}省心攻略大全",
      ],
      探店: [
        "挖到宝了！{topic}也太适合{keyword1}了吧📍",
        "藏在{topic}秘境，{keyword1}星推荐🌟",
        "本地人私藏的{topic}，终于被我发现！",
        "周末去哪｜{topic}真的绝了，随手拍都是大片📸",
        "人均{keyword1}的{topic}，体验感直接拉满！",
        "{topic}探店｜这氛围感谁懂啊！！",
        "第三次去{topic}了，每次都有新惊喜✨",
        "无意间走进{topic}，出来直接发了朋友圈",
        "杭州/上海/北京出发1h｜{topic}周末好去处",
        "闺蜜以为我出国了...其实就在{topic}附近",
      ],
      vlog: [
        "我的{topic}日常｜{keyword1}但很快乐🌤️",
        "和我过一天｜{topic}版的理想生活🧸",
        "记录{topic}的第{n}天，变化真的肉眼可见",
        "普通人的{topic}日常，没有滤镜的那种",
        "{keyword1}生活指南｜{topic}让我学会慢下来",
        "周末{topic}全记录｜原来生活可以这样过",
        "独居/{keyword1}的生活碎片｜有{topic}的陪伴",
        "看完你会想去试试{topic}｜治愈日常VLOG",
      ],
      好物: [
        "提升幸福感好物｜{topic}必须拥有姓名✨",
        "我逢人就推荐的{topic}！{keyword1}到离谱",
        "{topic}｜那些能让你生活质量翻倍的小东西",
        "年度爱用｜{topic}是我回购最多的单品",
        "平价{keyword1}好物！{topic}真的可以闭眼入🛒",
        "出租屋/{keyword1}党必入！{topic}简直是救星",
        "翻包记｜随身携带的{topic}长什么样？",
        "{keyword1}女孩的好物清单，{topic}排第一",
      ],
      避雷: [
        "这些{topic}千万别买！！我先踩为敬💔",
        "避雷！{topic}的真实体验...快跑💨",
        "全网吹的{topic}我替你们试了，说点真话",
        "{topic}排雷指南｜哪些值得买哪些纯浪费钱",
        "我踩过的{topic}大坑，一定要看！！😤",
        "揭秘套路｜为什么我劝你别轻易尝试{topic}",
        "买{topic}前先看这篇！帮你少花冤枉钱💰",
        "热门的{topic}到底是不是智商税？结论很扎心",
      ]
    },

    /* ---- 正文模板 ---- */
    bodyTemplates: {
      种草: [
        "姐妹们听我说！！\n\n{topic}我真的用了有一段时间了，今天必须来给大家交作业📝\n\n首先说结论：{keyword1}真的不是吹的！{keyword2}也完全在线！！\n\n我本身是{extra_context}，用了之后最大的感受就是——相见恨晚。\n\n具体的体验我给大家细细说：\n\n1️⃣ 外观/包装：第一眼就爱上了，放在那里看着就开心\n2️⃣ 使用感受：{keyword1}确实没话说，{keyword2}也很好\n3️⃣ 效果：坚持了一段时间，变化真的肉眼看得到\n\n最后再啰嗦几句\n\n如果你也{extra_context}，真的可以试试！这个价位能有这种体验，我觉得很值了。\n\n还有什么问题评论区问我，看到都会回～\n\n#真诚分享 #不是广告",
        "我来还愿了！！\n\n上次有姐妹问{topic}值不值得买，我说等我用一阵再反馈，现在来了！\n\n说实话一开始是冲着{keyword1}去的，没想到{keyword2}也这么能打。\n\n用了这段时间，我最直观的感受：\n\n✅ 优点一：{keyword1}完全符合预期\n✅ 优点二：{keyword2}超出预期\n✅ 优点三：整体体验感很好\n\n⚠️ 小提醒：{extra_context}的朋友可能需要适应一下\n\n总之，如果你预算在{keyword1}左右，{topic}是很靠谱的选择。\n\n喜欢记得点赞收藏，有问题评论区见！💕",
      ],
      测评: [
        "今天来交作业了！{topic}的真实测评报告👇\n\n测试时长：30天\n测试维度：{keyword1}、{keyword2}、性价比\n\n📊 综合评分\n\n{keyword1}：★★★★☆\n{keyword2}：★★★★★\n性价比：★★★★☆\n\n📝 详细体验\n\n第一周：还在适应期，感受不太明显\n第二周：开始注意到{keyword1}的变化\n第三四周：{keyword2}的效果真的出来了\n\n🎯 适合什么样的人\n\n{extra_context}的朋友会很爱\n\n💸 值不值得买\n\n和同类产品对比下来，在这个价位段很能打。但如果你的需求是{keyword1}，可能还有更合适的选择。\n\n有什么具体想了解的，评论区留言！",
      ],
      教程: [
        "整理了一份超全的{topic}教程！建议收藏慢慢看📚\n\n适合人群：{extra_context}的朋友\n难度：⭐（只要跟着做就行）\n\n📋 准备工作\n\n1. 先了解{topic}的基础知识\n2. 准备好{keyword1}和{keyword2}\n3. 预留大概{n}分钟的时间\n\n📖 详细步骤\n\nStep 1：从{keyword1}开始入手\nStep 2：结合{keyword2}做进一步调整\nStep 3：根据{extra_context}做个性化设置\n\n💡 进阶技巧\n\n1. 搭配{keyword1}效果更好\n2. 注意{keyword2}的细节\n3. 多做几次就熟练了\n\n⚠️ 常见错误\n\n- 很多人会忽略{keyword1}这个步骤\n- 不要急于求成\n- {extra_context}的同学要特别注意\n\n有什么不懂的评论区问我！救一个是一个💪",
      ],
      探店: [
        "挖到宝了！{topic}也太惊喜了吧！！\n\n📍 地址：{topic}\n💰 人均：{keyword1}\n⭐ 推荐指数：不能更高\n\n🏠 环境\n\n进门的第一感觉就是{keyword1}。整体风格{extra_context}，每一个角落都很出片！\n\n🍽️ 体验\n\n没有一道踩雷的！尤其是{keyword2}，真的是惊艳的程度。\n\n服务也超好，{extra_context}。\n\n📸 拍照攻略\n\n1. 靠窗的位置光线最好\n2. {keyword1}附近是出片神位\n3. 下午{n}点左右的光最美\n\n总之！推荐给所有{extra_context}的朋友，绝对不会失望的！\n\n趁还没大火赶紧去 🏃‍♀️",
      ]
    },

    _defaultBody: [
      "今天来分享{topic}！\n\n作为一个{extra_context}的人，我对{keyword1}和{keyword2}算是有一点发言权。\n\n{topic}用下来的整体感受就是——值。\n\n给大家总结几个关键点：\n\n✨ {keyword1}：这个是真的好\n✨ {keyword2}：完全在线\n✨ 整体体验：推荐\n\n当然也有一些小地方需要注意，比如{extra_context}这方面要花点心思。\n\n但瑕不掩瑜，如果你正好需要，可以去了解一下！\n\n喜欢的话点赞收藏支持一下，有问题评论区见～",
    ],

    hashtagPools: {
      种草: ["好物分享", "种草", "爱用物", "年度爱用", "提升幸福感", "宝藏", "真香", "网购", "开箱", "无限回购"],
      测评: ["测评", "真实测评", "对比测评", "好物测评", "亲测", "避坑", "横向对比", "数据说话"],
      教程: ["教程", "攻略", "手把手", "干货", "学习", "技能", "效率", "技巧", "收藏", "保姆级"],
      探店: ["探店", "打卡", "周末去哪", "拍照", "美食", "旅行", "小众", "出片", "氛围感", "本地人"],
      vlog: ["日常", "vlog", "生活", "治愈", "独居", "慢生活", "记录", "碎片", "仪式感"],
      好物: ["好物", "平价", "学生党", "实用", "幸福感", "家居", "收纳", "精致", "出租屋", "必入"],
      避雷: ["避雷", "踩坑", "排雷", "智商税", "省钱", "清醒", "真实体验", "劝退"],
    },

    coverIdeas: {
      种草: [
        { desc: "温柔光线下的产品平铺，旁边放一杯咖啡，整体氛围温暖治愈", emoji: "☀️" },
        { desc: "手持产品对着镜子自拍，穿搭精致，背景干净简约", emoji: "🪞" },
        { desc: "产品放在白色床单/桌面上，俯拍，加入一两朵花作为点缀", emoji: "🌸" },
        { desc: "Before/After 对比图左右拼接，左边标签写「用之前」，右边写「现在」", emoji: "📊" },
      ],
      测评: [
        { desc: "黑色/灰色背景的产品证件照风格，旁边标注核心参数数据", emoji: "📋" },
        { desc: "手持产品在不同场景下的实拍合集，标注每个场景的感受", emoji: "📸" },
      ],
      教程: [
        { desc: "步骤拆解的拼图封面，每个步骤用小图标 + 简短文字标注", emoji: "📖" },
        { desc: "手写笔记风格的封面，标题大字加粗，配有箭头和标注线", emoji: "✍️" },
      ],
      探店: [
        { desc: "广角拍店内全景，人物在画面中自然走动，光线通透", emoji: "🏠" },
        { desc: "食物/饮品特写 + 环境照的上下拼图，上半是环境，下半是细节", emoji: "🍽️" },
      ],
    },

    /* ---- 辅助函数 ---- */
    _random(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    _shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    _pick(arr, n) {
      return this._shuffle(arr).slice(0, n);
    },

    /* ---- 智能模板生成 ---- */
    generateSmart(config) {
      const { topic, noteType, keywords, extra } = config;
      const kw = (keywords || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
      const k1 = kw[0] || '性价比';
      const k2 = kw[1] || '颜值';
      const extraCtx = extra || k1;

      const titlePool = this.titleTemplates[noteType] || this.titleTemplates['种草'];
      const titles = this._shuffle(titlePool).slice(0, 5).map(t =>
        t.replace(/\{topic\}/g, topic)
         .replace(/\{keyword1\}/g, k1)
         .replace(/\{keyword2\}/g, k2)
         .replace(/\{n\}/g, () => String(Math.floor(Math.random() * 8) + 3))
      );

      const bodyPool = this.bodyTemplates[noteType] || this._defaultBody;
      let body = this._random(bodyPool || this._defaultBody)
        .replace(/\{topic\}/g, topic)
        .replace(/\{keyword1\}/g, k1)
        .replace(/\{keyword2\}/g, k2)
        .replace(/\{extra_context\}/g, extraCtx)
        .replace(/\{n\}/g, () => String(Math.floor(Math.random() * 8) + 3));

      const hPool = this.hashtagPools[noteType] || this.hashtagPools['种草'];
      const hashtags = this._pick(hPool, Math.min(8, hPool.length)).map(h => '#' + h);

      const cPool = this.coverIdeas[noteType] || this.coverIdeas['种草'];
      const cover = this._random(cPool);

      return { titles, body, hashtags, cover };
    },

    /* ---- AI 增强生成 ---- */
    async generateAI(config) {
      if (!this.config.apiKey) {
        throw new Error('请先设置 API Key');
      }

      const { topic, noteType, keywords, extra } = config;
      const typeLabels = {
        '种草': '种草推荐',
        '测评': '真实测评',
        '教程': '教程攻略',
        '探店': '探店打卡',
        'vlog': '生活Vlog',
        '好物': '好物分享',
        '避雷': '避雷指南'
      };

      const prompt = `你是一个小红书爆款文案专家，精通中文社交媒体写作。请为以下话题生成一篇高质量的小红书笔记。

话题/产品：${topic}
笔记类型：${typeLabels[noteType] || noteType}
关键词：${keywords || '无'}
额外要求：${extra || '无'}

请按以下格式输出（严格保持格式）：

[TITLES]
1. 标题一
2. 标题二
3. 标题三
4. 标题四
5. 标题五

[BODY]
（正文内容，200-500字，带emoji，段落清晰，有互动感，符合小红书风格）

[TAGS]
#标签1 #标签2 #标签3 #标签4 #标签5 #标签6 #标签7 #标签8

[COVER]
（封面拍摄建议，1-2句话描述构图、光线、风格）

要求：
- 标题要有吸引力、有emoji、有数字或悬念
- 正文要像真实用户的分享，口语化自然
- 标签要精准且热门
- 避免过于机械或AI腔
- 符合小红书社区规范`;

      const response = await fetch(`${this.config.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: '你是一个专业的小红书文案写手，产出真实自然的笔记内容。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.85,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API 请求失败 (${response.status})`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      /* 解析 AI 返回的结构化内容 */
      const titlesMatch = content.match(/\[TITLES\]\s*([\s\S]*?)(?=\[BODY\]|$)/i);
      const bodyMatch = content.match(/\[BODY\]\s*([\s\S]*?)(?=\[TAGS\]|$)/i);
      const tagsMatch = content.match(/\[TAGS\]\s*([\s\S]*?)(?=\[COVER\]|$)/i);
      const coverMatch = content.match(/\[COVER\]\s*([\s\S]*?)$/i);

      const titles = (titlesMatch?.[1] || '')
        .split('\n')
        .map(l => l.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);

      if (titles.length === 0) {
        titles.push('点击重新生成获取标题');
      }

      const body = (bodyMatch?.[1] || content).trim();
      const tags = (tagsMatch?.[1] || '')
        .split(/[\s#]+/)
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => t.startsWith('#') ? t : '#' + t);

      const coverDesc = (coverMatch?.[1] || '').trim();
      const cover = { desc: coverDesc || '产品放在柔光下的平铺图，搭配生活感道具', emoji: '📸' };

      /* 估算成本 */
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const cost = this._estimateCost(inputTokens, outputTokens);

      return { titles, body, hashtags: tags, cover, apiUsage: { inputTokens, outputTokens, cost } };
    },

    _estimateCost(inputTokens, outputTokens) {
      /* GPT-4o-mini 价格: input $0.15/1M, output $0.60/1M */
      const model = this.config.model;
      let inputPrice = 0.15 / 1000000;
      let outputPrice = 0.60 / 1000000;

      if (model.includes('gpt-4o') && !model.includes('mini')) {
        inputPrice = 2.50 / 1000000;
        outputPrice = 10.00 / 1000000;
      }

      const usd = inputTokens * inputPrice + outputTokens * outputPrice;
      const rmb = usd * 7.25; /* 汇率换算 */
      return rmb;
    },

    /* ---- 统一入口 ---- */
    async generate(config, mode) {
      const t0 = performance.now();

      let result;
      let apiUsage = null;

      if (mode === 'ai') {
        result = await this.generateAI(config);
        apiUsage = result.apiUsage;
        delete result.apiUsage;
      } else {
        result = this.generateSmart(config);
      }

      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

      return {
        ...result,
        stats: {
          cost: apiUsage ? apiUsage.cost.toFixed(4) : '0.00',
          time: elapsed,
          mode: mode,
          tokens: apiUsage ? `${apiUsage.inputTokens}+${apiUsage.outputTokens}` : null,
        }
      };
    }
  };

  /* 初始化加载配置 */
  XHSEngine.loadConfig();

})();
