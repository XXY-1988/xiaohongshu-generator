/* app.js — 小红书爆款笔记生成器 v2.0 UI */
(function () {
  'use strict';

  /* ---- 状态 ---- */
  var currentResult = null;
  var currentMode = 'smart';
  var isPaid = false;
  var aiTrialCount = 3;
  var FREE_TRIAL_LIMIT = 3;

  /* 从 localStorage 加载状态 */
  function loadState() {
    try {
      var s = localStorage.getItem('xhse_state');
      if (s) {
        var state = JSON.parse(s);
        isPaid = state.isPaid || false;
        aiTrialCount = state.aiTrialCount !== undefined ? state.aiTrialCount : FREE_TRIAL_LIMIT;
      }
    } catch (_) {}
  }

  function saveState() {
    localStorage.setItem('xhse_state', JSON.stringify({
      isPaid: isPaid,
      aiTrialCount: aiTrialCount,
    }));
  }

  /* ---- DOM ---- */
  var $topic = document.getElementById('topic');
  var $noteType = document.getElementById('noteType');
  var $keywords = document.getElementById('keywords');
  var $extra = document.getElementById('extra');
  var $generateBtn = document.getElementById('generateBtn');
  var $output = document.getElementById('output');
  var $paywall = document.getElementById('paywall');
  var $errorBanner = document.getElementById('errorBanner');
  var $statCost = document.getElementById('statCost');
  var $statTime = document.getElementById('statTime');
  var $statMode = document.getElementById('statMode');
  var $statModeLabel = document.getElementById('statModeLabel');
  var $freeCount = document.getElementById('freeCount');
  var $aiModeBtn = document.getElementById('aiModeBtn');

  /* ---- 初始化 ---- */
  loadState();
  updateFreeCount();
  loadSettingsUI();

  /* ---- 模式切换 ---- */
  document.getElementById('modeToggle').addEventListener('click', function (e) {
    var btn = e.target.closest('.mode-btn');
    if (!btn) return;
    var mode = btn.dataset.mode;
    if (mode === currentMode) return;

    /* 切换到 AI 模式时检查 */
    if (mode === 'ai' && !isPaid && aiTrialCount <= 0) {
      showPaywall();
      return;
    }

    currentMode = mode;
    var buttons = this.querySelectorAll('.mode-btn');
    buttons.forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    hidePaywall();
    hideError();
  });

  /* ---- 生成 ---- */
  window.generate = function () {
    var topic = $topic.value.trim();
    if (!topic) {
      toast('请输入话题或产品名称');
      $topic.focus();
      return;
    }
    hideError();

    /* 检查 AI 模式的免费次数 */
    if (currentMode === 'ai' && !isPaid && aiTrialCount <= 0) {
      showPaywall();
      return;
    }

    $generateBtn.disabled = true;
    $generateBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> 生成中...';
    $output.innerHTML = '<div class="loading"><div class="spinner"></div> AI 正在创作...</div>';

    var config = {
      topic: topic,
      noteType: $noteType.value,
      keywords: $keywords.value,
      extra: $extra.value,
    };

    XHSEngine.generate(config, currentMode).then(function (result) {
      currentResult = result;
      renderResult(result);

      /* 扣减 AI 试用次数 */
      if (currentMode === 'ai' && !isPaid) {
        aiTrialCount--;
        saveState();
        updateFreeCount();
      }

      $statCost.textContent = '¥' + result.stats.cost;
      $statTime.textContent = result.stats.time + 's';
      $statMode.style.display = 'flex';
      $statModeLabel.textContent = currentMode === 'ai' ? 'AI 增强' : '智能模板';

      $generateBtn.disabled = false;
      $generateBtn.innerHTML = '⚡ 再生成一版';
    }).catch(function (err) {
      showError(err.message || '生成失败，请重试');
      $generateBtn.disabled = false;
      $generateBtn.innerHTML = '⚡ 重新生成';
    });
  };

  /* ---- 渲染结果 ---- */
  function renderResult(r) {
    var html = '';

    html += '<div class="result-section">';
    html += '<div class="result-header"><span>🔥 推荐标题（选一个最炸的）</span></div>';
    html += '<div class="result-body"><div class="title-options">';
    r.titles.forEach(function (t, i) {
      html += '<div class="title-option">';
      html += '<span class="title-number">' + (i + 1) + '</span>';
      html += '<span style="flex:1;">' + escHtml(t) + '</span>';
      html += '<button class="btn-copy" onclick="copyText(\'' + escAttr(t) + '\', this)" title="复制标题">📋</button>';
      html += '</div>';
    });
    html += '</div></div></div>';

    html += '<div class="result-section">';
    html += '<div class="result-header"><span>📝 笔记正文</span><button class="btn-copy" onclick="copyText(\'' + escAttr(r.body) + '\', this)">📋 复制</button></div>';
    html += '<div class="result-body">' + escHtml(r.body) + '</div>';
    html += '</div>';

    html += '<div class="result-section">';
    html += '<div class="result-header"><span>🏷️ 推荐话题标签</span><button class="btn-copy" onclick="copyText(\'' + escAttr(r.hashtags.join(' ')) + '\', this)">📋 复制</button></div>';
    html += '<div class="result-body"><div class="hashtag-list">';
    r.hashtags.forEach(function (h) {
      html += '<span class="hashtag">' + escHtml(h) + '</span>';
    });
    html += '</div></div></div>';

    html += '<div class="result-section">';
    html += '<div class="result-header"><span>🎨 封面拍摄建议</span></div>';
    html += '<div class="result-body"><div class="cover-idea">';
    html += '<div class="emoji">' + (r.cover ? r.cover.emoji : '📸') + '</div>';
    html += '<div>' + escHtml(r.cover ? r.cover.desc : '') + '</div>';
    html += '</div></div></div>';

    $output.innerHTML = html;
    $output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- 付费墙 ---- */
  function showPaywall() {
    $output.innerHTML = '';
    $paywall.classList.add('show');
  }

  function hidePaywall() {
    $paywall.classList.remove('show');
    document.getElementById('payQR').style.display = 'none';
  }

  window.showPayQR = function () {
    document.getElementById('payQR').style.display = 'block';
  };

  /* 管理员手动激活（用于收到付款后） */
  window.activateLicense = function () {
    isPaid = true;
    aiTrialCount = 999;
    saveState();
    updateFreeCount();
    hidePaywall();
    toast('✅ 已解锁永久使用！');
    /* 自动切换到 AI 模式 */
    currentMode = 'ai';
    document.querySelectorAll('.mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === 'ai');
    });
  };

  window.switchToSmart = function () {
    currentMode = 'smart';
    document.querySelectorAll('.mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === 'smart');
    });
    hidePaywall();
  };

  /* ---- 复制 ---- */
  window.copyText = function (text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      if (btn) {
        btn.classList.add('copied');
        btn.textContent = '✅ 已复制';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.textContent = '📋 复制';
        }, 2000);
      }
      toast('✅ 已复制到剪贴板');
    }).catch(function () {
      toast('复制失败，请手动复制');
    });
  };

  window.copyAll = function () {
    if (!currentResult) { toast('请先生成内容'); return; }
    var r = currentResult;
    var all = r.titles.map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n');
    all += '\n\n' + r.body;
    all += '\n\n' + r.hashtags.join(' ');
    navigator.clipboard.writeText(all).then(function () {
      toast('✅ 全文已复制到剪贴板！直接去小红书粘贴吧');
    }).catch(function () {
      toast('复制失败，请手动复制');
    });
  };

  /* ---- 设置面板 ---- */
  function loadSettingsUI() {
    document.getElementById('apiBase').value = XHSEngine.config.apiBase;
    document.getElementById('apiKey').value = XHSEngine.config.apiKey;
    document.getElementById('apiModel').value = XHSEngine.config.model;
    updateAiBadge();
  }

  window.saveSettings = function () {
    XHSEngine.config.apiBase = document.getElementById('apiBase').value.trim();
    XHSEngine.config.apiKey = document.getElementById('apiKey').value.trim();
    XHSEngine.config.model = document.getElementById('apiModel').value.trim();
    XHSEngine.saveConfig();
    updateAiBadge();
    var el = document.getElementById('settingsSaved');
    el.classList.add('visible');
    setTimeout(function () { el.classList.remove('visible'); }, 2000);
  };

  window.toggleApiKeyVisibility = function () {
    var input = document.getElementById('apiKey');
    var btn = document.getElementById('toggleKeyBtn');
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  };

  function updateAiBadge() {
    if (XHSEngine.config.apiKey) {
      $aiModeBtn.classList.add('has-api');
    } else {
      $aiModeBtn.classList.remove('has-api');
    }
  }

  /* 设置面板开关 */
  document.getElementById('settingsToggle').addEventListener('click', function (e) {
    e.stopPropagation();
    var panel = document.getElementById('settingsPanel');
    panel.classList.toggle('show');
  });

  document.addEventListener('click', function (e) {
    var panel = document.getElementById('settingsPanel');
    if (panel.classList.contains('show') && !e.target.closest('.settings-panel') && !e.target.closest('.settings-toggle')) {
      panel.classList.remove('show');
    }
  });

  /* ---- 错误信息 ---- */
  function showError(msg) {
    $errorBanner.textContent = '⚠️ ' + msg;
    $errorBanner.style.display = 'block';
  }

  function hideError() {
    $errorBanner.style.display = 'none';
  }

  /* ---- 免费次数显示 ---- */
  function updateFreeCount() {
    if (isPaid) {
      $freeCount.textContent = '🔓 已解锁';
      $freeCount.style.color = '#2ecc71';
    } else if (aiTrialCount <= 0) {
      $freeCount.textContent = '免费次数：0';
      $freeCount.style.color = '#e74c3c';
    } else {
      $freeCount.textContent = 'AI免费剩余：' + aiTrialCount + '次';
      $freeCount.style.color = '';
    }
  }

  /* ---- Toast ---- */
  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2000);
  }

  /* ---- 安全转义 ---- */
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escAttr(s) {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
  }

  /* ---- 回车快捷 ---- */
  $topic.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.generate();
    }
  });

  /* 暴露激活接口到全局 */
  console.log('%c📕 小红书爆款笔记生成器 v2.0 已就绪 %c| %c管理命令：activateLicense() 手动激活付费',
    'color:#ff2442;font-weight:bold;', '', 'color:#999;');

})();
