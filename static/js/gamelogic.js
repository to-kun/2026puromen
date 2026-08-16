class GameLogic {
  constructor() {
    this.currentStep = 0;
    this.maxStep = 8;
    this.hasAnomaly = false;
    this.isFirstPlay = true;
    this.isReviewMode = false;
    this.lastAnomalyId = null; // 振り返り用に「直前まで表示されていた異変ID」を保持
  }

  // 画面表示切り替え用共通メソッド
  showScreen(screenId) {
    const screens = ['screen-transition', 'screen-game'];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });
  }

  showTransition(titleText, messageText, messageText2 = "", buttonText = "探索を開始する", showReviewButton = false) {
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

    this.showScreen('screen-transition');
  }

  startStage() {
    this.isReviewMode = false;
    this.openGameScreen();
  }

  // 振り返り実行：退避しておいた直前の異変IDを使って画面Bを再再現する
  startReview() {
    this.isReviewMode = true;
    
    if (window.AnomalyManager) {
      window.AnomalyManager.reset();
      if (this.lastAnomalyId) {
        window.AnomalyManager.applyById(this.lastAnomalyId);
      }
    }

    this.showScreen('screen-game');
  }

  openGameScreen() {
    this.showScreen('screen-game');

    const stepEl = document.getElementById('current-step');
    if (stepEl) stepEl.textContent = Number(this.currentStep);
  }

  updateStage(customTitle = null, customMsg = null, customMsg2 = null, showReview = null) {
    const currentStepNum = Number(this.currentStep);
    const title = customTitle || `階層 ${currentStepNum}`;

    if (this.isFirstPlay) {
      this.hasAnomaly = false;
      this.showTransition(
        title,
        "異変がないか、ページ内を注意深く確認してください。",
        "各種リンクは押せないようになっています。また、「報告・お問い合わせ」から次へ進めます。",
        "探索を開始する",
        false
      );
    } else {
      this.hasAnomaly = Math.random() < 0.5;

      const msg = customMsg || "異変がないか、ページ内を注意深く確認してください。";
      const msg2 = customMsg2 || "";
      const reviewFlag = (showReview !== null) ? showReview : true;

      this.showTransition(title, msg, msg2, "探索を開始する", reviewFlag);
    }

    if (window.AnomalyManager) {
      window.AnomalyManager.reset();

      if (this.hasAnomaly) {
        const appliedId = window.AnomalyManager.applyRandom();
        if (appliedId) {
          console.log(`[DEBUG] 階層 ${currentStepNum}: 異変あり (No.${appliedId})`);
        } else {
          console.warn(`[DEBUG] 階層 ${currentStepNum}: 異変あり判定ですが、対象の異変が取得できませんでした`);
        }
      } else {
        console.log(`[DEBUG] 階層 ${currentStepNum}: 異変なし`);
      }
    }
  }

  // プレイヤーの選択処理
  makeChoice(playerThinksAnomaly) {
    // 振り返りモード中の場合：選択ボタンを押したら案内画面Aへ戻る
    if (this.isReviewMode) {
      this.isReviewMode = false;
      this.showScreen('screen-transition');
      return;
    }

    // ★重要: 回答ボタンが押された「直前の異変ID」を退避保存しておく
    if (window.AnomalyManager && window.AnomalyManager.activeAnomaly) {
      this.lastAnomalyId = window.AnomalyManager.activeAnomaly.id;
    } else {
      this.lastAnomalyId = null;
    }

    // 初回フラグを解除
    this.isFirstPlay = false;

    // 回答判定
    if (playerThinksAnomaly === this.hasAnomaly) {
      // ---------------- 正解処理 ----------------

      // 異変ありを正しく報告できた場合、図鑑を解放
      if (playerThinksAnomaly === true && window.AnomalyManager && window.AnomalyManager.activeAnomaly) {
        const currentAnomalyId = window.AnomalyManager.activeAnomaly.id;
        if (window.StorageManager) {
          const formattedId = String(currentAnomalyId).padStart(2, '0');
          window.StorageManager.saveUnlockedAnomaly(formattedId);
          console.log(`[DEBUG] 異変報告成功！ 図鑑解放: No.${formattedId}`);
        }
      }

      this.currentStep = Number(this.currentStep) + 1;

      if (window.StorageManager) {
        window.StorageManager.saveMaxStep(this.currentStep);
      }

      if (this.currentStep > this.maxStep) {
        if (window.StorageManager) {
          window.StorageManager.setHasCleared();
        }

        this.showTransition(
          "脱出成功",
          "無事にすべての異変を回避し、市役所から退庁できました。",
          "おめでとうございます。",
          "最初から遊ぶ",
          true
        );
        this.currentStep = 0;
      } else {
        this.updateStage();
      }
    } else {
      // ---------------- 不正解処理 ----------------
      this.currentStep = 0;

      this.updateStage(
        `階層 ${Number(this.currentStep)}`,
        "異変がないか、ページ内を注意深く確認してください。",
        "",
        true
      );
    }
  }
}

// デバッグ用関数（クラス外部に配置）
window.debugSetAnomaly = function (id) {
  if (id === null || id === undefined || id === 0) {
    window.AnomalyManager.reset();
    window.game.hasAnomaly = false;
    window.game.lastAnomalyId = null;
    console.log('[DEBUG] 異変なし状態に設定しました');
  } else {
    window.AnomalyManager.reset();
    const formattedId = String(id).padStart(2, '0');
    const success = window.AnomalyManager.applyById(formattedId);
    if (success) {
      window.game.hasAnomaly = true;
      window.game.lastAnomalyId = formattedId;
      console.log(`[DEBUG] 異変 No.${formattedId} を強制発生させました`);
    } else {
      console.warn(`[DEBUG] 異変 No.${formattedId} の適用に失敗しました`);
    }
  }
};

window.game = new GameLogic();