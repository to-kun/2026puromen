class GameLogic {
  constructor() {
    this.currentStep = 0;
    this.maxStep = 8;
    this.hasAnomaly = false;
  }

  // トランジション画面（画面A）を表示し、テキストを設定する
  showTransition(titleText, messageText, buttonText = "探索を開始する") {
    const screenTransition = document.getElementById('screen-transition');
    const screenGame = document.getElementById('screen-game');
    
    const titleEl = document.getElementById('transition-title');
    const messageEl = document.getElementById('transition-message');
    const startBtn = document.getElementById('btn-start-stage');

    if (titleEl) titleEl.textContent = titleText;
    if (messageEl) messageEl.textContent = messageText;
    if (startBtn) startBtn.textContent = buttonText;

    // 画面Aを表示、画面Bを非表示
    if (screenTransition) screenTransition.classList.remove('hidden');
    if (screenGame) screenGame.classList.add('hidden');
  }

  // 探索開始（画面Aを隠して画面Bを表示）
  startStage() {
    const screenTransition = document.getElementById('screen-transition');
    const screenGame = document.getElementById('screen-game');

    if (screenTransition) screenTransition.classList.add('hidden');
    if (screenGame) screenGame.classList.remove('hidden');

    // 画面Bの階層テキストを更新
    const stepEl = document.getElementById('current-step');
    if (stepEl) stepEl.textContent = this.currentStep;
  }

  // ステージ初期化・更新
  updateStage() {
    // 50%の確率で異変発生
    this.hasAnomaly = Math.random() < 0.5;

    // 異変の適用 / リセット
    if (window.AnomalyManager) {
      window.AnomalyManager.reset();
      if (this.hasAnomaly) {
        window.AnomalyManager.applyRandom();
      }
    }

    // 画面A（トランジション画面）を表示準備
    this.showTransition(
      `階層 ${this.currentStep}`,
      "異変がないか、ページ内を注意深く確認してください。"
    );
  }

  // プレイヤーの選択処理
  makeChoice(playerThinksAnomaly) {
    if (playerThinksAnomaly === this.hasAnomaly) {
      // 正解：進行度 +1
      this.currentStep++;
      if (this.currentStep >= this.maxStep) {
        // クリア時
        this.showTransition(
          "脱出成功",
          "無事にすべての異変を回避し、市役所から退庁できました。",
          "最初から遊ぶ"
        );
        this.currentStep = 0;
      } else {
        // 次の階層へ
        this.updateStage();
      }
    } else {
      // 不正解：振り出しに戻る
      this.currentStep = 0;
      this.showTransition(
      `階層 ${this.currentStep}`,
      "異変がないか、ページ内を注意深く確認してください。"
      );
    }
  }
}

window.game = new GameLogic();