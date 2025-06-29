function initSequenceGame() {
    const view = $('#sequence-game-view');
    view.html(`
        <button class="back-btn" data-target="game-selection-view">➡️</button>
        <div class="game-container">
            <details class="game-guide"><summary>راهنمای بازی</summary><p>دنباله اعداد را به خاطر بسپار و آن را تکرار کن. با هر اشتباه (پس از اتمام راهنماها) یک جان از دست می‌دهی.</p></details>
            <header class="game-header">
                <div id="medals-container"><span class="medal" id="sq-medal-bronze">🥉</span><span class="medal" id="sq-medal-silver">🥈</span><span class="medal" id="sq-medal-gold">🥇</span><span class="medal" id="sq-medal-master">💎</span></div>
                <h1>دنباله سریع</h1>
                <div class="game-info"><span>مرحله: <span id="sq-level-display">1</span></span><div id="sq-lives-display" class="lives"></div><span>بالاترین مرحله: <span id="sq-highscore-display">0</span></span></div>
            </header>
            <main>
                <div class="display-box"><p id="sq-display-text">برای شروع، دکمه "شروع" را بزن</p></div>
                <div id="sq-message-display" class="message"></div>
                <div class="input-wrapper"><div id="sq-fake-input"></div><input type="text" id="sq-sequence-input" autocomplete="off" /></div>
                <div class="button-group" style="margin-top:1rem;"><button id="sq-sequence-submit-btn" disabled>تایید</button></div>
            </main>
            <footer><button id="sq-start-sequence-btn" class="start-btn">شروع</button></footer>
        </div>
    `);

    const levelDisplay = view.find('#sq-level-display'), highscoreDisplay = view.find('#sq-highscore-display'), livesDisplay = view.find('#sq-lives-display'),
          displayText = view.find('#sq-display-text'), sequenceInput = view.find('#sq-sequence-input'), fakeInput = view.find('#sq-fake-input'),
          submitBtn = view.find('#sq-sequence-submit-btn'), startBtn = view.find('#sq-start-sequence-btn'), messageDisplay = view.find('#sq-message-display');
          
    let level, sequence, lives, isPlaying, highScore, timer;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function updateUI() {
        levelDisplay.text(level); highscoreDisplay.text(highScore);
        livesDisplay.html(''); for (let i = 1; i <= 3; i++) livesDisplay.append($('<span>').addClass('heart').toggleClass('lost', i > lives).text('♥'));
    }
    async function displaySequence() {
        isPlaying = true; setInputsDisabled(true); displayText.text('آماده؟'); await sleep(1000);
        const displayTime = Math.max(300, 800 - (level * 30));
        for (const num of sequence) { displayText.text(num); await sleep(displayTime); displayText.text(''); await sleep(200); }
        displayText.text('؟'); isPlaying = false; setInputsDisabled(false); sequenceInput.focus();
    }
    function handleCorrectAnswer() {
        level++; if (level > highScore) { highScore = level; localStorage.setItem('sequenceHighScore', highScore); }
        messageDisplay.text('عالی بود! مرحله بعد...').attr('class', 'message correct');
        setTimeout(() => { resetRoundState(); startRound(); }, 1500);
    }
    function handleWrongAnswer() {
        lives--;
        if (lives > 0) {
            messageDisplay.text(`اشتباه بود! ${lives} جان دیگر باقیست.`).attr('class', 'message wrong');
            setTimeout(() => { resetRoundState(); startRound(); }, 2000);
        } else {
            messageDisplay.text(`باختی! دنباله صحیح: ${sequence.join('')}`).attr('class', 'message wrong');
            displayText.text('GAME OVER'); setInputsDisabled(true); startBtn.text('شروع مجدد').prop('disabled', false);
        }
    }
    function checkAnswer() {
        setInputsDisabled(true); (sequenceInput.val() === sequence.join('')) ? handleCorrectAnswer() : handleWrongAnswer();
        sequenceInput.val(''); fakeInput.html('');
    }
    function setInputsDisabled(state) { submitBtn.prop('disabled', state); sequenceInput.prop('disabled', state); }
    function resetRoundState() { messageDisplay.text('').attr('class', 'message'); }
    function startRound() { sequence = []; for (let i = 0; i < level; i++) sequence.push(Math.floor(Math.random() * 9) + 1); updateUI(); displaySequence(); }
    function startGame() {
        level = 1; lives = 3; highScore = localStorage.getItem('sequenceHighScore') || 0;
        startBtn.text('...').prop('disabled', true); startRound();
    }

    startBtn.on('click', startGame);
    submitBtn.on('click', checkAnswer);
    sequenceInput.on('keydown', e => { if (e.key === 'Enter' && !submitBtn.prop('disabled')) checkAnswer(); });
    sequenceInput.on('input', () => { fakeInput.text(sequenceInput.val()); });
    
    startGame();
    return function cleanup() { clearInterval(timer); view.off(); view.empty(); };
}
