document.addEventListener('DOMContentLoaded', async () => {
  // 1. StorageManager から解放済みIDを取得
  const unlockedIds = window.StorageManager ? window.StorageManager.getUnlockedAnomalies() : [];

  // 2. CSVデータを読み込む関数
  async function fetchAnomalies() {
    try {
      const response = await fetch('./static/data/anomalies.csv');
      if (!response.ok) throw new Error('CSV読み込み失敗');
      const text = await response.text();
      
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map(h => h.trim());
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        result.push(entry);
      }
      return result;
    } catch (error) {
      console.error('[ERROR] アーカイブデータの取得に失敗しました:', error);
      return [];
    }
  }

  const allAnomalies = await fetchAnomalies();

  const gridEl = document.getElementById('anomaly-grid');
  const unlockedCountEl = document.getElementById('unlocked-count');
  const totalCountEl = document.getElementById('total-count');
  const progressBarEl = document.getElementById('progress-bar');
  const progressPercentEl = document.getElementById('progress-percent');

  // 収集率の計算（IDの型補正）
  const formattedUnlockedIds = unlockedIds.map(id => String(id).padStart(2, '0'));
  
  // 発見数のカウント（全データの中から解放済みIDに合致する数）
  const unlockedCount = allAnomalies.filter(a => formattedUnlockedIds.includes(String(a.id).padStart(2, '0'))).length;
  const totalCount = allAnomalies.length;
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
  if (totalCountEl) totalCountEl.textContent = totalCount;
  if (progressBarEl) progressBarEl.style.width = `${percent}%`;
  if (progressPercentEl) progressPercentEl.textContent = `${percent}%`;

  // カード生成描画
  function renderCards(filter = 'all') {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    allAnomalies.forEach((anomaly) => {
      const formattedId = String(anomaly.id).padStart(2, '0');
      const isUnlocked = formattedUnlockedIds.includes(formattedId);

      // フィルター条件
      if (filter === 'unlocked' && !isUnlocked) return;
      if (filter === 'locked' && isUnlocked) return;

      const card = document.createElement('article');
      card.className = `anomaly-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      if (isUnlocked) {
        card.innerHTML = `
          <div class="card-id">No.${formattedId} [発見済み]</div>
          <h3 class="card-title">${anomaly.description || '名称不明の異変'}</h3>
          <p class="card-desc"></p>
        `;
      } else {
        card.innerHTML = `
          <div class="card-id">No.${formattedId} [未発見]</div>
          <h3 class="card-title">？？？？？？</h3>
          <p class="card-desc">この異変はまだ発見されていません。</p>
        `;
      }

      gridEl.appendChild(card);
    });
  }

  // フィルターボタンイベント
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderCards(e.target.dataset.filter);
    });
  });

  // 初回描画
  renderCards();
});