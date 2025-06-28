document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = document.querySelectorAll('.view');
    const startGameBtn = document.getElementById('start-game-btn');
    const timerDisplay = document.getElementById('timer-display');
    const wordList = document.getElementById('word-list');
    const recallInput = document.getElementById('recall-input');
    const submitWordsBtn = document.getElementById('submit-words-btn');
    const scoreDisplay = document.getElementById('score-display');
    const correctWordsList = document.getElementById('correct-words-list');
    const missedWordsList = document.getElementById('missed-words-list');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Game Configuration ---
    const wordBank = ["خورشید", "کتاب", "دریا", "جنگل", "کامپیوتر", "کهکشان", "فضاپیما", "انرژی", "دانشگاه", "قلم", "آزادی", "فرهنگ", "تاریخ", "اقتصاد", "آینده", "موسیقی", "نقاشی", "سیاره", "باران", "دوستی"];
    const wordsPerRound = 7;
    const memorizationTime = 20;

    // --- Game State ---
    let wordsToMemorize = [];
    let timer;
    let timeLeft = memorizationTime;

    // --- Functions ---
    const showView = (viewId) => {
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    };

    const selectRandomWords = () => {
        const shuffled = [...wordBank].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, wordsPerRound);
    };

    const startTimer = () => {
        timeLeft = memorizationTime;
        timerDisplay.textContent = timeLeft;
        timerDisplay.classList.remove('danger');
        
        clearInterval(timer); // Clear any existing timer
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft < 6) {
                timerDisplay.classList.add('danger');
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                showView('recall-view');
            }
        }, 1000);
    };

    const calculateAndShowResults = () => {
        const userWords = recallInput.value.trim().split('\n').filter(word => word.trim() !== '');
        const userWordsSet = new Set(userWords.map(word => word.trim()));
        const originalWordsSet = new Set(wordsToMemorize);
        
        const correctWords = [];
        const missedWords = [];

        originalWordsSet.forEach(word => {
            if (userWordsSet.has(word)) {
                correctWords.push(word);
            } else {
                missedWords.push(word);
            }
        });

        scoreDisplay.textContent = `شما ${correctWords.length} از ${wordsPerRound} کلمه را درست به یاد آوردید.`;
        
        correctWordsList.innerHTML = correctWords.map(word => `<li>${word}</li>`).join('');
        missedWordsList.innerHTML = missedWords.map(word => `<li>${word}</li>`).join('');
        
        showView('results-view');
    };

    const startGame = () => {
        wordsToMemorize = selectRandomWords();
        wordList.innerHTML = wordsToMemorize.map(word => `<p>${word}</p>`).join('');
        recallInput.value = '';
        showView('memorize-view');
        startTimer();
    };

    // --- Event Listeners ---
    startGameBtn.addEventListener('click', startGame);
    submitWordsBtn.addEventListener('click', calculateAndShowResults);
    playAgainBtn.addEventListener('click', () => showView('start-view'));

});
