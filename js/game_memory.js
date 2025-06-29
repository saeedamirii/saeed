function initMemoryGame() {
    const view = $('#memory-game-view');
    view.html(`
        <button class="back-btn" data-target="game-selection-view">➡️</button>
        <div class="game-container">
            <div id="loading-overlay" class="hidden"></div>
            <div id="mem-overlay" style="display: none;">
                <div id="mem-modal-content"></div>
            </div>
            <header id="mem-game-header">
                 <div id="mem-header-buttons-left">
                    <button id="mem-music-toggle-button" title="پخش موزیک">🎵</button>
                </div>
                <div id="mem-logo">بازی حافظه</div>
                <div id="mem-game-stats">
                    <span id="mem-moves-display">حرکت‌ها: ۰</span>
                    <span id="mem-time-display">زمان: ۰۰:۰۰</span>
                </div>
            </header>
            <main><table id="mem-game-board" cellspacing="0"></table></main>
            <audio id="mem-background-music" src="sound/sound.mp3" loop preload="auto"></audio>
        </div>
    `);

    // Scoped variables
    const em = ["💐","🌹","🌻","🏵️","🌺","🌴","🌈","🍓","🍒","🍎","🍉","🍊","🥭","🍍","🍋","🍏","🍐","🥝","🍇","🥥","🍅","🌶️","🍄","🧅","🥦","🥑","🍔","🍕","🧁","🎂","🍬","🍩","🍫","🎈"];
    let firstCard, secondCard, lockBoard, moves, matchesFound, totalPairs, timerInterval;
    const gameBoard = view.find('#mem-game-board'), modalContent = view.find('#mem-modal-content'),
          overlay = view.find('#mem-overlay'), backgroundMusic = view.find('#mem-background-music')[0];

    // --- Core Functions ---
    const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        let seconds = 0;
        view.find('#mem-time-display').text(`زمان: ${formatTime(seconds)}`);
        timerInterval = setInterval(() => {
            seconds++;
            view.find('#mem-time-display').text(`زمان: ${formatTime(seconds)}`);
        }, 1000);
    }
    
    function createBoard(rows, cols) {
        gameBoard.empty().removeClass('pattern-board').addClass('memory-board').attr('data-cols', cols);
        totalPairs = (rows * cols) / 2;
        let emojis = [...em].sort(() => 0.5 - Math.random()).slice(0, totalPairs);
        let cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
        for (let i = 0; i < rows; i++) {
            const tr = $('<tr></tr>');
            for (let j = 0; j < cols; j++) {
                const emoji = cards.pop();
                tr.append(`<td><div class="card-inner" data-emoji="${emoji}"><div class="card-front"></div><div class="card-back"><p>${emoji}</p></div></div></td>`);
            }
            gameBoard.append(tr);
        }
    }

    function handleCardClick() {
        if (lockBoard || $(this).hasClass('is-flipped')) return;
        $(this).addClass('is-flipped');
        if (!firstCard) { firstCard = $(this); return; }
        
        secondCard = $(this); moves++;
        view.find('#mem-moves-display').text(`حرکت‌ها: ${moves}`);
        lockBoard = true;

        if (firstCard.data('emoji') === secondCard.data('emoji')) {
            matchesFound++;
            firstCard.addClass('is-matched'); secondCard.addClass('is-matched');
            resetTurn();
            if (matchesFound === totalPairs) {
                clearInterval(timerInterval);
                setTimeout(() => showModal(true), 500);
            }
        } else {
            setTimeout(() => { firstCard.removeClass('is-flipped'); secondCard.removeClass('is-flipped'); resetTurn(); }, 1200);
        }
    }

    function resetTurn() { [firstCard, secondCard, lockBoard] = [null, null, false]; }
    
    function showModal(isWin = false) {
        let content = `<h2>یک حالت را انتخاب کنید</h2><div id="mem-mode-selection">`;
        if (isWin) { content = `<h2>شما برنده شدید!</h2><p>دوباره بازی می‌کنید؟</p><div id="mem-mode-selection">`; }
        content += `<button data-mode="4x4">4x4</button><button data-mode="5x6">5x6</button><button data-mode="6x6">6x6</button></div>`;
        modalContent.html(content);
        overlay.css('display', 'flex');
    }

    function startGame(rows, cols) {
        moves = 0; matchesFound = 0;
        view.find('#mem-moves-display').text(`حرکت‌ها: ۰`);
        overlay.hide();
        createBoard(rows, cols);
        startTimer();
    }
    
    // --- Event Listeners ---
    view.on('click', '.card-inner', handleCardClick);
    view.on('click', '#mem-music-toggle-button', function() {
        if(backgroundMusic.paused) backgroundMusic.play();
        else backgroundMusic.pause();
        $(this).text(backgroundMusic.paused ? '🎵' : '⏸️');
    });
    view.on('click', '#mem-mode-selection button', function() {
        const [rows, cols] = $(this).data('mode').split('x').map(Number);
        startGame(rows, cols);
    });
    
    // --- Initial Call ---
    showModal();

    return function cleanup() {
        clearInterval(timerInterval);
        backgroundMusic.pause();
        view.off();
        view.empty();
    };
}
