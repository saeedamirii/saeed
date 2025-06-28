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
    const medals = {
        bronze: document.getElementById('medal-bronze'),
        silver: document.getElementById('medal-silver'),
        gold: document.getElementById('medal-gold'),
        master: document.getElementById('medal-master'),
    };

    // Game State
    let level = 1, sequence = [], lives = 3, hintChances = 5, isPlaying = false;
    let highScore = localStorage.getItem('sequenceHighScore') || 0;
    let achievements = JSON.parse(localStorage.getItem('sequenceAchievements')) || { bronze: false, silver: false, gold: false, master: false };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const updateMainUI = () => {
        levelDisplay.textContent = level;
        highscoreDisplay.textContent = highScore;
        hintCountDisplay.textContent = hintChances;
        updateLivesUI();
        updateMedalsUI();
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

    const updateMedalsUI = () => {
        for (const medalKey in achievements) {
            if (achievements[medalKey]) {
                medals[medalKey].classList.add('unlocked');
            }
        }
    };

    const checkAndUnlockMedal = (completedLevel) => {
        let newUnlock = false;
        if (completedLevel >= 5 && !achievements.bronze) { achievements.bronze = true; newUnlock = true; }
        if (completedLevel >= 10 && !achievements.silver) { achievements.silver = true; newUnlock = true; }
        if (completedLevel >= 15 && !achievements.gold) { achievements.gold = true; newUnlock = true; }
        if (completedLevel >= 20 && !achievements.master) { achievements.master = true; newUnlock = true; }
        
        if (newUnlock) {
            localStorage.setItem('sequenceAchievements', JSON.stringify(achievements));
            updateMedalsUI();
            return true; // نشان می‌دهد که مدال جدید باز شده
        }
        return false;
    };
    
    const updateFakeInput = (htmlContent = '') => { fakeInput.innerHTML = htmlContent || `<span>${sequenceInput.value.split('').join('</span><span>')}</span>`; };

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
    
    // =================================================================
    // ### رفع باگ اصلی اینجاست ###
    // =================================================================
    const handleCorrectAnswer = () => {
        const completedLevel = level;
        level++;
        if (completedLevel > highScore) {
            highScore = completedLevel;
            localStorage.setItem('sequenceHighScore', highScore);
        }
        
        updateMainUI(); 
        setInputsDisabled(true); // غیرفعال کردن اینپوت تا مرحله بعد
        
        const newMedalUnlocked = checkAndUnlockMedal(completedLevel);

        if (newMedalUnlocked) {
            messageDisplay.textContent = 'مدال جدید باز شد!';
            messageDisplay.className = 'message unlock';
        } else {
            messageDisplay.textContent = 'عالی بود بریم مرحله بعد';
            messageDisplay.className = 'message correct';
        }
        
        setTimeout(() => {
            resetRoundState();
            startRound();
        }, 1500);
    };

    const handleWrongAnswer = () => {
        if (hintChances > 0) {
            hintChances--;
            messageDisplay.textContent = 'اشتباه بود! از راهنمای خودکار استفاده شد.';
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
        
        } else {
            lives--;
            updateMainUI();
            if (lives > 0) {
                messageDisplay.textContent = `فرصت راهنما تمام شد! یک جان از دست دادی.`;
                messageDisplay.className = 'message wrong';
                setInputsDisabled(true);
                setTimeout(() => {
                    resetRoundState();
                    startRound();
                }, 2000); 
            } else {
                messageDisplay.textContent = `باختی! دنباله صحیح: ${sequence.join('')}`;
                messageDisplay.className = 'message wrong';
                displayText.textContent = 'GAME OVER';
                setInputsDisabled(true);
            }
        }
        updateMainUI();
    };

    const checkAnswer = () => { (sequenceInput.value === sequence.join('')) ? handleCorrectAnswer() : handleWrongAnswer(); };
    const setInputsDisabled = (state) => { submitBtn.disabled = state; sequenceInput.disabled = state; };
    const resetRoundState = () => {
        messageDisplay.textContent = '';
        messageDisplay.className = 'message';
        sequenceInput.value = '';
        updateFakeInput();
    };

    const startRound = () => {
        sequence = [];
        for (let i = 0; i < level; i++) sequence.push(Math.floor(Math.random() * 9) + 1);
        displaySequence();
    };
    
    const startGame = () => {
        level = 1;
        lives = 3;
        hintChances = 5;
        startBtn.textContent = 'شروع مجدد';
        updateMainUI();
        startRound();
    };

    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    sequenceInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submitBtn.disabled) checkAnswer(); });
    sequenceInput.addEventListener('input', () => {
        updateFakeInput();
        submitBtn.disabled = sequenceInput.value.length !== sequence.length;
    });

    // --- Initial Load ---
    updateMainUI();
});
