document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const levelDisplay = document.getElementById('level-display');
    const highscoreDisplay = document.getElementById('highscore-display');
    const displayText = document.getElementById('display-text');
    const sequenceInput = document.getElementById('sequence-input');
    const submitBtn = document.getElementById('sequence-submit-btn');
    const startBtn = document.getElementById('start-sequence-btn');
    const messageDisplay = document.getElementById('message-display');

    // --- Game State Variables ---
    let level = 1;
    let sequence = [];
    let isPlaying = false; // Is the sequence currently being shown?
    let highScore = localStorage.getItem('sequenceHighScore') || 0;

    // --- Utility Functions ---
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const updateUI = () => {
        levelDisplay.textContent = level;
        highscoreDisplay.textContent = highScore;
    };

    // --- Core Game Logic ---
    const generateSequence = () => {
        sequence = [];
        for (let i = 0; i < level; i++) {
            sequence.push(Math.floor(Math.random() * 9) + 1); // Numbers 1-9
        }
    };

    const displaySequence = async () => {
        isPlaying = true;
        startBtn.disabled = true;
        sequenceInput.disabled = true;
        submitBtn.disabled = true;
        
        await sleep(1000); // Pause before showing the sequence

        for (const num of sequence) {
            displayText.textContent = num;
            await sleep(600); // Time number is visible
            displayText.textContent = '';
            await sleep(200); // Time between numbers
        }

        displayText.textContent = '؟';
        sequenceInput.disabled = false;
        sequenceInput.focus();
        submitBtn.disabled = false;
        isPlaying = false;
    };

    const handleCorrectAnswer = () => {
        level++;
        if (level > highScore) {
            highScore = level -1; // Update high score to the last completed level
            localStorage.setItem('sequenceHighScore', highScore);
        }
        messageDisplay.textContent = 'عالی بود! میریم مرحله بعد...';
        messageDisplay.className = 'message correct';
        updateUI();

        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message';
            startRound();
        }, 1500);
    };

    const handleWrongAnswer = () => {
        messageDisplay.textContent = `اشتباه بود! دنباله صحیح: ${sequence.join('')}`;
        messageDisplay.className = 'message wrong';
        level = 1;
        
        // Let the user see the message, then reset
        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message';
            displayText.textContent = 'دوباره تلاش کن!';
            startBtn.disabled = false;
            startBtn.textContent = 'شروع مجدد';
        }, 3000);
    };

    const checkAnswer = () => {
        const userAnswer = sequenceInput.value;
        if (userAnswer === sequence.join('')) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
        sequenceInput.value = '';
        sequenceInput.disabled = true;
        submitBtn.disabled = true;
    };
    
    const startRound = () => {
        generateSequence();
        displaySequence();
    };

    const startGame = () => {
        level = 1;
        updateUI();
        startBtn.textContent = 'شروع';
        startRound();
    };

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    sequenceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            checkAnswer();
        }
    });

    // --- Initial Load ---
    updateUI();
});
