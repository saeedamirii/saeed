document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const levelDisplay = document.getElementById('level-display');
    const highscoreDisplay = document.getElementById('highscore-display');
    const livesDisplay = document.getElementById('lives-display');
    const hintCountDisplay = document.getElementById('hint-count');
    const displayText = document.getElementById('display-text');
    const sequenceInput = document.getElementById('sequence-input');
    const fakeInput = document.getElementById('fake-input');
    const submitBtn = document.getElementById('sequence-submit-btn');
    const startBtn = document.getElementById('start-sequence-btn');
    const messageDisplay = document.getElementById('message-display');

    // Game State
    let level = 1, sequence = [], lives = 3, hintChances = 5, isPlaying = false;
    let highScore = localStorage.getItem('sequenceHighScore') || 0;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const updateMainUI = () => {
        levelDisplay.textContent = level;
        highscoreDisplay.textContent = highScore;
        hintCountDisplay.textContent = hintChances;
        updateLivesUI();
    };

    const updateLivesUI = () => {
        livesDisplay.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const heart = document.createElement('span');
            heart.classList.add('heart');
            if (i > lives) heart.classList.add('lost');
            heart.textContent = '♥';
            livesDisplay.appendChild(heart);
        }
    };

    const updateFakeInput = (htmlContent = '') => {
        fakeInput.innerHTML = htmlContent || `<span>${sequenceInput.value.split('').join('</span><span>')}</span>`;
    };

    const displaySequence = async () => {
        isPlaying = true;
        setInputsDisabled(true);
        displayText.textContent = 'آماده؟';
        await sleep(1000);
        
        const displayTime = Math.max(300, 800 - (level * 30));
        const pauseTime = Math.max(150, 400 - (level * 15));
        
        for (const num of sequence) {
            displayText.textContent = num;
            await sleep(displayTime);
            displayText.textContent = '';
            await sleep(pauseTime);
        }

        displayText.textContent = '؟';
        isPlaying = false;
        setInputsDisabled(false);
        sequenceInput.focus();
    };
    
    const handleCorrectAnswer = () => {
        level++;
        if (level - 1 > highScore) {
            highScore = level - 1;
            localStorage.setItem('sequenceHighScore', highScore);
        }
        messageDisplay.textContent = 'عالی بود! میریم مرحله بعد...';
        messageDisplay.className = 'message correct';
        resetRoundState();
        setTimeout(startRound, 1500);
    };

    const handleWrongAnswer = () => {
        // Tier 1: Use Hint Chances
        if (hintChances > 0) {
            hintChances--;
            messageDisplay.textContent = 'اشتباه بود! از راهنما استفاده شد.';
            messageDisplay.className = 'message wrong';

            const userAnswer = sequenceInput.value.split('');
            const correctSequenceChars = sequence.join('').split('');
            let coloredHTML = '';

            for (let i = 0; i < correctSequenceChars.length; i++) {
                const char = (i < userAnswer.length) ? userAnswer[i] : '_';
                const charClass = (i < userAnswer.length && userAnswer[i] === correctSequenceChars[i]) ? 'char-correct' : 'char-wrong';
                coloredHTML += `<span class="${charClass}">${char}</span>`;
            }
            updateFakeInput(coloredHTML);
        
        // Tier 2: Lose a Life
        } else {
            lives--;
            if (lives > 0) {
                messageDisplay.textContent = `فرصت راهنما تمام شد! یک جان از دست دادی.`;
                messageDisplay.className = 'message wrong';
                resetRoundState();
                setTimeout(startRound, 2000); // Restart same level
            } else {
                // Tier 3: Game Over
                messageDisplay.textContent = `بازی تمام شد! دنباله صحیح: ${sequence.join('')}`;
                displayText.textContent = 'GAME OVER';
                setInputsDisabled(true);
                startBtn.disabled = false;
                startBtn.textContent = 'شروع مجدد';
            }
        }
        updateMainUI();
    };

    const checkAnswer = () => {
        if (sequenceInput.value === sequence.join('')) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
    };
    
    const setInputsDisabled = (state) => {
        submitBtn.disabled = state;
        sequenceInput.disabled = state;
    };
    
    const resetRoundState = () => {
        messageDisplay.textContent = '';
        messageDisplay.className = 'message';
        sequenceInput.value = '';
        updateFakeInput();
    };

    const startRound = () => {
        sequence = [];
        for (let i = 0; i < level; i++) sequence.push(Math.floor(Math.random() * 9) + 1);
        resetRoundState();
        displaySequence();
    };

    const startGame = () => {
        level = 1;
        lives = 3;
        hintChances = 5;
        startBtn.disabled = true;
        updateMainUI();
        startRound();
    };

    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    sequenceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !submitBtn.disabled) checkAnswer();
    });
    sequenceInput.addEventListener('input', () => {
        updateFakeInput();
        submitBtn.disabled = sequenceInput.value.length !== sequence.length;
    });

    updateMainUI();
});
