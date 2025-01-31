// انتخاب عنصر canvas

const canvas = document.getElementById("pong");

const ctx = canvas.getContext('2d');



// بارگذاری صداها

let hit = new Audio();

let wall = new Audio();

let userScore = new Audio();

let comScore = new Audio();



hit.src = "sounds/hit.mp3";

wall.src = "sounds/wall.mp3";

comScore.src = "sounds/comScore.mp3";

userScore.src = "sounds/userScore.mp3";



// شیء توپ

const ball = {

    x: canvas.width / 2,

    y: canvas.height / 2,

    radius: 10,

    velocityX: 5,

    velocityY: 5,

    speed: 7,

    color: "#00FFFF" // آبی نئونی

};



// پدل بازیکن

const user = {

    x: 50,

    y: (canvas.height - 100) / 2,

    width: 10,

    height: 100,

    score: 0,

    color: "#007BFF" // آبی الکتریکی

};



// پدل حریف (کامپیوتر)

const com = {

    x: canvas.width - 60,

    y: (canvas.height - 100) / 2,

    width: 10,

    height: 100,

    score: 0,

    color: "#FF3B3B" // قرمز مات

};



// متغیر برای قدرت‌ها

let powerUpActive = false;

let powerUp = {

    x: 0,

    y: 0,

    width: 20,

    height: 20,

    color: "#4CAF50",  // رنگ سبز برای قدرت مثبت

    isActive: false

};



// رسم مستطیل (برای پدل‌ها و پس‌زمینه)

function drawRect(x, y, w, h, color) {

    ctx.fillStyle = color;

    ctx.fillRect(x, y, w, h);

}



// رسم دایره (برای توپ)

function drawArc(x, y, r, color) {

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(x, y, r, 0, Math.PI * 2, true);

    ctx.closePath();

    ctx.fill();

}



// گوش دادن به حرکت ماوس برای کنترل پدل بازیکن

canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt) {

    let rect = canvas.getBoundingClientRect();

    user.y = evt.clientY - rect.top - user.height / 2;

}



// ریست کردن توپ هنگام امتیازگیری

function resetBall() {

    ball.x = canvas.width / 2;

    ball.y = canvas.height / 2;

    ball.velocityX = -ball.velocityX;

    ball.speed = 7;

}



// رسم امتیازها

function drawText(text, x, y) {

    ctx.fillStyle = "#FFD700"; // طلایی متالیک

    ctx.font = "50px fantasy";

    ctx.fillText(text, x, y);

}



// بررسی برخورد توپ با پدل

function collision(b, p) {

    return (

        b.x - b.radius < p.x + p.width &&

        b.x + b.radius > p.x &&

        b.y - b.radius < p.y + p.height &&

        b.y + b.radius > p.y

    );

}



// تابع اسپاون (ظاهر شدن) قدرت

function spawnPowerUp() {

    if (!powerUp.isActive) {

        powerUp.x = Math.random() * (canvas.width - 100) + 50; // موقعیت افقی تصادفی

        powerUp.y = Math.random() * (canvas.height - 100) + 50; // موقعیت عمودی تصادفی

        powerUp.isActive = true;

    }

}



// تابع بررسی برخورد با آیتم قدرت

function checkPowerUpCollision() {

    if (powerUp.isActive && ball.x - ball.radius < powerUp.x + powerUp.width && 

        ball.x + ball.radius > powerUp.x && 

        ball.y - ball.radius < powerUp.y + powerUp.height &&

        ball.y + ball.radius > powerUp.y) {

        

        // وقتی توپ به آیتم برخورد کرد

        user.height += 20;  // بزرگ کردن راکت بازیکن

        powerUp.isActive = false;  // مخفی کردن آیتم بعد از برخورد

        setTimeout(() => {

            user.height -= 20;  // بازگشت به اندازه اولیه بعد از 5 ثانیه

        }, 5000);  // مدت زمان 5 ثانیه

    }

}



// تابع بروزرسانی وضعیت بازی

function update() {

    // اسپاون آیتم قدرت

    spawnPowerUp();

    

    // بررسی برخورد توپ با آیتم

    checkPowerUpCollision();



    if (ball.x - ball.radius < 0) {

        com.score++;

        comScore.play();

        resetBall();

    } else if (ball.x + ball.radius > canvas.width) {

        user.score++;

        userScore.play();

        resetBall();

    }



    ball.x += ball.velocityX;

    ball.y += ball.velocityY;



    // حرکت کامپیوتر با کمی خطا

    let randomError = Math.random() * 0.5 - 0.25; // ایجاد یک خطای تصادفی کوچیک

    com.y += (ball.y - (com.y + com.height / 2)) * 0.05 + randomError;



    // جلوگیری از خارج شدن توپ از زمین

    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {

        ball.velocityY = -ball.velocityY;

        wall.play();

    }



    let player = (ball.x < canvas.width / 2) ? user : com;



    if (collision(ball, player)) {

        hit.play();

        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);

        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.1;

    }



    // وقتی امتیاز یک نفر به 20 رسید

    if (user.score === 20 || com.score === 20) {

        // بازی متوقف می‌شود

        clearInterval(loop);

        

        // پیام به بازیکن

        setTimeout(() => {

            let winner = user.score === 20 ? "تو" : "کامپیوتر";

            let message = user.score === 20 

                ? "🎉 آفرین! تو برنده شدی! 🏆👏" 

                : "😢 آخی! باختی! دوباره امتحان کن، شاید دفعه بعد برنده بشی! 😎";

            alert(message); // پیام ساده

            // ریست کردن امتیازات و شروع دوباره

            user.score = 0;

            com.score = 0;

            resetBall();

            loop = setInterval(game, 1000 / framePerSecond);  // شروع دوباره بازی

        }, 1000); // یک ثانیه صبر می‌کنیم که بازیکن نتیجه رو ببینه

    }

}



// تابع رسم تمام عناصر بازی

function render() {

    // پس‌زمینه گرادینتی شیک

    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

    gradient.addColorStop(0, "#0F2027");

    gradient.addColorStop(0.5, "#203A43");

    gradient.addColorStop(1, "#2C5364");

    drawRect(0, 0, canvas.width, canvas.height, gradient);



    // داخل میز (زمین بازی)

    drawRect(50, 50, canvas.width - 100, canvas.height - 100, "#1C1C1C");



    // امتیازدهی

    drawText(user.score, canvas.width / 4, canvas.height / 5);

    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);



    // خط وسط زمین

    ctx.setLineDash([5, 5]);

    ctx.strokeStyle = "#FFFFFF";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(canvas.width / 2, 50);

    ctx.lineTo(canvas.width / 2, canvas.height - 50);

    ctx.stroke();

    ctx.setLineDash([]);



    // افکت Glow برای توپ و پدل‌ها

    ctx.shadowBlur = 15;

    ctx.shadowColor = "#00FFFF";

    drawArc(ball.x, ball.y, ball.radius, "#00FFFF");



    ctx.shadowColor = "#007BFF";

    drawRect(user.x, user.y, user.width, user.height, "#007BFF");



    ctx.shadowColor = "#FF3B3B";

    drawRect(com.x, com.y, com.width, com.height, "#FF3B3B");



    ctx.shadowBlur = 0;



    // رندر کردن آیتم قدرت

    if (powerUp.isActive) {

        drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, powerUp.color);

    }

}



// تابع اجرای بازی

function game() {

    update();

    render();

}



// تعداد فریم در ثانیه

let framePerSecond = 50;

let loop = setInterval(game, 1000 / framePerSecond);


// ذخیره و نمایش جدول رتبه‌بندی
function updateLeaderboard(winner) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
    
    // افزایش برد بازیکن
    leaderboard[winner] = (leaderboard[winner] || 0) + 1;

    // ذخیره در LocalStorage
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    // مرتب‌سازی و نمایش رتبه‌بندی
    displayLeaderboard(leaderboard);
}

// نمایش جدول رتبه‌بندی
function displayLeaderboard(leaderboard) {
    let sortedPlayers = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

    let leaderboardHTML = "";
    sortedPlayers.forEach((player, index) => {
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
        leaderboardHTML += `<li>${medal} ${player[0]} - ${player[1]} برد</li>`;
    });

    document.getElementById("leaderboard-list").innerHTML = leaderboardHTML;
}

// بروزرسانی بعد از پایان بازی
function endGame() {
    clearInterval(loop);

    let winner = user.score === 20 ? "بازیکن" : "کامپیوتر";
    updateLeaderboard(winner);

    setTimeout(() => {
        alert(user.score === 20 ? "🎉 تو برنده شدی!" : "😢 باختی! دوباره امتحان کن!");
        user.score = 0;
        com.score = 0;
        resetBall();
        loop = setInterval(game, 1000 / framePerSecond);
    }, 1000);
}

// نمایش رتبه‌بندی در شروع بازی
displayLeaderboard(JSON.parse(localStorage.getItem("leaderboard")) || {});
