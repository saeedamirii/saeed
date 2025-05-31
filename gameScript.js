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
    const PATTERN_HIGHLIGHT_DURATION = 1000; // کاهش یافت به ۱ ثانیه

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

    function getHighScores() { /* ... (مثل قبل) ... */ }
    function saveHighScores(scores) { /* ... (مثل قبل) ... */ }
    function updateHighScore(mode, currentMoves, currentTimeInSeconds) { /* ... (مثل قبل) ... */ }
    function formatTime(totalSeconds) { /* ... (مثل قبل) ... */ }
    function applyTheme(theme) { /* ... (مثل قبل) ... */ }
    const initialTheme = localStorage.getItem('memoryGameTheme') || 'night'; 
    themeToggleButton.on('click', function() { /* ... (مثل قبل) ... */ });
    function resetGameStats() { /* ... (مثل قبل) ... */ }
    function startTimer() { /* ... (مثل قبل) ... */ }
    function createMemoryBoard(rows, cols) { /* ... (مثل قبل) ... */ }
    function startMemoryGame(r, l) { /* ... (مثل قبل) ... */ }
    function incrementMemoryMoves(count = 1) { /* ... (مثل قبل) ... */ }
    function handleMemoryCardClick() { /* ... (مثل قبل) ... */ }
    function checkMemoryForMatch() { /* ... (مثل قبل) ... */ }
    function disableMemoryCards() { /* ... (مثل قبل) ... */ }
    function unflipMemoryCards() { /* ... (مثل قبل) ... */ }
    function resetMemoryTurn() { /* ... (مثل قبل) ... */ }
    function endMemoryGame() { /* ... (مثل قبل) ... */ }

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
        // New N progression: N stays constant for ~3 stages then increments, 3x3 is one stage
        if (stage === 1) { // 3x3 is only one stage
            rows = 3; cols = 3; numToHighlight = 4; // Start with N=4 for 3x3 as it's quick
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
            // Starts at N=9, increases by 1 every 3 stages for 6x6
            numToHighlight = 9 + Math.floor(Math.max(0, stage - 20) / 3); 
            numToHighlight = Math.min(numToHighlight, Math.floor(rows * cols * 0.60)); 
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
        
        // Ensure numToHighlight does not exceed totalCells
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
            setTimeout(() => {
                cell.addClass('card-visible'); 
            }, index * 30); 
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
            }, PATTERN_HIGHLIGHT_DURATION);
        }, cellElementsForAnimation.length * 30 + 250); 

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
                }, 500); 
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
        // If player lost on stage X, they completed X-1 stages. If they completed stage X and then lost on stage X+1, they completed X.
        // PlayerPatternGuess might not be full if they lost life due to 3 mistakes before completing the pattern.
        const completedStage = (patternLives > 0 && playerPatternGuess.length === currentPatternToGuess.length) ? currentPatternStage : Math.max(0, currentPatternStage -1) ;

        const newHighScore = savePatternChallengeHighScore(completedStage, patternScore); 
        const bestEver = getPatternChallengeHighScore();

        const completedStageFarsi = String(completedStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const patternScoreFarsi = String(patternScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const bestStageFarsi = String(bestEver.maxStage).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const bestScoreTotalFarsi = String(bestEver.maxScore).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

        let gameOverHTML = `
            <h2>بازی تمام شد! (چالش الگو)</h2>
            <p>شما مرحله ${completedStageFarsi} را به اتمام رساندید.</p>
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
    modalContent.off('click').on('click', '#mode-selection button, #close-modal-button', function() { 
        const clickedButton = $(this);
        if (clickedButton.is('#close-modal-button')) { // Handles close for achievement modal
            overlay.fadeOut(300);
            return;
        }

        const mode = clickedButton.data('mode');
        if (mode === 'pattern_challenge') {
            startPatternChallengeMode();
        } else if (mode === 'main_menu') {
            overlay.fadeOut(300, showInitialModal); 
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
    
    // --- Initial Load ---
    loadStatsAndAchievements();
    applyTheme(initialTheme); 
    showInitialModal(); 
});
// End of Part 2 of JavaScript
                                
                  
