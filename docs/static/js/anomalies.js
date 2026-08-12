class AnomalyManager {
  constructor() {
    this.anomalies = [];
    this.activeAnomaly = null;
  }

  // 異変のランダム発動（後で異変データを追加していく）
  applyRandom() {
    if (this.anomalies.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.anomalies.length);
    this.activeAnomaly = this.anomalies[randomIndex];
    if (this.activeAnomaly && this.activeAnomaly.apply) {
      this.activeAnomaly.apply();
    }
  }

  // 通常状態へのリセット
  reset() {
    if (this.activeAnomaly && this.activeAnomaly.reset) {
      this.activeAnomaly.reset();
    }
    this.activeAnomaly = null;
  }
}

window.AnomalyManager = new AnomalyManager();