class GameLogic {
  constructor() {
    this.currentStep = 0;
    this.maxStep = 8;
    this.hasAnomaly = false;
  }

  // ステージ初期化・更新
  updateStage() {
    if (this.currentStep >= this.maxStep) {
      alert("脱出成功！正常な神陵市役所から無事に退庁できました。");
      this.currentStep = 0;
    }

    // 50%の確率で異変を発生させる（※現状は判定枠組みのみ）
    this.hasAnomaly = Math.random() < 0.5;

    // UIの進行状況を更新
    document.getElementById('current-step').textContent = this.currentStep;

    // 異変の適用 / リセット（anomalies.js 側で処理）
    if (window.AnomalyManager) {
      window.AnomalyManager.reset();
      if (this.hasAnomaly) {
        window.AnomalyManager.applyRandom();
      }
    }
  }

  // プレイヤーの選択処理
  makeChoice(playerThinksAnomaly) {
    if (playerThinksAnomaly === this.hasAnomaly) {
      // 正解：進行度 +1
      this.currentStep++;
    } else {
      // 不正解：振り出しに戻る
      this.currentStep = 0;
      alert("違和感の選択に失敗しました...（0階層目に戻ります）");
    }
    this.updateStage();
  }
}

window.game = new GameLogic();