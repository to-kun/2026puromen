document.addEventListener('DOMContentLoaded', () => {

  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // トップページ（ホーム）タブへ画面をリセットする関数
  const resetToHomeTab = () => {
    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === 'top') {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === 'tab-top') {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });
  };

  // 日付文字列生成関数
  const getFormattedDate = (daysAgo = 0) => {
    const today = new Date();
    today.setDate(today.getDate() - daysAgo);
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const week = today.getDay();
    const week_ja = ["日", "月", "火", "水", "木", "金", "土"];
    const reiwaYear = year - 2018;
    return `令和${reiwaYear}年${month}月${day}日 (${week_ja[week]})`;
  };

  const headerDateEl = document.getElementById('header-date');
  if (headerDateEl) {
    headerDateEl.textContent = getFormattedDate(0);
  }

  const newsDateSettings = [
    { id: 'news-item-1', daysAgo: 1 },
    { id: 'news-item-2', daysAgo: 4 },
    { id: 'news-item-3', daysAgo: 9 },
    { id: 'news-item-4', daysAgo: 13 },
    { id: 'news-item-5', daysAgo: 14 }
  ];

  newsDateSettings.forEach(setting => {
    const newsLinkEl = document.getElementById(setting.id);
    if (newsLinkEl && newsLinkEl.parentElement) {
      const dateSpan = newsLinkEl.parentElement.querySelector('.news-date');
      if (dateSpan) {
        dateSpan.textContent = getFormattedDate(setting.daysAgo);
      }
    }
  });

  // SPA用タブ切り替え制御
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // スタートボタン・振り返りボタン（クリック時にホームへ戻す処理を追加）
  const btnStartStage = document.getElementById('btn-start-stage');
  if (btnStartStage) {
    btnStartStage.addEventListener('click', () => {
      if (window.game) {
        resetToHomeTab();
        window.game.startStage();
      }
    });
  }

  const reviewBtn = document.getElementById('btn-review-stage');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
      if (window.game) {
        resetToHomeTab();
        window.game.startReview();
      }
    });
  }

  // 判定ボタンイベント
  const btnAnomaly = document.getElementById('btn-anomaly');
  const btnNormal = document.getElementById('btn-normal');

  if (btnAnomaly) {
    btnAnomaly.addEventListener('click', () => {
      if (window.game) {
        window.game.makeChoice(true);
      }
    });
  }

  if (btnNormal) {
    btnNormal.addEventListener('click', () => {
      if (window.game) {
        window.game.makeChoice(false);
      }
    });
  }

  if (window.game) {
    window.game.updateStage();
  }
});