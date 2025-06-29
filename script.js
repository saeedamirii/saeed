document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const views = {
        start: document.getElementById('start-view'),
        memorize: document.getElementById('memorize-view'),
        recall: document.getElementById('recall-view'),
        gameOver: document.getElementById('game-over-view'),
    };
    const highscoreDisplay = document.getElementById('highscore-display');
    const levelDisplay = document.getElementById('level-display');
    const livesDisplay = document.getElementById('lives-display');
    const timerDisplay = document.getElementById('timer-display');
    const themeDisplay = document.getElementById('theme-display');
    const wordList = document.getElementById('word-list');
    const recallInput = document.getElementById('recall-input');
    const finalLevelDisplay = document.getElementById('final-level-display');
    
    // Buttons
    const startGameBtn = document.getElementById('start-game-btn');
    const submitWordsBtn = document.getElementById('submit-words-btn');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Game Configuration
    const wordBank = {
        "میوه‌ها": ["سیب", "موز", "گیلاس", "انگور", "پرتقال", "هلو", "توت فرنگی", "آناناس"],
        "حیوانات": ["شیر", "فیل", "ببر", "خرس", "میمون", "گورخر", "زرافه", "گرگ"],
        "رنگ‌ها": ["قرمز", "آبی", "سبز", "زرد", "نارنجی", "بنفش", "سیاه", "سفید"],
        "ورزش‌ها": ["فوتبال", "بسکتبال", "والیبال", "تنیس", "شنا", "دویدن", "کشتی", "ژیمناستیک"],
        "مشاغل": ["پزشک", "معلم", "مهندس", "خلبان", "آشپز", "پلیس", "آتش نشان", "نویسنده"]
    };
    const themes = Object.keys(wordBank);

    // Game State
    let level, extraLives, highScore, timer, wordsToMemorize, currentTheme;

    const showView = (viewName) => {
        Object.values(views).forEach(view => view.classList.remove('active'));
        views[viewName].classList.add('active');
    };

    const updateUI = () => {
        levelDisplay.textContent = level;
        livesDisplay.textContent = extraLives;
        highscoreDisplay.textContent = highScore;
    };

    const startTimer = (duration) => {
        let timeLeft = duration;
        timerDisplay.textContent = timeLeft;
        timerDisplay.classList.remove('danger');
        
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft < 6) timerDisplay.classList.add('danger');
            if (timeLeft <= 0) {
                clearInterval(timer);
                showView('recall');
            }
        }, 1000);
    };

    const startRound = () => {
        updateUI();
        recallInput.value = '';

        // Difficulty scaling
        const wordsCount = Math.min(3 + level, 8);
        const timeToMemorize = Math.max(10, 25 - level);
        
        currentTheme = themes[(level - 1) % themes.length];
        themeDisplay.textContent = `موضوع: ${currentTheme}`;
        
        const shuffled = [...wordBank[currentTheme]].sort(() => 0.5 - Math.random());
        wordsToMemorize = shuffled.slice(0, wordsCount);
        
        wordList.innerHTML = wordsToMemorize.map(word => `<p>${word}</p>`).join('');
        
        showView('memorize');
        startTimer(timeToMemorize);
    };

    const checkResults = () => {
        const userWords = new Set(recallInput.value.trim().split('\n').filter(Boolean));
        let correctCount = 0;
        wordsToMemorize.forEach(word => {
            if (userWords.has(word)) {
                correctCount++;
            }
        });

        const passThreshold = Math.ceil(wordsToMemorize.length * 0.6);

        // --- Game Logic: Passed or Failed ---
        if (correctCount >= passThreshold) { // Passed the level
            // Perfection Bonus: Earn a life
            if (correctCount === wordsToMemorize.length) {
                extraLives++;
            }
            level++;
            if (level > highScore) {
                highScore = level;
                localStorage.setItem('wordGameHighScore', highScore);
            }
            startRound();
        } else { // Failed the level
            if (extraLives > 0) {
                extraLives--;
                // Retry the same level using an extra life
                startRound();
            } else {
                // Game Over
                finalLevelDisplay.textContent = level;
                showView('gameOver');
            }
        }
    };
    
    const initializeGame = () => {
        level = 1;
        extraLives = 0; // Start with 0 extra lives
        highScore = localStorage.getItem('wordGameHighScore') || 1;
        updateUI();
        showView('start');
    };

    // Event Listeners
    startGameBtn.addEventListener('click', () => {
        level = 1; // Reset level for new game
        extraLives = 0;
        startRound();
    });
    submitWordsBtn.addEventListener('click', checkResults);
    playAgainBtn.addEventListener('click', initializeGame);

    // Initial Load
    initializeGame();
});

