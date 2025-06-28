document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const levelDisplay = document.getElementById('level-display');
    const highscoreDisplay = document.getElementById('highscore-display');
    const livesDisplay = document.getElementById('lives-display'); // New
    const displayText = document.getElementById('display-text');
    const sequenceInput = document.getElementById('sequence-input');
    const submitBtn = document.getElementById('sequence-submit-btn');
    const startBtn = document.getElementById('start-sequence-btn');
    const messageDisplay = document.getElementById('message-display');

    // --- Game State Variables ---
    let level = 1;
    let sequence = [];
    let lives = 3; // New
    let isPlaying = false; 
    let highScore = localStorage.getItem('sequenceHighScore') || 0;

    // --- Utility Functions ---
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const updateUI = () => {
        levelDisplay.textContent = level;
        highscoreDisplay.textContent = highScore;
        updateLivesUI();
    };

    // New function to render hearts
    const updateLivesUI = () => {
        livesDisplay.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const heart = document.createElement('span');
            heart.classList.add('heart');
            if (i > lives) {
                heart.classList.add('lost');
            }
            heart.textContent = '♥';
            livesDisplay.appendChild(heart);
        }
    };

    // --- Core Game Logic ---
    const generateSequence = () => {
        sequence = [];
        for (let i = 0; i < level; i++) {
            sequence.push(Math.floor(Math.random() * 9) + 1);
        }
    };

    const displaySequence = async () => {
        isPlaying = true;
        startBtn.disabled = true;
        sequenceInput.disabled = true;
        submitBtn.disabled = true;
        
        displayText.textContent = 'آماده؟';
        await sleep(1000);

        for (const num of sequence) {
            displayText.textContent = num;
            await sleep(600);
            displayText.textContent = '';
            await sleep(200);
        }

        displayText.textContent = '؟';
        sequenceInput.disabled = false;
        sequenceInput.focus();
        submitBtn.disabled = false;
        isPlaying = false;
    };

    const handleCorrectAnswer = () => {
        level++;
        if (level-1 > highScore) { // Update high score for the level just completed
            highScore = level - 1;
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

    // This function is heavily modified
    const handleWrongAnswer = () => {
        lives--;
        updateLivesUI();
        messageDisplay.className = 'message wrong';

        if (lives > 0) {
            messageDisplay.textContent = `اشتباه بود! ${lives} جان دیگر باقیست.`;
            // Let the player try the same level again
            setTimeout(() => {
                messageDisplay.textContent = 'دوباره به دنباله دقت کن...';
                messageDisplay.className = 'message';
                displaySequence(); // Re-display the same sequence
            }, 2000);
        } else {
            // Game Over
            messageDisplay.textContent = `بازی تمام شد! دنباله صحیح: ${sequence.join('')}`;
            displayText.textContent = 'GAME OVER';
            level = 1;
            lives = 3;
            startBtn.disabled = false;
            startBtn.textContent = 'شروع مجدد';
        }
    };

    const checkAnswer = () => {
        const userAnswer = sequenceInput.value;
        sequenceInput.disabled = true;
        submitBtn.disabled = true;
        
        if (userAnswer === sequence.join('')) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
        sequenceInput.value = '';
    };
    
    const startRound = () => {
        generateSequence();
        displaySequence();
    };

    // Modified to reset lives on new game
    const startGame = () => {
        level = 1;
        lives = 3; 
        messageDisplay.textContent = '';
        messageDisplay.className = 'message';
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
