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
      const response = await fetch('/static/data/anomalies.csv');
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
      screenGame.className = '';
    }
    this.activeAnomaly = null;
  }

  // 異変のランダム適用
  applyRandom() {
    if (this.anomalies.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.anomalies.length);
    const targetAnomaly = this.anomalies[randomIndex];
    
    const success = this.applyById(targetAnomaly.id);
    return success ? targetAnomaly.id : null;
  }

  // 指定IDの異変適用
  applyById(id) {
    const anomaly = this.anomalies.find(a => String(a.id) === String(id));
    if (!anomaly) return false;

    const target = document.getElementById(anomaly.target_id);
    if (!target) return false;

    if (anomaly.type === 'text') {
      target.textContent = anomaly.anomaly_value;
    } else if (anomaly.type === 'html') {
      target.innerHTML = anomaly.anomaly_value;
    } else if (anomaly.type === 'style') {
      target.style.cssText += anomaly.anomaly_value;
    }

    this.activeAnomaly = anomaly;
    return true;
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