function initMemoryGame() {
    const view = $('#memory-game-view');
    // Inject HTML content
    view.html(`
        <button class="back-btn" data-target="game-selection-view">➡️</button>
        <div class="game-container">
            <div id="mem-game-header">
                <h3>بازی حافظه</h3>
                <div id="mem-game-stats">
                    <span id="mem-moves-display">حرکت‌ها: ۰</span>
                    <span id="mem-time-display">زمان: ۰۰:۰۰</span>
                </div>
            </div>
            <main>
                <table id="mem-game-board" cellspacing="0"></table>
            </main>
            <div id="mem-overlay">
                 <div id="mem-modal-content"></div>
            </div>
        </div>
    `);

    const em = ["💐","🌹","🌻","🏵️","🌺","🌴","🌈","🍓","🍒","🍎","🍉","🍊","🥭","🍍","🍋","🍏","🍐","🥝","🍇","🥥"];
    let firstCard, secondCard, lockBoard, moves, matchesFound, totalPairs, timerInterval;

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

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
        const gameBoard = view.find('#mem-game-board').empty();
        totalPairs = (rows * cols) / 2;
        
        let emojis = [...em].sort(() => 0.5 - Math.random()).slice(0, totalPairs);
        let cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < rows; i++) {
            const tr = $('<tr></tr>');
            for (let j = 0; j < cols; j++) {
                const emoji = cards.pop();
                tr.append(`
                    <td>
                        <div class="card-inner" data-emoji="${emoji}">
                            <div class="card-front"></div>
                            <div class="card-back"><p>${emoji}</p></div>
                        </div>
                    </td>
                `);
            }
            gameBoard.append(tr);
        }
    }

    function handleCardClick() {
        if (lockBoard || $(this).hasClass('is-flipped')) return;
        $(this).addClass('is-flipped');
        if (!firstCard) { firstCard = $(this); return; }
        
        secondCard = $(this);
        moves++;
        view.find('#mem-moves-display').text(`حرکت‌ها: ${moves}`);
        lockBoard = true;

        if (firstCard.data('emoji') === secondCard.data('emoji')) {
            matchesFound++;
            firstCard.addClass('is-matched');
            secondCard.addClass('is-matched');
            resetTurn();
            if (matchesFound === totalPairs) {
                clearInterval(timerInterval);
                setTimeout(() => alert('شما در بازی حافظه برنده شدید!'), 500);
            }
        } else {
            setTimeout(() => {
                firstCard.removeClass('is-flipped');
                secondCard.removeClass('is-flipped');
                resetTurn();
            }, 1200);
        }
    }

    function resetTurn() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }
    
    function startGame(rows, cols){
        moves = 0;
        matchesFound = 0;
        view.find('#mem-moves-display').text(`حرکت‌ها: ۰`);
        createBoard(rows, cols);
        startTimer();
    }
    
    view.on('click', '.card-inner', handleCardClick);
    startGame(4, 4); // Start with a 4x4 board

    return function cleanup() {
        clearInterval(timerInterval);
        view.off('click', '.card-inner');
        view.empty();
    };
}

