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
    const PATTERN_HIGHLIGHT_DURATION = 1000; // ۱ ثانیه - طبق آخرین درخواست

    // --- Music Toggle Logic ---
    if (musicToggleButton.length && backgroundMusic) {
        musicToggleButton.on('click', function() {
            try {
                if (backgroundMusic.paused) {
                    backgroundMusic.play()
                        .then(() => {
                            musicToggleButton.text('⏸️').attr('title', 'قطع موزیک').addClass('pulsating-music');
                        })
                        .catch(error => {
                             console.error("Error playing music:", error);
                             // Fallback for browsers that might have issues with play() promise
                             musicToggleButton.text('⏸️').attr('title', 'قطع موزیک').addClass('pulsating-music');
                        });
                } else {
                    backgroundMusic.pause();
                    musicToggleButton.text('🎵').attr('title', 'پخش موزیک').removeClass('pulsating-music');
                }
            } catch (e) {
                console.error("Error in music toggle:", e);
            }
        });
    }

    // --- Achievements Logic ---
    let achievements = {
        'first_win':    { id: 'first_win',    name: 'اولین پیروزی',      description: 'اولین بازی حافظه (جفتی) خود را با موفقیت تمام کنید.', icon: '🥇', unlocked: false, check: () => totalGamesWon >= 1 }, // Changed to >= 1 for robustness
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

    function loadStatsAndAchievements() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function saveStatsAndAchievements() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function showToast(message) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function unlockAchievement(id) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function checkAllAchievements(checkTime, param1, param2) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function displayAchievements() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    if (achievementsButton.length) achievementsButton.on('click', displayAchievements);
    
    function getHighScores() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function saveHighScores(scores) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function updateHighScore(mode, currentMoves, currentTimeInSeconds) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function formatTime(totalSeconds) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function applyTheme(theme) { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    const initialTheme = localStorage.getItem('memoryGameTheme') || 'night'; 
    if (themeToggleButton.length) themeToggleButton.on('click', function() { /* ... (مثل قبل، بدون تغییر عمده) ... */ });
    
    function resetGameStats() { 
        moves = 0; matchesFound = 0; seconds = 0; minutes = 0; currentGameTimeInSeconds = 0;
        consecutiveMatches = 0; 
        if (gameStatsHUD.length) { // اطمینان از وجود عنصر
            $('#moves-display').text("حرکت‌ها: ۰");
            $('#time-display').text("زمان: ۰۰:۰۰");
        }
        if (timerInterval) clearInterval(timerInterval);
        lockBoard = false; firstCard = null; secondCard = null;
    }
    function startTimer() { 
        if (timerInterval) clearInterval(timerInterval); 
        seconds = 0; minutes = 0; currentGameTimeInSeconds = 0; 
        if (gameStatsHUD.length) $('#time-display').text(`زمان: ${formatTime(currentGameTimeInSeconds)}`); 
        timerInterval = setInterval(function() {
            seconds++; currentGameTimeInSeconds++;
            if (seconds === 60) { minutes++; seconds = 0; }
            if (gameStatsHUD.length) $('#time-display').text(`زمان: ${formatTime(currentGameTimeInSeconds)}`);
        }, 1000);
    }

    function createMemoryBoard(rows, cols) {
        if (!gameBoardElement.length) return;
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
        console.log("Starting Memory Game:", r + "x" + l);
        activeGameType = 'memory';
        if (patternChallengeHUD.length) patternChallengeHUD.hide();
        if (gameStatsHUD.length) gameStatsHUD.show();
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
        if (overlay.length) overlay.fadeOut(300);
    }
    
    function incrementMemoryMoves(count = 1) { 
        moves += count;
        if (gameStatsHUD.length) $('#moves-display').text(`حرکت‌ها: ${String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}`);
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

    function disableMemoryCards() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function unflipMemoryCards() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function resetMemoryTurn() { /* ... (مثل قبل، بدون تغییر عمده) ... */ }
    function endMemoryGame() { /* ... (مثل قبل، بدون تغییر عمده، فقط نام دکمه چالش الگو در مودال پایانی ممکن است نیاز به بررسی داشته باشد) ... */ }

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
        if (stage > currentHighScore.maxStage) { newRecord = true; } 
        else if (stage === currentHighScore.maxStage && totalScore > currentHighScore.maxScore) { newRecord = true; }
        if (newRecord) { localStorage.setItem('patternChallengeHighScore', JSON.stringify({ maxStage: stage, maxScore: totalScore })); }
        return newRecord;
    }

    function updatePatternHUD() {
        if (hudStage.length) hudStage.text(String(currentPatternStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]));
        if (hudScore.length) hudScore.text(String(patternScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]));
        if (hudLives.length) {
            let heartsHTML = "";
            for (let i = 0; i < 3; i++) {
                heartsHTML += `<span class="hud-heart ${i < patternLives ? 'filled' : 'empty'}">❤️</span>`;
            }
            hudLives.html(heartsHTML);
        }
    }

    function startPatternChallengeMode() {
        console.log("Starting Pattern Challenge Mode");
        activeGameType = 'pattern';
        if(gameStatsHUD.length) gameStatsHUD.hide();
        if(patternChallengeHUD.length) patternChallengeHUD.show();
        if(timerInterval) clearInterval(timerInterval); 

        currentPatternStage = 1;
        patternLives = 3;
        patternScore = 0; 
        setupNextPatternStage();
        if(overlay.length) overlay.fadeOut(300);
    }

    function determinePatternConfig(stage) {
        let rows, cols, numToHighlight;
        // New N progression: 3x3 is 1 stage, 4x4 & 5x5 are 9 stages each, N increases every 3 stages within tier
        if (stage === 1) { 
            rows = 3; cols = 3; numToHighlight = 4; 
        } else if (stage >= 2 && stage <= 10) { // 4x4 for 9 stages (stages 2 to 10)
            rows = 4; cols = 4;
            if (stage <= 4) numToHighlight = 5;      // Stages 2-4 (3 stages): N=5
            else if (stage <= 7) numToHighlight = 6; // Stages 5-7 (3 stages): N=6
            else numToHighlight = 7;                 // Stages 8-10 (3 stages): N=7
        } else if (stage >= 11 && stage <= 19) { // 5x5 for 9 stages (stages 11 to 19)
            rows = 5; cols = 5;
            if (stage <= 13) numToHighlight = 7;     // Stages 11-13: N=7
            else if (stage <= 16) numToHighlight = 8;// Stages 14-16: N=8
            else numToHighlight = 9;                // Stages 17-19: N=9
        } else { // Stages 20+ on 6x6
            rows = 6; cols = 6; 
            numToHighlight = 9 + Math.floor(Math.max(0, stage - 20) / 3); 
            numToHighlight = Math.min(numToHighlight, Math.floor(rows * cols * 0.66)); // Cap at ~66% of cells (e.g., 23-24 for 6x6)
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
        if (!gameBoardElement.length) { console.error("#game-board not found for pattern stage!"); return; }
        gameBoardElement.html('');
        gameBoardElement.attr('data-cols', config.cols);
        gameBoardElement.removeClass('memory-board').addClass('pattern-board');

        let totalCells = config.rows * config.cols;
        let allCellIndices = Array.from(Array(totalCells).keys());
        currentPatternToGuess = [];
        
        const actualNumToHighlight = Math.min(config.numToHighlight, totalCells);
        for (let i = 0; i < actualNumToHighlight; i++) {
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
            setTimeout(() => { cell.addClass('card-visible'); }, index * 30); 
        });
        
        // Ensure dealing animation completes before highlighting
        const dealingTotalTime = cellElementsForAnimation.length * 30 + 250;
        setTimeout(() => { 
            currentPatternToGuess.forEach(cellId => {
                $(`td[data-cell-id="${cellId}"] .card-inner`).addClass('highlighted');
            });
            setTimeout(() => { 
                currentPatternToGuess.forEach(cellId => {
                    $(`td[data-cell-id="${cellId}"] .card-inner`).removeClass('highlighted');
                });
                patternBoardLock = false; 
            }, PATTERN_HIGHLIGHT_DURATION);
        }, dealingTotalTime); 

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
                setTimeout(() => { currentPatternStage++; setupNextPatternStage(); }, 600); 
            }
        } else { 
            cellInner.addClass('selected-wrong');
            mistakesThisPatternAttempt++;
            if (mistakesThisPatternAttempt >= 3) {
                patternLives--; updatePatternHUD(); patternBoardLock = true; 
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
        const completedStage = Math.max(0, currentPatternStage - 1 ); // Stage they were on before losing/failing it
        const newHighScore = savePatternChallengeHighScore(completedStage, patternScore); 
        const bestEver = getPatternChallengeHighScore();
        const completedStageFarsi = String(completedStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const patternScoreFarsi = String(patternScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const bestStageFarsi = String(bestEver.maxStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const bestScoreTotalFarsi = String(bestEver.maxScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

        let gameOverHTML = `
            <h2>بازی تمام شد! (چالش الگو)</h2>
            <p>شما مرحله ${completedStageFarsi} را به اتمام رساندید و یا در آن بودید.</p>
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
        if (modalContent.length && overlay.length) {
            modalContent.html(gameOverHTML); overlay.fadeIn(500);
        }
    }

    function showInitialModal() {
        console.log("Showing Initial Modal");
        activeGameType = null; 
        if (patternChallengeHUD.length) patternChallengeHUD.hide();
        if (gameStatsHUD.length) gameStatsHUD.hide(); 
        if(timerInterval) { clearInterval(timerInterval); timerInterval = null; }

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
                <button data-mode="3x4">حافظه 3x4</button> <button data-mode="4x4">حافظه 4x4</button>
                <button data-mode="4x5">حافظه 4x5</button> <button data-mode="5x6">حافظه 5x6</button>
                <button data-mode="6x6">حافظه 6x6</button>
                <hr style="margin: 10px 0; border-color: var(--modal-list-border-color);">
                <button data-mode="pattern_challenge" class="challenge-button" style="padding: 12px 20px; font-size:1.1em;">شروع چالش الگو!</button>
            </div>`;
        if (modalContent.length && overlay.length) {
            modalContent.html(modalHTML); overlay.fadeIn(300);
        } else {
            console.error("Modal elements not found for initial modal!");
        }
    }

    // Centralized event delegation for modal buttons
    if (modalContent.length) {
        // Detach any previous general click handlers on modalContent to prevent multiple bindings if this script runs multiple times (though ideally it shouldn't)
        // More specific selectors for .off() might be better if other click events are on modalContent.
        // For now, this targets buttons we add to #mode-selection and #close-modal-button.
        modalContent.off('click', '#mode-selection button, #close-modal-button'); 
        
        modalContent.on('click', '#mode-selection button, #close-modal-button', function() { 
            console.log("Modal button clicked:", $(this).data('mode') || "Close button");
            const clickedButton = $(this);
            if (clickedButton.is('#close-modal-button')) { 
                if (overlay.length) overlay.fadeOut(300);
                return;
            }
            const mode = clickedButton.data('mode');
            if (mode === 'pattern_challenge') {
                startPatternChallengeMode();
            } else if (mode === 'main_menu') {
                if (overlay.length) overlay.fadeOut(300, showInitialModal); else showInitialModal();
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
    } else {
        console.error("#modal-content element not found for attaching event listeners!");
    }
    
    // --- Initial Load ---
    console.log("Document ready. Initializing game...");
    loadStatsAndAchievements();
    applyTheme(initialTheme); 
    showInitialModal(); 
});
// End of Part 2 of JavaScript
