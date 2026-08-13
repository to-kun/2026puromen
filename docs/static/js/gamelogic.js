class GameLogic {
  constructor() {
    this.currentStep = 0;
    this.maxStep = 8;
    this.hasAnomaly = false;
    this.isFirstPlay = true;
    this.isReviewMode = false;
  }

  showTransition(titleText, messageText, messageText2 = "", buttonText = "探索を開始する", showReviewButton = false) {
    const screenTransition = document.getElementById('screen-transition');
    const screenGame = document.getElementById('screen-game');
    
    const titleEl = document.getElementById('transition-title');
    const messageEl = document.getElementById('transition-message');
    const messageEl2 = document.getElementById('transition-first');
    const startBtn = document.getElementById('btn-start-stage');
    const reviewBtn = document.getElementById('btn-review-stage');

    if (titleEl) titleEl.textContent = titleText;
    if (messageEl) messageEl.textContent = messageText;
    if (messageEl2) messageEl2.textContent = messageText2;
    if (startBtn) startBtn.textContent = buttonText;

    if (reviewBtn) {
      if (showReviewButton) {
        reviewBtn.classList.remove('hidden');
      } else {
        reviewBtn.classList.add('hidden');
      }
    }

    if (screenTransition) screenTransition.classList.remove('hidden');
    if (screenGame) screenGame.classList.add('hidden');
  }

  startStage() {
    this.isReviewMode = false;
    this.openGameScreen();
  }

  startReview() {
    this.isReviewMode = true;
    this.openGameScreen();
  }

  openGameScreen() {
    const screenTransition = document.getElementById('screen-transition');
    const screenGame = document.getElementById('screen-game');

    if (screenTransition) screenTransition.classList.add('hidden');
    if (screenGame) screenGame.classList.remove('hidden');

    const stepEl = document.getElementById('current-step');
    if (stepEl) stepEl.textContent = Number(this.currentStep);
  }

  updateStage(customTitle = null, customMsg = null, customMsg2 = null, showReview = null) {
    if (this.isFirstPlay) {
      this.hasAnomaly = false;
      this.showTransition(
        `階層 ${Number(this.currentStep)}`,
        "異変がないか、ページ内を注意深く確認してください。",
        "各種リンクは押せないようになっています。また、「報告・お問い合わせ」から次へ進めます。",
        "探索を開始する",
        false
      );
    } else {
      this.hasAnomaly = Math.random() < 0.5;

      const title = customTitle || `階層 ${Number(this.currentStep)}`;
      const msg = customMsg || "異変がないか、ページ内を注意深く確認してください。";
      const msg2 = customMsg2 || "";
      const reviewFlag = (showReview !== null) ? showReview : true;

      this.showTransition(title, msg, msg2, "探索を開始する", reviewFlag);
    }

    if (window.AnomalyManager) {
      window.AnomalyManager.reset();
      if (this.hasAnomaly) {
        const appliedId = window.AnomalyManager.applyRandom();
        if (appliedId && window.StorageManager) {
          window.StorageManager.saveUnlockedAnomaly(appliedId);
        }
      }
    }
  }

// プレイヤーの選択処理
  makeChoice(playerThinksAnomaly) {
    // 振り返りモード中の場合：判定を行わず案内画面Aへ戻る
    if (this.isReviewMode) {
      this.isReviewMode = false;
      const screenTransition = document.getElementById('screen-transition');
      const screenGame = document.getElementById('screen-game');
      if (screenTransition) screenTransition.classList.remove('hidden');
      if (screenGame) screenGame.classList.add('hidden');
      return;
    }

    // 初回フラグを解除（一度でも選択したら2回目以降扱い）
    this.isFirstPlay = false;

    // 前の階層数値を確実な数値型として保持
    const prevStep = Number(this.currentStep);

    // 回答判定
    if (playerThinksAnomaly === this.hasAnomaly) {
      // ---------------- 正解処理 ----------------
      this.currentStep = Number(this.currentStep) + 1;

      if (window.StorageManager) {
        window.StorageManager.saveMaxStep(this.currentStep);
      }

      if (this.currentStep >= this.maxStep) {
        if (window.StorageManager) {
          window.StorageManager.setHasCleared();
        }

        // 8階層クリア時（脱出成功）も振り返り可能にする
        this.showTransition(
          "脱出成功",
          "無事にすべての異変を回避し、市役所から退庁できました。",
          "おめでとうございます。",
          "最初から遊ぶ",
          true // 振り返りボタン表示
        );
        this.currentStep = 0;
      } else {
        // 次の階層へ進む
        this.updateStage();
      }
    } else {
      // ---------------- 不正解処理 ----------------
      // 0階層目へ戻す
      this.currentStep = 0;

      // どのような誤判定（異変を見落とした / 正常なのに異変と勘違いした）であっても
      // 直前のページを振り返れるように true をセット
      this.updateStage(
        `階層 ${Number(this.currentStep)}`,
        "異変がないか、ページ内を注意深く確認してください。",
        "",
        true 
      );
    }
  }
}

window.game = new GameLogic();