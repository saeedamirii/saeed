function initWordRecallGame() {
    const view = $('#words-game-view');
    view.html(`
        <button class="back-btn" data-target="game-selection-view">➡️</button>
        <div class="game-container">
            <details class="game-guide"><summary>راهنمای بازی</summary><p>باید <strong>تمام</strong> کلمات را به خاطر بسپاری. با هر مرحله موفق یک جان اضافه ❤️ می‌گیری. با هر شکست یک جان مصرف می‌شود.</p></details>
            <div id="wr-start-view" class="wr-view active">
                 <div class="medals-container"><span id="wr-medal-bronze" class="medal">🥉</span><span id="wr-medal-silver" class="medal">🥈</span><span id="wr-medal-gold" class="medal">🥇</span><span id="wr-medal-master" class="medal">💎</span></div>
                <h1 class="game-title">کلمات گمشده</h1>
                <div class="highscore-box">بالاترین مرحله: <span id="wr-highscore-display">۱</span></div>
                <button id="wr-start-game-btn" class="start-btn">شروع بازی</button>
            </div>
            <div id="wr-memorize-view" class="wr-view">
                <div class="game-stats"><span>مرحله: <span id="wr-level-display">۱</span></span><span>جان اضافه: <span id="wr-lives-display">۰</span> ❤️</span></div>
                <div id="wr-timer-display" class="timer"></div><h2 id="wr-theme-display"></h2>
                <div id="wr-word-list" class="word-list-box"></div>
            </div>
            <div id="wr-recall-view" class="wr-view">
                <div class="recall-header"><h2>کلماتی که یادت میاد رو بنویس:</h2><button id="wr-hint-btn">💡 راهنما (<span id="wr-hint-count">5</span>)</button></div>
                <textarea id="wr-recall-input" rows="10"></textarea><button id="wr-submit-words-btn" class="start-btn">بررسی</button>
            </div>
            <div id="wr-level-complete-view" class="wr-view"><h1 class="level-complete-title">ایول! بریم مرحله بعدی</h1></div>
            <div id="wr-game-over-view" class="wr-view">
                <h1 class="game-over-title">باختی!</h1><p>شما در مرحله <span id="wr-final-level-display"></span> شکست خوردی.</p>
                <div class="results-columns"><div class="column"><h3>✅ درست</h3><ul id="wr-correct-words-list"></ul></div><div class="column"><h3>❌ فراموش شده</h3><ul id="wr-missed-words-list"></ul></div></div>
                <button id="wr-play-again-btn" class="start-btn">بازی مجدد</button>
            </div>
        </div>
    `);

    // Scoped variables and elements
    const scope = {
        views: { start: view.find('#wr-start-view'), memorize: view.find('#wr-memorize-view'), recall: view.find('#wr-recall-view'), levelComplete: view.find('#wr-level-complete-view'), gameOver: view.find('#wr-game-over-view') },
        highscoreDisplay: view.find('#wr-highscore-display'), levelDisplay: view.find('#wr-level-display'), livesDisplay: view.find('#wr-lives-display'),
        timerDisplay: view.find('#wr-timer-display'), themeDisplay: view.find('#wr-theme-display'), wordList: view.find('#wr-word-list'),
        recallInput: view.find('#wr-recall-input'), finalLevelDisplay: view.find('#wr-final-level-display'), hintCountDisplay: view.find('#wr-hint-count'),
        correctWordsList: view.find('#wr-correct-words-list'), missedWordsList: view.find('#wr-missed-words-list'),
        startGameBtn: view.find('#wr-start-game-btn'), submitWordsBtn: view.find('#wr-submit-words-btn'), playAgainBtn: view.find('#wr-play-again-btn'), hintBtn: view.find('#wr-hint-btn'),
        wordBank: { "میوه‌ها": ["سیب","موز","گیلاس","انگور","پرتقال","هلو"], "حیوانات": ["شیر","فیل","ببر","خرس","میمون","گرگ"], "رنگ‌ها": ["قرمز","آبی","سبز","زرد","نارنجی","بنفش"]},
        level: 1, extraLives: 0, hintsLeft: 5, highScore: 1, timer: null, wordsToMemorize: [],
        normalizeWord: (word) => word.trim().replace(/آ/g, 'ا').replace(/ي|ئ/g, 'ی').replace(/ك/g, 'ک').replace(/\s/g, '')
    };
    scope.themes = Object.keys(scope.wordBank);

    function showWrView(viewName) { Object.values(scope.views).forEach(v => v.removeClass('active')); scope.views[viewName].addClass('active'); }
    function updateUI() { scope.levelDisplay.text(scope.level); scope.livesDisplay.text(scope.extraLives); scope.hintCountDisplay.text(scope.hintsLeft); scope.hintBtn.prop('disabled', scope.hintsLeft === 0); scope.highscoreDisplay.text(scope.highScore); }
    function startTimer(duration) {
        let timeLeft = duration; scope.timerDisplay.text(timeLeft).removeClass('danger'); clearInterval(scope.timer);
        scope.timer = setInterval(() => {
            timeLeft--; scope.timerDisplay.text(timeLeft); if (timeLeft < 6) scope.timerDisplay.addClass('danger');
            if (timeLeft <= 0) { clearInterval(scope.timer); showWrView('recall'); }
        }, 1000);
    }
    function startRound() {
        updateUI(); scope.recallInput.val(''); const wordsCount = Math.min(3 + scope.level, 8); const timeToMemorize = Math.max(10, 25 - scope.level);
        const currentTheme = scope.themes[(scope.level - 1) % scope.themes.length]; scope.themeDisplay.text(`موضوع: ${currentTheme}`);
        scope.wordsToMemorize = [...scope.wordBank[currentTheme]].sort(() => 0.5 - Math.random()).slice(0, wordsCount);
        scope.wordList.html(scope.wordsToMemorize.map(word => `<p>${word}</p>`).join(''));
        showWrView('memorize'); startTimer(timeToMemorize);
    }
    function checkResults() {
        const userWords = new Set(scope.recallInput.val().trim().split('\n').filter(Boolean).map(scope.normalizeWord));
        const allCorrect = scope.wordsToMemorize.length === userWords.size && scope.wordsToMemorize.every(word => userWords.has(scope.normalizeWord(word)));
        if (allCorrect) {
            scope.extraLives++; scope.level++; if (scope.level > scope.highScore) { scope.highScore = scope.level; localStorage.setItem('MIND_BATTLE_wordGameHighScore', scope.highScore); }
            showWrView('levelComplete'); setTimeout(() => startRound(), 1500);
        } else {
            if (scope.extraLives > 0) { scope.extraLives--; startRound(); } 
            else {
                scope.finalLevelDisplay.text(scope.level);
                const correct = scope.wordsToMemorize.filter(w => userWords.has(scope.normalizeWord(w)));
                const missed = scope.wordsToMemorize.filter(w => !userWords.has(scope.normalizeWord(w)));
                scope.correctWordsList.html(correct.map(w => `<li>${w}</li>`).join('') || "<li>هیچکدام</li>");
                scope.missedWordsList.html(missed.map(w => `<li>${w}</li>`).join('') || "<li>هیچکدام</li>");
                showWrView('gameOver');
            }
        }
    }
    function useHint() {
        if (scope.hintsLeft <= 0) return;
        const userWords = new Set(scope.recallInput.val().trim().split('\n').filter(Boolean).map(scope.normalizeWord));
        const unrememberedWord = scope.wordsToMemorize.find(word => !userWords.has(scope.normalizeWord(word)));
        if (unrememberedWord) { scope.recallInput.val(scope.recallInput.val() + (scope.recallInput.val().length > 0 ? '\n' : '') + unrememberedWord); scope.hintsLeft--; updateUI(); }
    }
    function initializeGame() {
        scope.level = 1; scope.extraLives = 0; scope.hintsLeft = 5; scope.highScore = localStorage.getItem('MIND_BATTLE_wordGameHighScore') || 1;
        updateUI(); showWrView('start');
    }

    view.on('click', '#wr-start-game-btn', () => { scope.level = 1; scope.extraLives = 0; scope.hintsLeft = 5; startRound(); });
    view.on('click', '#wr-submit-words-btn', checkResults);
    view.on('click', '#wr-play-again-btn', initializeGame);
    view.on('click', '#wr-hint-btn', useHint);
    
    initializeGame();
    return function cleanup() { clearInterval(scope.timer); view.off(); view.empty(); };
}
