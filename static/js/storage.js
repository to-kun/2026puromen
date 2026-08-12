class StorageManager {
  constructor() {
    this.KEYS = {
      MAX_STEP: 'koide_game_max_step',
      HAS_CLEARED: 'koide_game_has_cleared',
      ANOMALY_WEIGHTS: 'koide_game_anomaly_weights',
      UNLOCKED_ANOMALIES: 'koide_game_unlocked_anomalies'
    };
  }

  // 最高到達階層の取得・更新
  getMaxStep() {
    return parseInt(localStorage.getItem(this.KEYS.MAX_STEP) || '0', 10);
  }

  saveMaxStep(step) {
    const currentMax = this.getMaxStep();
    if (step > currentMax) {
      localStorage.setItem(this.KEYS.MAX_STEP, step.toString());
    }
  }

  // クリアフラグの取得・更新
  getHasCleared() {
    return localStorage.getItem(this.KEYS.HAS_CLEARED) === 'true';
  }

  setHasCleared() {
    localStorage.setItem(this.KEYS.HAS_CLEARED, 'true');
  }

  // 異変の重み（Weights）データ取得・更新
  getAnomalyWeights() {
    const data = localStorage.getItem(this.KEYS.ANOMALY_WEIGHTS);
    return data ? JSON.parse(data) : {};
  }

  saveAnomalyWeights(weightsObj) {
    localStorage.setItem(this.KEYS.ANOMALY_WEIGHTS, JSON.stringify(weightsObj));
  }

  // 解放済み異変ID（図鑑用）の取得・追加
  getUnlockedAnomalies() {
    const data = localStorage.getItem(this.KEYS.UNLOCKED_ANOMALIES);
    return data ? JSON.parse(data) : [];
  }

  saveUnlockedAnomaly(anomalyId) {
    if (!anomalyId) return;
    const unlocked = this.getUnlockedAnomalies();
    if (!unlocked.includes(anomalyId)) {
      unlocked.push(anomalyId);
      localStorage.setItem(this.KEYS.UNLOCKED_ANOMALIES, JSON.stringify(unlocked));
    }
  }

  // 重みデータのリセット（全出現後の初期化やデバッグ用）
  resetWeights() {
    localStorage.removeItem(this.KEYS.ANOMALY_WEIGHTS);
  }
}

window.StorageManager = new StorageManager();