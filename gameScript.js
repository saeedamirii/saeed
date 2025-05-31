$(document).ready(function() {
    // --- Global Variables & DOM Elements ---
    const em = ["💐","🌹","🌻","🏵️","🌺","🌴","🌈","🍓","🍒","🍎","🍉","🍊","🥭","🍍","🍋","🍏","🍐","🥝","🍇","🥥","🍅","🌶️","🍄","🧅","🥦","🥑","🍔","🍕","🧁","🎂","🍬","🍩","🍫","🎈"];
    let currentEmojis = [];
    let firstCard = null, secondCard = null;
    let lockBoard = false; 
    let moves = 0;
    let matchesFound = 0;
    let totalPairs = 0;
    let timerInterval;
    let seconds = 0, minutes = 0;
    let currentGameTimeInSeconds = 0;
    let gameMode = ""; 
    let activeGameType = null; 

    const themeToggleButton = $('#theme-toggle-button');
    const achievementsButton = $('#achievements-button');
    const musicToggleButton = $('#music-toggle-button');
    const bodyElement = $('body');
    const gameBoardElement = $('#game-board');
    const toastNotification = $('#toast-notification');
    const modalContent = $('#modal-content');
    const overlay = $('#overlay');
    const backgroundMusic = document.getElementById('background-music');

    const gameStatsHUD = $('#game-stats'); 
    const patternChallengeHUD = $('#pattern-challenge-hud'); 
    const hudStage = $('#hud-stage');
    const hudScore = $('#hud-score');
    const hudLives = $('#hud-lives');

    // --- Pattern Challenge Mode Variables ---
    let currentPatternStage = 1;
    let patternLives = 3;
    let patternScore = 0; 
    let mistakesThisPatternAttempt = 0;
    let currentPatternToGuess = [];
    let playerPatternGuess = [];
    let patternBoardLock = false; 
    const PATTERN_HIGHLIGHT_DURATION = 1200; // کاهش یافت به ۱.۲ ثانیه

    // --- Music Toggle Logic ---
    if (musicToggleButton.length && backgroundMusic) {
        musicToggleButton.on('click', function() {
            if (backgroundMusic.paused) {
                backgroundMusic.play()
                    .then(() => {
                        musicToggleButton.text('⏸️').attr('title', 'قطع موزیک').addClass('pulsating-music');
                    })
                    .catch(error => console.error("Error playing music:", error));
            } else {
                backgroundMusic.pause();
                musicToggleButton.text('🎵').attr('title', 'پخش موزیک').removeClass('pulsating-music');
            }
        });
    }

    // --- Achievements Logic ---
    let achievements = {
        'first_win':    { id: 'first_win',    name: 'اولین پیروزی',      description: 'اولین بازی حافظه (جفتی) خود را با موفقیت تمام کنید.', icon: '🥇', unlocked: false, check: () => totalGamesWon === 1 },
        'explorer_4x4': { id: 'explorer_4x4', name: 'کاشف باتجربه',     description: 'حالت بازی حافظه 4x4 را کامل کنید.',                              icon: '🗺️', unlocked: false, check: (mode) => mode === '4x4' },
        'master_6x6':   { id: 'master_6x6',   name: 'استاد بزرگ حافظه',  description: 'حالت بازی حافظه 6x6 را کامل کنید.',                              icon: '🏆', unlocked: false, check: (mode) => mode === '6x6' },
        'combo_3':      { id: 'combo_3',      name: 'ضربات متوالی',      description: 'در بازی حافظه، ۳ جفت را پشت سر هم و بدون اشتباه پیدا کنید.', icon: '⚡', unlocked: false, check: () => consecutiveMatches >= 3 },
        'loyal_player': { id: 'loyal_player', name: 'بازیکن وفادار',      description: 'در مجموع ۵ بازی حافظه (جفتی) کامل انجام دهید.',             icon: '💪', unlocked: false, check: () => totalGamesWon >= 5 },
        'collector_50': { id: 'collector_50', name: 'کلکسیونر کارت',     description: 'در بازی حافظه، مجموعاً ۵۰ جفت کارت صحیح پیدا کنید.', icon: '🃏', unlocked: false, check: () => totalPairsEverFound >= 50 },
        'flawless_3x4': { id: 'flawless_3x4', name: 'بازی بی‌نقص (کوچک)', description: 'حالت حافظه 3x4 را با حداکثر ۸ حرکت کامل کنید.', icon: '💎', unlocked: false, check: (mode, mvs) => mode === '3x4' && mvs <= 8 },
        'golden_4x4':   { id: 'golden_4x4',   name: 'حرکات طلایی (متوسط)',description: 'حالت حافظه 4x4 را با حداکثر ۱۳ حرکت کامل کنید.', icon: '🌟', unlocked: false, check: (mode, mvs) => mode === '4x4' && mvs <= 13 },
        'strategist_5x6':{ id: 'strategist_5x6',name: 'استراتژیست برتر (بزرگ)', description: 'حالت حافظه 5x6 را با حداکثر ۲۳ حرکت کامل کنید.', icon: '🧭', unlocked: false, check: (mode, mvs) => mode === '5x6' && mvs <= 23 },
        'precision_6x6':{ id: 'precision_6x6', name: 'چالش دقت (حرفه‌ای)',description: 'حالت حافظه 6x6 را با حداکثر ۲۸ حرکت کامل کنید.', icon: '🎯', unlocked: false, check: (mode, mvs) => mode === '6x6' && mvs <= 28 }
    };
    let consecutiveMatches = 0; 
    let totalGamesWon = 0;      
    let totalPairsEverFound = 0;

    function loadStatsAndAchievements() {
        const savedAchievements = JSON.parse(localStorage.getItem('memoryGameAchievementsStatus'));
        if (savedAchievements) {
            for (const id in achievements) {
                if (achievements.hasOwnProperty(id) && savedAchievements[id] !== undefined) {
                    achievements[id].unlocked = savedAchievements[id];
                }
            }
        }
        totalGamesWon = parseInt(localStorage.getItem('memoryGameTotalGamesWon')) || 0;
        totalPairsEverFound = parseInt(localStorage.getItem('memoryGameTotalPairsEverFound')) || 0;
    }

    function saveStatsAndAchievements() {
        let statuses = {};
        for (const id in achievements) {
            if (achievements.hasOwnProperty(id)) {
                statuses[id] = achievements[id].unlocked;
            }
        }
        localStorage.setItem('memoryGameAchievementsStatus', JSON.stringify(statuses));
        localStorage.setItem('memoryGameTotalGamesWon', totalGamesWon);
        localStorage.setItem('memoryGameTotalPairsEverFound', totalPairsEverFound);
    }
    
    function showToast(message) {
        toastNotification.text(message);
        toastNotification.addClass('show');
        setTimeout(() => {
            toastNotification.removeClass('show');
        }, 3500);
    }

    function unlockAchievement(id) {
        if (achievements[id] && !achievements[id].unlocked) {
            achievements[id].unlocked = true;
            showToast(`مدال "${achievements[id].name}" کسب شد! ${achievements[id].icon}`);
            saveStatsAndAchievements(); 
            if (overlay.is(':visible') && $('#achievements-list-container').length) { 
                 displayAchievements();
            }
        }
    }

    function checkAllAchievements(checkTime, param1, param2) { 
        if (activeGameType !== 'memory') return; 
        for (const id in achievements) {
            if (achievements.hasOwnProperty(id) && !achievements[id].unlocked) {
                let conditionMet = false;
                try { 
                    if (checkTime === 'gameEnd') { 
                        conditionMet = achievements[id].check(param1, param2); 
                    } else if (checkTime === 'pairFound') { 
                        if (typeof achievements[id].check === 'function' && achievements[id].check.length === 0) {
                           conditionMet = achievements[id].check();
                        }
                    }
                } catch (e) {
                    console.error("Error checking achievement:", id, e, "Check function:", achievements[id].check);
                }
                if (conditionMet) {
                    unlockAchievement(id);
                }
            }
        }
    }
    
    function displayAchievements() {
        let listHTML = '<div id="achievements-list-container"><ul id="achievements-list">';
        for (const id in achievements) {
            if (achievements.hasOwnProperty(id)) {
                const ach = achievements[id];
                listHTML += `
                    <li class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
                        <span class="icon">${ach.icon}</span>
                        <div class="details">
                            <h4>${ach.name}</h4>
                            <p>${ach.description}</p>
                        </div>
                    </li>`;
            }
        }
        listHTML += '</ul></div>';
        
        modalContent.html(`<h2>مدال‌ها و دستاوردها</h2>` + listHTML + '<button id="close-modal-button" class="general-modal-button" style="margin-top:20px; flex-shrink: 0;">بستن</button>');
        overlay.fadeIn(300);
    }
    
    achievementsButton.on('click', displayAchievements);

    function getHighScores() {
        const scores = localStorage.getItem('memoryGameHighScores');
        return scores ? JSON.parse(scores) : {};
    }
    function saveHighScores(scores) {
        localStorage.setItem('memoryGameHighScores', JSON.stringify(scores));
    }
    function updateHighScore(mode, currentMoves, currentTimeInSeconds) {
        const highScores = getHighScores();
        const currentBest = highScores[mode];
        let newRecordString = "";
        if (!currentBest || currentMoves < currentBest.moves || (currentMoves === currentBest.moves && currentTimeInSeconds < currentBest.timeInSeconds)) {
            highScores[mode] = { moves: currentMoves, timeInSeconds: currentTimeInSeconds };
            saveHighScores(highScores);
            newRecordString = "🎉 رکورد جدید! 🎉";
        }
        return newRecordString;
    }
    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const displayM = String(m).padStart(2, '۰').replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const displayS = String(s).padStart(2, '۰').replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        return `${displayM}:${displayS}`;
    }

    function applyTheme(theme) {
        if (theme === 'day') {
            bodyElement.addClass('day-mode');
            themeToggleButton.text('☀️').attr('title', 'تغییر به تم شب');
        } else {
            bodyElement.removeClass('day-mode');
            themeToggleButton.text('🌙').attr('title', 'تغییر به تم روز');
        }
    }
    const initialTheme = localStorage.getItem('memoryGameTheme') || 'night'; 

    themeToggleButton.on('click', function() {
        let currentTheme = bodyElement.hasClass('day-mode') ? 'day' : 'night';
        const newTheme = (currentTheme === 'day' ? 'night' : 'day');
        applyTheme(newTheme);
        localStorage.setItem('memoryGameTheme', newTheme);
    });

    function resetGameStats() { 
        moves = 0; matchesFound = 0; seconds = 0; minutes = 0; currentGameTimeInSeconds = 0;
        consecutiveMatches = 0; 
        $('#moves-display').text("حرکت‌ها: ۰");
        $('#time-display').text("زمان: ۰۰:۰۰");
        if (timerInterval) clearInterval(timerInterval);
        lockBoard = false; firstCard = null; secondCard = null;
    }
    function startTimer() { 
        if (timerInterval) clearInterval(timerInterval); 
        seconds = 0; minutes = 0; currentGameTimeInSeconds = 0; 
        $('#time-display').text(`زمان: ${formatTime(currentGameTimeInSeconds)}`); 
        timerInterval = setInterval(function() {
            seconds++; currentGameTimeInSeconds++;
            if (seconds === 60) { minutes++; seconds = 0; }
            $('#time-display').text(`زمان: ${formatTime(currentGameTimeInSeconds)}`);
        }, 1000);
    }

    function createMemoryBoard(rows, cols) {
        gameBoardElement.html(''); 
        gameBoardElement.attr('data-cols', cols);
        gameBoardElement.removeClass('pattern-board').addClass('memory-board'); 
        let itemIndex = 0;
        let cardElements = []; 
        for (let i = 0; i < rows; i++) {
            const tr = $('<tr></tr>');
            for (let j = 0; j < cols; j++) {
                const cardEmoji = currentEmojis[itemIndex];
                const cardInner = $(`<div class="card-inner" data-emoji="${cardEmoji}"><div class="card-front"></div><div class="card-back"><p>${cardEmoji}</p></div></div>`);
                const td = $('<td class="memory-card"></td>').append(cardInner); 
                tr.append(td);
                cardElements.push(cardInner); 
                itemIndex++;
            }
            gameBoardElement.append(tr);
        }
        cardElements.forEach((card, index) => { setTimeout(() => { card.addClass('card-visible'); }, index * 60); });
        gameBoardElement.off('click', '.memory-card .card-inner').on('click', '.memory-card .card-inner', handleMemoryCardClick);
    }
    
    function startMemoryGame(r, l) {
        activeGameType = 'memory';
        patternChallengeHUD.hide();
        gameStatsHUD.show();
        resetGameStats(); 
        totalPairs = (r * l) / 2;
        let availableEmojis = [...em]; 
        for (let i = availableEmojis.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1));
            [availableEmojis[i], availableEmojis[j]] = [availableEmojis[j], availableEmojis[i]];
        }
        const selectedBaseEmojis = availableEmojis.slice(0, totalPairs);
        if (selectedBaseEmojis.length < totalPairs) { 
            console.warn("Emoji کم است، برخی تکرار می‌شوند.");
            let tempEmojis = [];
            for(let i = 0; i < totalPairs; i++) tempEmojis.push(availableEmojis[i % availableEmojis.length]);
            currentEmojis = [...tempEmojis, ...tempEmojis];
        } else {
            currentEmojis = [...selectedBaseEmojis, ...selectedBaseEmojis];
        }
        for (let i = currentEmojis.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1));
            [currentEmojis[i], currentEmojis[j]] = [currentEmojis[j], currentEmojis[i]];
        }
        createMemoryBoard(r, l); 
        startTimer(); 
        overlay.fadeOut(300);
    }
    
    function incrementMemoryMoves(count = 1) { 
        moves += count;
        $('#moves-display').text(`حرکت‌ها: ${String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}`);
    }

    function handleMemoryCardClick() {
        const clickedCard = $(this); 
        if (lockBoard || clickedCard.hasClass('is-flipped') || clickedCard.hasClass('is-matched')) return;
        clickedCard.addClass('is-flipped');
        if (!firstCard) {
            firstCard = clickedCard; return;
        }
        secondCard = clickedCard; lockBoard = true;
        checkMemoryForMatch();
    }

    function checkMemoryForMatch() {
        const emojisMatch = firstCard.data('emoji') === secondCard.data('emoji');
        if (emojisMatch) {
            incrementMemoryMoves(1); disableMemoryCards();
        } else {
            incrementMemoryMoves(2); unflipMemoryCards();
        }
    }

    function disableMemoryCards() {
        firstCard.addClass('is-matched'); secondCard.addClass('is-matched');
        matchesFound++; consecutiveMatches++; totalPairsEverFound++;
        saveStatsAndAchievements(); 
        checkAllAchievements('pairFound');
        resetMemoryTurn();
        if (matchesFound === totalPairs) { endMemoryGame(); }
    }

    function unflipMemoryCards() {
        consecutiveMatches = 0; 
        setTimeout(() => {
            if (firstCard) firstCard.removeClass('is-flipped');
            if (secondCard) secondCard.removeClass('is-flipped');
            resetMemoryTurn();
        }, 1200);
    }

    function resetMemoryTurn() {
        [firstCard, secondCard] = [null, null]; lockBoard = false;
    }

    function endMemoryGame() {
        clearInterval(timerInterval); totalGamesWon++; 
        saveStatsAndAchievements(); 
        const timeTakenDisplayString = formatTime(currentGameTimeInSeconds);
        const newRecordMessage = updateHighScore(gameMode, moves, currentGameTimeInSeconds); 
        const highScores = getHighScores();
        const bestScoreForMode = highScores[gameMode];
        let bestScoreDisplayString = "هنوز رکوردی برای این حالت ثبت نشده.";
        if (bestScoreForMode) {
            bestScoreDisplayString = `بهترین رکورد: ${String(bestScoreForMode.moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} حرکت در ${formatTime(bestScoreForMode.timeInSeconds)}`;
        }
        const movesDisplayString = String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        checkAllAchievements('gameEnd', gameMode, moves); 
        const modalHTML = `
            <h2 class="${newRecordMessage ? 'record-message' : ''}">${newRecordMessage ? newRecordMessage : "تبریک! شما برنده شدید!"}</h2>
            <p>شما حالت ${gameMode.replace('x', ' در ')} را با ${movesDisplayString} حرکت به پایان رساندید.</p>
            <p>زمان شما: ${timeTakenDisplayString}</p>
            <p class="best-score-text">${bestScoreDisplayString}</p>
            <p style="font-size:1.1em; margin-top: 25px; margin-bottom: 15px;">دوباره بازی می‌کنید؟</p>
            <div id="mode-selection">
                <button data-mode="3x4">حافظه 3x4</button> <button data-mode="4x4">حافظه 4x4</button>
                <button data-mode="4x5">حافظه 4x5</button> <button data-mode="5x6">حافظه 5x6</button>
                <button data-mode="6x6">حافظه 6x6</button>
                <hr style="margin: 10px 0; border-color: var(--modal-list-border-color);">
                <button data-mode="pattern_challenge" class="challenge-button general-modal-button">چالش الگو</button>
            </div>`;
        setTimeout(() => { modalContent.html(modalHTML); overlay.fadeIn(500); }, 700);
    }
// End of Part 1 of JavaScript
        // Start of Part 2 of JavaScript

    // --- Pattern Challenge Mode Logic ---
    function getPatternChallengeHighScore() {
        const score = localStorage.getItem('patternChallengeHighScore');
        return score ? JSON.parse(score) : { maxStage: 0, maxScore: 0 };
    }
    function savePatternChallengeHighScore(stage, totalScore) {
        const currentHighScore = getPatternChallengeHighScore();
        let newRecord = false;
        if (stage > currentHighScore.maxStage) {
            newRecord = true;
        } else if (stage === currentHighScore.maxStage && totalScore > currentHighScore.maxScore) {
            newRecord = true;
        }
        if (newRecord) {
             localStorage.setItem('patternChallengeHighScore', JSON.stringify({ maxStage: stage, maxScore: totalScore }));
        }
        return newRecord;
    }

    function updatePatternHUD() {
        hudStage.text(String(currentPatternStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]));
        hudScore.text(String(patternScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]));
        let heartsHTML = "";
        for (let i = 0; i < 3; i++) {
            heartsHTML += `<span class="hud-heart ${i < patternLives ? 'filled' : 'empty'}">❤️</span>`;
        }
        hudLives.html(heartsHTML);
    }

    function startPatternChallengeMode() {
        activeGameType = 'pattern';
        gameStatsHUD.hide();
        patternChallengeHUD.show();
        if(timerInterval) clearInterval(timerInterval); 
        currentPatternStage = 1;
        patternLives = 3;
        patternScore = 0; 
        setupNextPatternStage();
        overlay.fadeOut(300);
    }

    function determinePatternConfig(stage) {
        let rows, cols, numToHighlight;
        // New progression: N stays constant for 3 stages then increments
        if (stage >= 1 && stage <= 7) { // 3x3 for 7 stages
            rows = 3; cols = 3;
            if (stage <= 3) numToHighlight = 3;      // Stages 1-3: N=3
            else if (stage <= 6) numToHighlight = 4; // Stages 4-6: N=4
            else numToHighlight = 5;                 // Stage 7: N=5
        } else if (stage >= 8 && stage <= 14) { // 4x4 for 7 stages
            rows = 4; cols = 4;
            if (stage <= 10) numToHighlight = 5;     // Stages 8-10: N=5
            else if (stage <= 13) numToHighlight = 6;// Stages 11-13: N=6
            else numToHighlight = 7;                // Stage 14: N=7
        } else if (stage >= 15 && stage <= 21) { // 5x5 for 7 stages
            rows = 5; cols = 5;
            if (stage <= 17) numToHighlight = 7;     // Stages 15-17: N=7
            else if (stage <= 20) numToHighlight = 8;// Stages 18-20: N=8
            else numToHighlight = 9;                // Stage 21: N=9
        } else { // Stages 22+ on 6x6
            rows = 6; cols = 6; 
            // Starts at N=9, increases by 1 every 3 stages for 6x6
            numToHighlight = 9 + Math.floor(Math.max(0, stage - 22) / 3); 
            numToHighlight = Math.min(numToHighlight, Math.floor(rows * cols * 0.66)); // Cap at ~66% of cells (e.g., 24 for 6x6)
            numToHighlight = Math.max(numToHighlight, 9); 
        }
        return { rows, cols, numToHighlight };
    }

    function setupNextPatternStage() {
        playerPatternGuess = [];
        mistakesThisPatternAttempt = 0;
        patternBoardLock = true; 
        updatePatternHUD();

        const config = determinePatternConfig(currentPatternStage);
        gameBoardElement.html('');
        gameBoardElement.attr('data-cols', config.cols);
        gameBoardElement.removeClass('memory-board').addClass('pattern-board');

        let totalCells = config.rows * config.cols;
        let allCellIndices = Array.from(Array(totalCells).keys());
        currentPatternToGuess = [];
        
        for (let i = 0; i < config.numToHighlight; i++) {
            if (allCellIndices.length === 0) break;
            let randIndex = Math.floor(Math.random() * allCellIndices.length);
            currentPatternToGuess.push(allCellIndices.splice(randIndex, 1)[0]);
        }

        let cellElementsForAnimation = [];
        for (let r = 0; r < config.rows; r++) {
            const tr = $('<tr></tr>');
            for (let c = 0; c < config.cols; c++) {
                const cellId = (r * config.cols) + c;
                const cellDiv = $(`<div class="card-inner pattern-cell-content"></div>`); 
                const td = $('<td class="pattern-cell"></td>').attr('data-cell-id', cellId).append(cellDiv);
                tr.append(td);
                cellElementsForAnimation.push(cellDiv);
            }
            gameBoardElement.append(tr);
        }
        
        cellElementsForAnimation.forEach((cell, index) => {
            setTimeout(() => {
                cell.addClass('card-visible'); 
            }, index * 30); // Slightly faster dealing for pattern cells
        });
        
        setTimeout(() => { 
            currentPatternToGuess.forEach(cellId => {
                $(`td[data-cell-id="${cellId}"] .card-inner`).addClass('highlighted');
            });

            setTimeout(() => { 
                currentPatternToGuess.forEach(cellId => {
                    $(`td[data-cell-id="${cellId}"] .card-inner`).removeClass('highlighted');
                });
                patternBoardLock = false; 
            }, PATTERN_HIGHLIGHT_DURATION); // PATTERN_HIGHLIGHT_DURATION is 1200ms
        }, cellElementsForAnimation.length * 30 + 250); // Adjusted buffer for dealing

        gameBoardElement.off('click', '.pattern-cell').on('click', '.pattern-cell', handlePatternCellClick);
    }

    function handlePatternCellClick() {
        if (patternBoardLock) return;
        
        const clickedCellTd = $(this);
        const cellInner = clickedCellTd.find('.card-inner');

        if (cellInner.hasClass('selected-correct') || cellInner.hasClass('selected-wrong')) return;

        const cellId = parseInt(clickedCellTd.data('cell-id'));

        if (currentPatternToGuess.includes(cellId)) { 
            playerPatternGuess.push(cellId);
            cellInner.addClass('selected-correct');
            patternScore++; 
            updatePatternHUD();

            if (playerPatternGuess.length === currentPatternToGuess.length) { 
                patternBoardLock = true; 
                setTimeout(() => {
                    currentPatternStage++;
                    setupNextPatternStage(); 
                }, 500); // Short delay before next stage starts
            }
        } else { 
            cellInner.addClass('selected-wrong');
            mistakesThisPatternAttempt++;
            
            if (mistakesThisPatternAttempt >= 3) {
                patternLives--;
                updatePatternHUD();
                patternBoardLock = true; 
                if (patternLives <= 0) {
                    gameOverPatternChallenge();
                } else {
                    setTimeout(() => {
                        const stageNumForToast = String(currentPatternStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
                        showToast(`یک جان از دست دادید! الگوی جدید برای مرحله ${stageNumForToast}...`);
                        setupNextPatternStage(); 
                    }, 1200);
                }
            }
        }
    }

    function gameOverPatternChallenge() {
        patternBoardLock = true;
        const completedStage = Math.max(0, currentPatternStage - 1 ); 
        const newHighScore = savePatternChallengeHighScore(completedStage, patternScore); 
        const bestEver = getPatternChallengeHighScore();

        const completedStageFarsi = String(completedStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const patternScoreFarsi = String(patternScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const bestStageFarsi = String(bestEver.maxStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const bestScoreTotalFarsi = String(bestEver.maxScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

        let gameOverHTML = `
            <h2>بازی تمام شد! (چالش الگو)</h2>
            <p>شما تا مرحله ${completedStageFarsi} پیش رفتید.</p>
            <p>امتیاز نهایی شما: ${patternScoreFarsi}</p>
            <hr style="margin: 10px 0; border-color: var(--modal-list-border-color);">
            <p class="best-score-text">بهترین رکورد شما در چالش الگو:<br>مرحله ${bestStageFarsi} با امتیاز ${bestScoreTotalFarsi}</p>
            ${newHighScore ? '<h2 class="record-message" style="font-size: 1.5em;">🎉 رکورد جدید در چالش الگو! 🎉</h2>' : ''}
            <p style="font-size:1.1em; margin-top: 25px; margin-bottom: 15px;">دوباره بازی می‌کنید؟</p>
            <div id="mode-selection">
                <button data-mode="pattern_challenge" class="challenge-button general-modal-button">چالش الگو (دوباره)</button>
                <hr style="margin: 10px 0; border-color: var(--modal-list-border-color);">
                <button data-mode="main_menu" class="general-modal-button">منوی اصلی</button> 
            </div>`;
        
        modalContent.html(gameOverHTML);
        overlay.fadeIn(500);
    }

    // --- Initial Modal Setup & Main Menu Logic ---
    function showInitialModal() {
        activeGameType = null; 
        patternChallengeHUD.hide();
        gameStatsHUD.hide(); 
        if(timerInterval) clearInterval(timerInterval);

        const modalHTML = `
            <div id="inst">
                <h3>راهنمای بازی حافظه (جفتی):</h3>
                <ul>
                    <li>جفت کارت‌های مشابه را پیدا کنید.</li>
                    <li>انتخاب درست ۱ حرکت و انتخاب اشتباه ۲ حرکت ثبت می‌شود.</li>
                </ul>
                <hr style="margin: 15px 0; border-color: var(--modal-list-border-color);">
                <h3>راهنمای چالش الگو:</h3>
                <ul>
                    <li>خانه‌هایی که برای چند ثانیه رنگی می‌شوند را به خاطر بسپارید.</li>
                    <li>پس از بازگشت رنگ‌ها، همان خانه‌ها را انتخاب کنید.</li>
                    <li>با ۳ انتخاب اشتباه در یک الگو، یک جان از دست می‌دهید.</li>
                </ul>
                <p style="font-size:1.2em; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">انتخاب کنید:</p>
            </div>
            <div id="mode-selection">
                <button data-mode="3x4">حافظه 3x4</button>
                <button data-mode="4x4">حافظه 4x4</button>
                <button data-mode="4x5">حافظه 4x5</button>
                <button data-mode="5x6">حافظه 5x6</button>
                <button data-mode="6x6">حافظه 6x6</button>
                <hr style="margin: 10px 0; border-color: var(--modal-list-border-color);">
                <button data-mode="pattern_challenge" class="challenge-button" style="padding: 12px 20px; font-size:1.1em;">شروع چالش الگو!</button>
            </div>`;
        modalContent.html(modalHTML); 
        overlay.fadeIn(300);
    }

    // Centralized event delegation for modal buttons
    modalContent.off('click', '#mode-selection button').on('click', '#mode-selection button', function() { 
        const mode = $(this).data('mode');
        if (mode === 'pattern_challenge') {
            startPatternChallengeMode();
        } else if (mode === 'main_menu') {
            overlay.fadeOut(300, showInitialModal); // Fade out then show initial modal
        } else { 
            const modeParts = mode.split('x');
            if (modeParts.length === 2 && !isNaN(parseInt(modeParts[0])) && !isNaN(parseInt(modeParts[1]))) { 
                const r = parseInt(modeParts[0]);
                const l = parseInt(modeParts[1]);
                gameMode = mode; 
                startMemoryGame(r, l);
            } else {
                console.error("Invalid memory game mode selected:", mode);
                showInitialModal(); 
            }
        }
    });
    modalContent.off('click', '#close-modal-button').on('click', '#close-modal-button', function() { 
        overlay.fadeOut(300);
    });

    // --- Initial Load ---
    loadStatsAndAchievements();
    applyTheme(initialTheme); 
    showInitialModal(); 
});
// End of Part 2 of JavaScript
                               
