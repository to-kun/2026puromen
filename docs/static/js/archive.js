document.addEventListener('DOMContentLoaded', () => {
  // localStorageから解放済み異変IDを取得（storage.js連携）
  const unlockedIds = window.StorageManager ? window.StorageManager.getUnlockedAnomalies() : [];
  
  // 定義されている全異変データを取得
  const allAnomalies = window.minorAnomalies || [];

  const gridEl = document.getElementById('anomaly-grid');
  const unlockedCountEl = document.getElementById('unlocked-count');
  const totalCountEl = document.getElementById('total-count');
  const progressBarEl = document.getElementById('progress-bar');
  const progressPercentEl = document.getElementById('progress-percent');

  // 収集率の更新
  const unlockedCount = unlockedIds.length;
  const totalCount = allAnomalies.length;
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
  if (totalCountEl) totalCountEl.textContent = totalCount;
  if (progressBarEl) progressBarEl.style.width = `${percent}%`;
  if (progressPercentEl) progressPercentEl.textContent = `${percent}%`;

  // カードの生成描画
  function renderCards(filter = 'all') {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    allAnomalies.forEach((anomaly, index) => {
      const isUnlocked = unlockedIds.includes(anomaly.id);

      // フィルター条件の分岐
      if (filter === 'unlocked' && !isUnlocked) return;
      if (filter === 'locked' && isUnlocked) return;

      const card = document.createElement('article');
      card.className = `anomaly-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      if (isUnlocked) {
        card.innerHTML = `
          <div class="card-id">No.${String(index + 1).padStart(2, '0')} [発見済み]</div>
          <h3 class="card-title">${anomaly.name || '名称不明の異変'}</h3>
          <p class="card-desc">${anomaly.description || '概要データが記録されています。'}</p>
        `;
      } else {
        card.innerHTML = `
          <div class="card-id">No.${String(index + 1).padStart(2, '0')} [未発見]</div>
          <h3 class="card-title">？？？？？？</h3>
          <p class="card-desc">この異変はまだ発見されていません。</p>
        `;
      }

      gridEl.appendChild(card);
    });
  }

  // フィルターボタンのイベント
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderCards(e.target.dataset.filter);
    });
  });

  // 初回表示
  renderCards();
});