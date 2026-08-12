class GameLogic {
  constructor() {
    this.currentStep = 0;
    this.maxStep = 8;
    this.hasAnomaly = false;
    this.isFirstPlay = true;
    this.isReviewMode = false;
  }

  // トランジション画面（画面A）を表示し、テキストやボタンを設定する
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

    // 「振り返る」ボタンの表示/非表示切り替え
    if (reviewBtn) {
      if (showReviewButton) {
        reviewBtn.classList.remove('hidden');
      } else {
        reviewBtn.classList.add('hidden');
      }
    }

    // 画面Aを表示、画面Bを非表示
    if (screenTransition) screenTransition.classList.remove('hidden');
    if (screenGame) screenGame.classList.add('hidden');
  }

  // 探索開始（画面Aを隠して画面Bを表示）
  startStage() {
    this.isReviewMode = false; // 振り返りモード解除
    this.openGameScreen();
  }

  // 振り返りモードで開始
  startReview() {
    this.isReviewMode = true; // 振り返りモードON
    this.openGameScreen();
  }

  openGameScreen() {
    const screenTransition = document.getElementById('screen-transition');
    const screenGame = document.getElementById('screen-game');

    if (screenTransition) screenTransition.classList.add('hidden');
    if (screenGame) screenGame.classList.remove('hidden');

    const stepEl = document.getElementById('current-step');
    if (stepEl) stepEl.textContent = this.currentStep;
  }

  // ステージ初期化・更新
  updateStage(customTitle = null, customMsg = null, customMsg2 = null, showReview = null) {
    // 初回プレイは必ず「異変なし」＆振り返りボタン非表示
    if (this.isFirstPlay) {
      this.hasAnomaly = false;
      this.showTransition(
        `階層 ${this.currentStep}`,
        "異変がないか、ページ内を注意深く確認してください。",
        "各種リンクは押せないようになっています。また、「報告・お問い合わせ」から次へ進めます。",
        "探索を開始する",
        false // 初回は非表示
      );
    } else {
      // 2回目以降（正解して次の階層へ進む時も振り返りボタンを表示）
      this.hasAnomaly = Math.random() < 0.5;

      const title = customTitle || `階層 ${this.currentStep}`;
      const msg = customMsg || "異変がないか、ページ内を注意深く確認してください。";
      const msg2 = customMsg2 || "";
      const reviewFlag = (showReview !== null) ? showReview : true;

      this.showTransition(title, msg, msg2, "探索を開始する", reviewFlag);
    }

    // 異変の適用 / リセット
    if (window.AnomalyManager) {
      window.AnomalyManager.reset();
      if (this.hasAnomaly) {
        const appliedId = window.AnomalyManager.applyRandom();
        // 図鑑用の保存処理を追加
        if (appliedId && window.StorageManager) {
          window.StorageManager.saveUnlockedAnomaly(appliedId);
        }
      }
    }
  }

  // プレイヤーの選択処理
  makeChoice(playerThinksAnomaly) {
    // 振り返りモード中の場合は判定を行わず、そのまま画面A（案内画面）に戻る
    if (this.isReviewMode) {
      this.isReviewMode = false;
      const screenTransition = document.getElementById('screen-transition');
      const screenGame = document.getElementById('screen-game');
      if (screenTransition) screenTransition.classList.remove('hidden');
      if (screenGame) screenGame.classList.add('hidden');
      return;
    }

    // 初回フラグを解除（一度でも選択したら2回目以降扱い）
    const wasFirstPlay = this.isFirstPlay;
    this.isFirstPlay = false;

    // 通常の回答判定
    if (playerThinksAnomaly === this.hasAnomaly) {
      // 正解：進行度 +1
      this.currentStep++;

      // 最高到達階層の保存処理を追加
      if (window.StorageManager) {
        window.StorageManager.saveMaxStep(this.currentStep);
      }

      if (this.currentStep >= this.maxStep) {
        // クリア時の保存処理を追加
        if (window.StorageManager) {
          window.StorageManager.setHasCleared();
        }

        // クリア時
        this.showTransition(
          "脱出成功",
          "無事にすべての異変を回避し、市役所から退庁できました。",
          "おめでとうございます。",
          "最初から遊ぶ",
          true // クリア後も直前のページを振り返れる
        );
        this.currentStep = 0;
      } else {
        // 次の階層へ
        this.updateStage();
      }
    } else {
      // 不正解：振り出しに戻る
      const prevStep = this.currentStep;
      this.currentStep = 0;

      // 初回プレイでのミスでなければ振り返りボタンを表示
      const showReview = !wasFirstPlay;

      // 0階層目に戻してステージを更新
      this.updateStage(
        "異変の選択に失敗しました",
        `階層 ${prevStep} で違和感を見落としたか、正常な状態を異変と勘違いしました。`,
        showReview ? "0階層目に戻ります。「直前のページを振り返る」でさっきのページを確認できます。" : "0階層目に戻ります。",
        showReview
      );
    }
  }
}

window.game = new GameLogic();