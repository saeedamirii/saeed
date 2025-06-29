function initWordRecallGame() {
    const view = $('#words-game-view');
    view.html(`
        <button class="back-btn" data-target="game-selection-view">➡️</button>
        <div class="game-container">
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

    const wrViews = { start: view.find('#wr-start-view'), memorize: view.find('#wr-memorize-view'), recall: view.find('#wr-recall-view'), levelComplete: view.find('#wr-level-complete-view'), gameOver: view.find('#wr-game-over-view') };
    const highscoreDisplay = view.find('#wr-highscore-display'), levelDisplay = view.find('#wr-level-display'), livesDisplay = view.find('#wr-lives-display'),
          timerDisplay = view.find('#wr-timer-display'), themeDisplay = view.find('#wr-theme-display'), wordList = view.find('#wr-word-list'),
          recallInput = view.find('#wr-recall-input'), finalLevelDisplay = view.find('#wr-final-level-display'), hintCountDisplay = view.find('#wr-hint-count'),
          correctWordsList = view.find('#wr-correct-words-list'), missedWordsList = view.find('#wr-missed-words-list');
    const startGameBtn = view.find('#wr-start-game-btn'), submitWordsBtn = view.find('#wr-submit-words-btn'), playAgainBtn = view.find('#wr-play-again-btn'), hintBtn = view.find('#wr-hint-btn');
    
    const wordBank = {"میوه‌ها": ["سیب","موز","گیلاس","انگور","پرتقال","هلو","توت فرنگی","آناناس","هندوانه"],"حیوانات": ["شیر","فیل","ببر","خرس","میمون","گورخر","زرافه","گرگ","روباه"], "رنگ‌ها": ["قرمز","آبی","سبز","زرد","نارنجی","بنفش","سیاه","سفید","قهوه‌ای"]};
    const themes = Object.keys(wordBank);
    let level, extraLives, hintsLeft, highScore, timer, wordsToMemorize;
    const normalizeWord = (word) => word.trim().replace(/آ/g, 'ا').replace(/ي|ئ/g, 'ی').replace(/ك/g, 'ک').replace(/\s/g, '');

    const showWrView = (viewName) => { Object.values(wrViews).forEach(v => v.removeClass('active')); wrViews[viewName].addClass('active'); };
    function updateUI() { levelDisplay.text(level); livesDisplay.text(extraLives); hintCountDisplay.text(hintsLeft); hintBtn.prop('disabled', hintsLeft === 0); highscoreDisplay.text(highScore); }

    function startTimer(duration) {
        let timeLeft = duration; timerDisplay.text(timeLeft); timerDisplay.removeClass('danger'); clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--; timerDisplay.text(timeLeft); if (timeLeft < 6) timerDisplay.addClass('danger');
            if (timeLeft <= 0) { clearInterval(timer); showWrView('recall'); }
        }, 1000);
    }
    function startRound() {
        updateUI(); recallInput.val(''); const wordsCount = Math.min(3 + level, 8); const timeToMemorize = Math.max(10, 25 - level);
        const currentTheme = themes[(level - 1) % themes.length]; themeDisplay.text(`موضوع: ${currentTheme}`);
        wordsToMemorize = [...wordBank[currentTheme]].sort(() => 0.5 - Math.random()).slice(0, wordsCount);
        wordList.html(wordsToMemorize.map(word => `<p>${word}</p>`).join(''));
        showWrView('memorize'); startTimer(timeToMemorize);
    }
    function checkResults() {
        const userWords = new Set(recallInput.val().trim().split('\n').filter(Boolean).map(normalizeWord));
        const allCorrect = wordsToMemorize.length === userWords.size && wordsToMemorize.every(word => userWords.has(normalizeWord(word)));
        if (allCorrect) {
            extraLives++; level++; if (level > highScore) { highScore = level; localStorage.setItem('MIND_BATTLE_wordGameHighScore', highScore); }
            showWrView('levelComplete'); setTimeout(() => startRound(), 1500);
        } else {
            if (extraLives > 0) { extraLives--; startRound(); } 
            else {
                finalLevelDisplay.text(level);
                const correct = wordsToMemorize.filter(w => userWords.has(normalizeWord(w)));
                const missed = wordsToMemorize.filter(w => !userWords.has(normalizeWord(w)));
                correctWordsList.html(correct.map(w => `<li>${w}</li>`).join('') || "<li>هیچکدام</li>");
                missedWordsList.html(missed.map(w => `<li>${w}</li>`).join('') || "<li>هیچکدام</li>");
                showWrView('gameOver');
            }
        }
    }
    function useHint() {
        if (hintsLeft <= 0) return;
        const userWords = new Set(recallInput.val().trim().split('\n').filter(Boolean).map(normalizeWord));
        const unrememberedWord = wordsToMemorize.find(word => !userWords.has(normalizeWord(word)));
        if (unrememberedWord) { recallInput.val(recallInput.val() + (recallInput.val().length > 0 ? '\n' : '') + unrememberedWord); hintsLeft--; updateUI(); }
    }
    function initializeGame() {
        level = 1; extraLives = 0; hintsLeft = 5; highScore = localStorage.getItem('MIND_BATTLE_wordGameHighScore') || 1;
        updateUI(); showWrView('start');
    }

    view.on('click', '#wr-start-game-btn', () => { level = 1; extraLives = 0; hintsLeft = 5; startRound(); });
    view.on('click', '#wr-submit-words-btn', checkResults);
    view.on('click', '#wr-play-again-btn', initializeGame);
    view.on('click', '#wr-hint-btn', useHint);
    
    initializeGame();
    return function cleanup() { clearInterval(timer); view.off(); view.empty(); };
}
