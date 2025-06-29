document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = {
        start: document.getElementById('start-view'),
        memorize: document.getElementById('memorize-view'),
        recall: document.getElementById('recall-view'),
        levelComplete: document.getElementById('level-complete-view'),
        gameOver: document.getElementById('game-over-view'),
    };
    const medals = {
        bronze: document.getElementById('medal-bronze'),
        silver: document.getElementById('medal-silver'),
        gold: document.getElementById('medal-gold'),
        master: document.getElementById('medal-master'),
    };
    // Displays
    const highscoreDisplay = document.getElementById('highscore-display');
    const levelDisplay = document.getElementById('level-display');
    const livesDisplay = document.getElementById('lives-display');
    const timerDisplay = document.getElementById('timer-display');
    const themeDisplay = document.getElementById('theme-display');
    const wordList = document.getElementById('word-list');
    const recallInput = document.getElementById('recall-input');
    const finalLevelDisplay = document.getElementById('final-level-display');
    const hintCountDisplay = document.getElementById('hint-count');
    const correctWordsList = document.getElementById('correct-words-list');
    const missedWordsList = document.getElementById('missed-words-list');
    // Buttons
    const startGameBtn = document.getElementById('start-game-btn');
    const submitWordsBtn = document.getElementById('submit-words-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const hintBtn = document.getElementById('hint-btn');

    // --- Game Configuration: Expanded Word Bank ---
    const wordBank = {
        "میوه‌ها": ["سیب", "موز", "گیلاس", "انگور", "پرتقال", "هلو", "توت فرنگی", "آناناس", "هندوانه", "انار", "خربزه", "کیوی", "لیمو", "نارگیل", "زردآلو"],
        "حیوانات": ["شیر", "فیل", "ببر", "خرس", "میمون", "گورخر", "زرافه", "گرگ", "روباه", "اسب", "گوسفند", "عقاب", "تمساح", "کوالا", "پنگوئن"],
        "رنگ‌ها": ["قرمز", "آبی", "سبز", "زرد", "نارنجی", "بنفش", "سیاه", "سفید", "صورتی", "قهوه‌ای", "خاکستری", "فیروزه‌ای", "طلایی", "نقره‌ای", "بژ"],
        "ورزش‌ها": ["فوتبال", "بسکتبال", "والیبال", "تنیس", "شنا", "دویدن", "کشتی", "ژیمناستیک", "بوکس", "کاراته", "اسکی", "دوچرخه سواری", "وزنه برداری", "قایقرانی", "شطرنج"],
        "مشاغل": ["پزشک", "معلم", "مهندس", "خلبان", "آشپز", "پلیس", "آتش نشان", "نویسنده", "وکیل", "دانشمند", "بازیگر", "نقاش", "مکانیک", "کشاورز", "خبرنگار"],
        "طبیعت": ["کوهستان", "رودخانه", "آبشار", "بیابان", "اقیانوس", "جنگل", "ستاره", "ماه", "خورشید", "ابر", "رعد و برق", "چشمه", "دریاچه", "آتشفشان", "کهکشان"],
        "اشیاء": ["صندلی", "میز", "کامپیوتر", "موبایل", "ساعت", "پنجره", "کتاب", "لامپ", "دوربین", "تلفن", "تختخواب", "آینه", "قاشق", "چنگال", "چاقو"],
        "غذاها": ["پیتزا", "همبرگر", "ماکارونی", "کباب", "قرمه سبزی", "جوجه", "سوپ", "سالاد", "برنج", "نان", "تخم مرغ", "پنیر", "ماست", "کره", "عسل"]
    };
    const themes = Object.keys(wordBank);
    const allWords = Object.values(wordBank).flat();

    // --- Game State ---
    let level, extraLives, hintsLeft, highScore, timer, wordsToMemorize, currentTheme;
    let achievements = JSON.parse(localStorage.getItem('wordGameAchievements')) || { bronze: false, silver: false, gold: false, master: false };

    // =================================================================
    // ### تابع جدید و کلیدی استانداردسازی ###
    // =================================================================
    const normalizeWord = (word) => {
        if (!word) return '';
        return word
            .trim() // حذف فاصله‌های اضافی از ابتدا و انتها
            .replace(/ي/g, 'ی') // تبدیل 'ي' عربی به 'ی' فارسی
            .replace(/ك/g, 'ک') // تبدیل 'ك' عربی به 'ک' فارسی
            .replace(/\s/g, ''); // حذف تمام فاصله‌های داخلی (برای کلمات چند بخشی)
    };

    // --- Functions ---
    const showView = (viewName) => {
        Object.values(views).forEach(view => view.classList.remove('active'));
        views[viewName].classList.add('active');
    };
    
    const updateUI = () => {
        levelDisplay.textContent = level;
        livesDisplay.textContent = extraLives;
        hintCountDisplay.textContent = hintsLeft;
        hintBtn.disabled = hintsLeft === 0;
        highscoreDisplay.textContent = highScore;
        updateMedalsUI();
    };
    
    const updateMedalsUI = () => {
        for (const medalKey in achievements) {
            if (achievements[medalKey]) medals[medalKey].classList.add('unlocked');
        }
    };
    
    const checkAndUnlockMedal = () => {
        const completedLevel = level;
        if (completedLevel >= 5 && !achievements.bronze) achievements.bronze = true;
        if (completedLevel >= 10 && !achievements.silver) achievements.silver = true;
        if (completedLevel >= 15 && !achievements.gold) achievements.gold = true;
        if (completedLevel >= 20 && !achievements.master) achievements.master = true;
        localStorage.setItem('wordGameAchievements', JSON.stringify(achievements));
        updateMedalsUI();
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
        const wordsCount = Math.min(4 + level, 12);
        const timeToMemorize = Math.max(10, 30 - level);
        
        if (level > 10) {
            currentTheme = "ترکیبی 🤯";
            const shuffled = [...new Set(allWords)].sort(() => 0.5 - Math.random());
            wordsToMemorize = shuffled.slice(0, wordsCount);
        } else {
            currentTheme = themes[(level - 1) % themes.length];
            const shuffled = [...wordBank[currentTheme]].sort(() => 0.5 - Math.random());
            wordsToMemorize = shuffled.slice(0, wordsCount);
        }
        
        themeDisplay.textContent = `موضوع: ${currentTheme}`;
        wordList.innerHTML = wordsToMemorize.map(word => `<p>${word}</p>`).join('');
        showView('memorize');
        startTimer(timeToMemorize);
    };

    const checkResults = () => {
        // استانداردسازی کلمات کاربر قبل از مقایسه
        const userWords = new Set(recallInput.value.trim().split('\n').filter(Boolean).map(normalizeWord));
        // استانداردسازی کلمات اصلی برای مقایسه
        const normalizedOriginalWords = new Set(wordsToMemorize.map(normalizeWord));

        if (userWords.size === wordsToMemorize.length && wordsToMemorize.every(word => userWords.has(normalizeWord(word)))) {
            // --- Passed the level ---
            extraLives++;
            checkAndUnlockMedal();
            level++;
            if (level > highScore) {
                highScore = level;
                localStorage.setItem('wordGameHighScore', highScore);
            }
            showView('levelComplete');
            setTimeout(() => startRound(), 1500);
        } else {
            // --- Failed the level ---
            if (extraLives > 0) {
                extraLives--;
                startRound();
            } else {
                // Game Over
                finalLevelDisplay.textContent = level;
                const correctWords = wordsToMemorize.filter(word => userWords.has(normalizeWord(word)));
                const missedWords = wordsToMemorize.filter(word => !userWords.has(normalizeWord(word)));
                correctWordsList.innerHTML = correctWords.map(word => `<li>${word}</li>`).join('') || "<li>هیچکدام</li>";
                missedWordsList.innerHTML = missedWords.map(word => `<li>${word}</li>`).join('') || "<li>هیچکدام</li>";
                showView('gameOver');
            }
        }
    };
    
    const useHint = () => {
        if (hintsLeft <= 0) return;
        const userWords = new Set(recallInput.value.trim().split('\n').filter(Boolean).map(normalizeWord));
        const unrememberedWord = wordsToMemorize.find(word => !userWords.has(normalizeWord(word)));
        
        if (unrememberedWord) {
            recallInput.value += (recallInput.value.length > 0 ? '\n' : '') + unrememberedWord;
            hintsLeft--;
            updateUI();
        }
    };
    
    const initializeGame = () => {
        level = 1;
        extraLives = 0;
        hintsLeft = 5;
        highScore = localStorage.getItem('wordGameHighScore') || 1;
        updateUI();
        showView('start');
    };

    // Event Listeners
    startGameBtn.addEventListener('click', () => {
        level = 1;
        extraLives = 0;
        hintsLeft = 5;
        startRound();
    });
    submitWordsBtn.addEventListener('click', checkResults);
    playAgainBtn.addEventListener('click', initializeGame);
    hintBtn.addEventListener('click', useHint);

    // Initial Load
    initializeGame();
});
            
