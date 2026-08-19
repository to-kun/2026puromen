class AnomalyManager {
  constructor() {
    this.anomalies = [];
    this.activeAnomaly = null;
    this.initialHTML = '';
  }

  // CSVの読み込み処理
  async init() {
    const screenGame = document.getElementById('screen-game');
    if (screenGame) {
      this.initialHTML = screenGame.innerHTML;
    }

    try {
      const response = await fetch('./static/data/anomalies.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      this.anomalies = this.parseCSV(csvText);
      console.log(`[DEBUG] CSV読み込み完了: 全 ${this.anomalies.length} 件の異変データ`);
    } catch (error) {
      console.error('[ERROR] 異変CSVの読み込みに失敗しました:', error);
    }
  }

  // CSVテキストのパース処理
  parseCSV(text) {
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
  }

  // 通常状態へのリセット
  reset() {
    const screenGame = document.getElementById('screen-game');
    if (screenGame && this.initialHTML) {
      screenGame.innerHTML = this.initialHTML;
      screenGame.className = 'screen';
    }
    
    // bodyおよび画面全体に追加されたクラスや直接スタイルもクリア
    document.body.classList.remove('is-shaking');
    document.body.style.animation = '';
    if (screenGame) screenGame.style.animation = '';
    
    this.activeAnomaly = null;
  }

  // 異変のランダム適用
// 異変のランダム適用（重み付け抽選付き）
  applyRandom() {
    if (this.anomalies.length === 0) return null;
    const uniqueIds = Array.from(new Set(this.anomalies.map(a => String(a.id).padStart(2, '0'))));
    const unlockedIds = window.StorageManager 
      ? window.StorageManager.getUnlockedAnomalies().map(id => String(id).padStart(2, '0')) 
      : [];
    const weightedPool = [];
    uniqueIds.forEach(id => {
      const isUnlocked = unlockedIds.includes(id);
      const weight = isUnlocked ? 1 : 5;
      for (let i = 0; i < weight; i++) {
        weightedPool.push(id);
      }
    });
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    const selectedId = weightedPool[randomIndex];
    const success = this.applyById(selectedId);
    return success ? selectedId : null;
  }

  // 指定IDの異変適用
  applyById(id) {
    const matches = this.anomalies.filter(a => String(a.id) === String(id));
    if (matches.length === 0) return false;

    let appliedCount = 0;

    matches.forEach(anomaly => {
      const target = document.getElementById(anomaly.target_id);
      if (target) {
        if (anomaly.type === 'text') {
          target.textContent = anomaly.anomaly_value;
          appliedCount++;
        } else if (anomaly.type === 'html') {
          target.innerHTML = anomaly.anomaly_value;
          appliedCount++;
        } else if (anomaly.type === 'style') {
          target.style.cssText += anomaly.anomaly_value;
          appliedCount++;
        }
      }
    });

    if (appliedCount > 0) {
      // アクティブな異変情報として先頭のオブジェクトを保持
      this.activeAnomaly = matches[0];
      return true;
    }

    return false;
  }

  // 全異変一覧と解放状態の取得
  getReviewData() {
    const unlockedIds = window.StorageManager
      ? window.StorageManager.getUnlockedAnomalies().map(id => String(id).padStart(2, '0'))
      : [];

    return this.anomalies.map(anomaly => {
      const formattedId = String(anomaly.id).padStart(2, '0');
      const isUnlocked = unlockedIds.includes(formattedId);
      return {
        ...anomaly,
        id: formattedId,
        isUnlocked: isUnlocked
      };
    });
  }
}

window.AnomalyManager = new AnomalyManager();