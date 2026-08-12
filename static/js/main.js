document.addEventListener('DOMContentLoaded', () => {

  // 日付文字列（例: 令和8年8月11日 (火)）を生成する共通関数
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

  // 0. 日付の自動セット処理
  // ヘッダー
  const headerDateEl = document.getElementById('header-date');
  if (headerDateEl) {
    headerDateEl.textContent = getFormattedDate(0);
  }

  // お知らせの日付要素（.news-date）をまとめて更新する設定
  const newsDateSettings = [
    { id: 'news-item-1', daysAgo: 1 },
    { id: 'news-item-2', daysAgo: 4 },
    { id: 'news-item-3', daysAgo: 9 },
    { id: 'news-item-4', daysAgo: 13 },
    { id: 'news-item-5', daysAgo: 14 }
  ];

  newsDateSettings.forEach(setting => {
    const newsLinkEl = document.getElementById(setting.id);
    if (newsLinkEl) {
      // <a>タグの親要素(li)から .news-date を探して更新
      const dateSpan = newsLinkEl.parentElement.querySelector('.news-date');
      if (dateSpan) {
        dateSpan.textContent = getFormattedDate(setting.daysAgo);
      }
    }
  });


  // 1. SPA用タブ切り替え制御
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = tab.getAttribute('data-tab');

      // 全タブのactiveクラスを解除し、押されたタブにのみactiveを付与
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 全コンテンツを非表示にし、対象のコンテンツのみ表示
      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // 2. スタートボタン（探索を開始する）のイベント登録
  const btnStartStage = document.getElementById('btn-start-stage');
  if (btnStartStage) {
    btnStartStage.addEventListener('click', () => {
      if (window.game) {
        window.game.startStage();
      }
    });
  }

  // 3. ゲーム操作ボタン（異変あり / なし）のイベント登録
  const btnAnomaly = document.getElementById('btn-anomaly');
  const btnNormal = document.getElementById('btn-normal');

  if (btnAnomaly) {
    btnAnomaly.addEventListener('click', () => {
      if (window.game) {
        window.game.makeChoice(true);  // 「異変あり」を選択
      }
    });
  }

  if (btnNormal) {
    btnNormal.addEventListener('click', () => {
      if (window.game) {
        window.game.makeChoice(false); // 「異変なし」を選択
      }
    });
  }

  // 4. 初回ステージ開始（トランジション画面のセット）
  if (window.game) {
    window.game.updateStage();
  }
});