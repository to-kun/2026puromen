document.addEventListener('DOMContentLoaded', async () => {
  const unlockedIds = window.StorageManager ? window.StorageManager.getUnlockedAnomalies() : [];

  // CSVデータを読み込む関数
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

      // ★重要: 同じIDを持つ異変データを1つに集約（重複排除）
      const uniqueAnomaliesMap = new Map();
      result.forEach(item => {
        const formattedId = String(item.id).padStart(2, '0');
        if (!uniqueAnomaliesMap.has(formattedId)) {
          uniqueAnomaliesMap.set(formattedId, {
            ...item,
            id: formattedId
          });
        }
      });

      return Array.from(uniqueAnomaliesMap.values());
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

  const formattedUnlockedIds = unlockedIds.map(id => String(id).padStart(2, '0'));
  
  // カウント更新処理関数
  function updateStats() {
    const currentUnlockedIds = window.StorageManager ? window.StorageManager.getUnlockedAnomalies().map(id => String(id).padStart(2, '0')) : [];
    const unlockedCount = allAnomalies.filter(a => currentUnlockedIds.includes(a.id)).length;
    const totalCount = allAnomalies.length;
    const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (progressBarEl) progressBarEl.style.width = `${percent}%`;
    if (progressPercentEl) progressPercentEl.textContent = `${percent}%`;
  }

  // カード生成描画
  function renderCards(filter = 'all') {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const currentUnlockedIds = window.StorageManager ? window.StorageManager.getUnlockedAnomalies().map(id => String(id).padStart(2, '0')) : [];

    allAnomalies.forEach((anomaly) => {
      const isUnlocked = currentUnlockedIds.includes(anomaly.id);

      if (filter === 'unlocked' && !isUnlocked) return;
      if (filter === 'locked' && isUnlocked) return;

      const card = document.createElement('article');
      card.className = `anomaly-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      if (isUnlocked) {
        card.innerHTML = `
          <div class="card-id">No.${anomaly.id} [発見済み]</div>
          <h3 class="card-title">${anomaly.description || '名称不明の異変'}</h3>
          <p class="card-desc">対象エリア: ${anomaly.tab || '不明'}タブ</p>
        `;
      } else {
        card.innerHTML = `
          <div class="card-id">No.${anomaly.id} [未発見]</div>
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

  // リセットボタンのイベント追加
  const resetBtn = document.getElementById('btn-reset-archive');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('これまで発見した異変の記録をすべてリセットしますか？')) {
        localStorage.removeItem('koide_game_unlocked_anomalies');
        updateStats();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderCards(activeFilter);
        alert('図鑑の収集記録を初期化しました。');
      }
    });
  }

  // 初回表示
  updateStats();
  renderCards();
});