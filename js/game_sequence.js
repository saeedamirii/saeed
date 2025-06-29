function initSequenceGame() {
    const view = $('#sequence-game-view');
    view.html(`
        <button class="back-btn" data-target="game-selection-view">➡️</button>
        <div class="game-container">
            <details class="game-guide"><summary>راهنمای بازی</summary><p>دنباله اعداد را به خاطر بسپار و آن را تکرار کن. با هر اشتباه (پس از اتمام راهنماها) یک جان از دست می‌دهی.</p></details>
            <header class="game-header">
                <div class="medals-container"><span id="sq-medal-bronze" class="medal">🥉</span><span id="sq-medal-silver" class="medal">🥈</span><span id="sq-medal-gold" class="medal">🥇</span><span id="sq-medal-master" class="medal">💎</span></div>
                <h1>دنباله سریع</h1>
                <div class="game-info"><span>مرحله: <span id="sq-level-display">1</span></span><div id="sq-lives-display" class="lives"></div><span>بالاترین مرحله: <span id="sq-highscore-display">0</span></span></div>
                <div id="sq-hint-container"><span>فرصت راهنما: </span><span id="sq-hint-count">5</span></div>
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

    // Scoped variables and elements
    const scope = {
        level: 1, sequence: [], lives: 3, hintChances: 5, isPlaying: false, highScore: 0, timer: null,
        levelDisplay: view.find('#sq-level-display'), highscoreDisplay: view.find('#sq-highscore-display'),
        livesDisplay: view.find('#sq-lives-display'), hintCountDisplay: view.find('#sq-hint-count'),
        displayText: view.find('#sq-display-text'), sequenceInput: view.find('#sq-sequence-input'),
        fakeInput: view.find('#sq-fake-input'), submitBtn: view.find('#sq-sequence-submit-btn'),
        startBtn: view.find('#sq-start-sequence-btn'), messageDisplay: view.find('#sq-message-display'),
        achievements: JSON.parse(localStorage.getItem('MIND_BATTLE_sequenceAchievements')) || { bronze: false, silver: false, gold: false, master: false }
    };
    const sleep = (ms) => new Promise(resolve => { scope.timer = setTimeout(resolve, ms); });

    function updateUI() {
        scope.levelDisplay.text(scope.level); scope.highscoreDisplay.text(scope.highScore);
        scope.livesDisplay.html(''); for (let i = 1; i <= 3; i++) scope.livesDisplay.append($('<span>').addClass('heart').toggleClass('lost', i > scope.lives).text('♥'));
    }
    async function displaySequence() {
        scope.isPlaying = true; setInputsDisabled(true); scope.displayText.text('آماده؟'); await sleep(1000);
        const displayTime = Math.max(300, 800 - (scope.level * 30));
        for (const num of scope.sequence) { if (!scope.isPlaying) return; scope.displayText.text(num); await sleep(displayTime); scope.displayText.text(''); await sleep(200); }
        if (!scope.isPlaying) return; scope.displayText.text('؟'); scope.isPlaying = false; setInputsDisabled(false); scope.sequenceInput.focus();
    }
    function handleCorrectAnswer() {
        scope.level++;
        if (scope.level > scope.highScore) { scope.highScore = scope.level; localStorage.setItem('MIND_BATTLE_sequenceHighScore', scope.highScore); }
        scope.messageDisplay.text('عالی بود! مرحله بعد...').attr('class', 'message correct');
        setTimeout(() => { resetRoundState(); startRound(); }, 1500);
    }
    function handleWrongAnswer() {
        if (scope.hintChances > 0) {
            scope.hintChances--; scope.messageDisplay.text('اشتباه بود! از راهنمای خودکار استفاده شد.').attr('class', 'message wrong');
            const userAnswer = scope.sequenceInput.val().split(''), correctSequenceChars = scope.sequence.join('').split(''); let coloredHTML = '';
            for (let i = 0; i < correctSequenceChars.length; i++) {
                const char = (i < userAnswer.length) ? userAnswer[i] : '_';
                const charClass = (i < userAnswer.length && userAnswer[i] === correctSequenceChars[i]) ? 'char-correct' : 'char-wrong';
                coloredHTML += `<span class="${charClass}">${char}</span>`;
            }
            scope.fakeInput.html(coloredHTML); setInputsDisabled(false);
        } else {
            scope.lives--;
            if (scope.lives > 0) {
                scope.messageDisplay.text(`فرصت راهنما تمام شد! یک جان از دست دادی.`).attr('class', 'message wrong');
                setTimeout(() => { resetRoundState(); startRound(); }, 2000);
            } else {
                scope.messageDisplay.text(`باختی! دنباله صحیح: ${scope.sequence.join('')}`).attr('class', 'message wrong');
                scope.displayText.text('GAME OVER'); setInputsDisabled(true); scope.startBtn.text('شروع مجدد').prop('disabled', false);
            }
        }
        updateUI();
    }
    function checkAnswer() {
        setInputsDisabled(true);
        (scope.sequenceInput.val() === scope.sequence.join('')) ? handleCorrectAnswer() : handleWrongAnswer();
    }
    function setInputsDisabled(state) { scope.submitBtn.prop('disabled', state); scope.sequenceInput.prop('disabled', state); }
    function resetRoundState() { scope.messageDisplay.text('').attr('class', 'message'); scope.sequenceInput.val(''); scope.fakeInput.html(''); }
    function startRound() { scope.sequence = []; for (let i = 0; i < scope.level; i++) scope.sequence.push(Math.floor(Math.random() * 9) + 1); updateUI(); displaySequence(); }
    function startGame() {
        scope.level = 1; scope.lives = 3; scope.hintChances = 5; scope.highScore = localStorage.getItem('MIND_BATTLE_sequenceHighScore') || 0;
        scope.startBtn.text('...در حال اجرا...').prop('disabled', true);
        startRound();
    }

    view.on('click', '#sq-start-sequence-btn', startGame);
    view.on('click', '#sq-sequence-submit-btn', checkAnswer);
    view.on('keydown', '#sq-sequence-input', e => { if (e.key === 'Enter' && !scope.submitBtn.prop('disabled')) checkAnswer(); });
    view.on('input', '#sq-sequence-input', () => { scope.fakeInput.text(scope.sequenceInput.val()); });
    
    startGame();
    return function cleanup() { scope.isPlaying = false; clearTimeout(scope.timer); view.off(); view.empty(); };
}
