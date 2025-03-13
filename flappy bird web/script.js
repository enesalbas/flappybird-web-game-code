// Canvas ve bağlamı seç
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

// Kuş nesnesini oluştur
const bird = {
    x: 50,
    y: 200,
    width: 40,
    height: 30,
    gravity: 0.5,  
    lift: -9,       
    velocity: 0,
    image: new Image()  
};

// Kuş resmini yükle
bird.image.src = "bird.png";

// Borular için değişkenler
const pipes = [];   
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;
const pipeSpawnRate = 120; 
let frameCount = 0;
let gameOver = false;
let score = 0;
let finalScore = 0; // Oyun bittiğinde skoru saklamak için
let gameStarted = false; // Oyun başlangıcı kontrolü

// Rastgele boru ekleyen fonksiyon
function addPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;

    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: pipeHeight,
        passed: false // Puan için kontrol
    });

    pipes.push({
        x: canvas.width,
        y: pipeHeight + pipeGap,
        width: pipeWidth,
        height: canvas.height - pipeHeight - pipeGap
    });
}

// Boruları güncelle
function updatePipes() {
    if (frameCount % pipeSpawnRate === 0) {
        addPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Eğer boru ekran dışına çıktıysa, kaldır
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            i--;
            continue;
        }

        // Sadece üst boru geçildiğinde puan artır
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x && i % 2 === 0) {
            score++; // Yalnızca üst borudan geçerken puan eklenir
            pipes[i].passed = true; // Tekrar puan eklenmesini engelle
        }
    }
}

// Çarpışma kontrolü
function checkCollision() {
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];

        // Kuş borulara çarptı mı?
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y
        ) {
            gameOver = true;
            finalScore = score; // Skoru sakla
        }
    }

    // Kuş yere çarptı mı?
    if (bird.y + bird.height >= canvas.height) {
        gameOver = true;
        finalScore = score;
    }
}

// Klavye girişlerini dinle
document.addEventListener("keydown", () => {
    if (!gameOver && !gameStarted) {
        gameStarted = true; // Oyun başlasın
    } else if (!gameOver) {
        bird.velocity = bird.lift; // Kuş zıplar
    } else {
        restartGame();
    }
});

// Oyun güncelleme fonksiyonu
function update() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    updatePipes();
    checkCollision();
}

// Çizim fonksiyonu
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Boruları çiz
    ctx.fillStyle = "green";
    for (let i = 0; i < pipes.length; i++) {
        ctx.fillRect(pipes[i].x, pipes[i].y, pipes[i].width, pipes[i].height);
    }

    // Kuşu çiz
    ctx.drawImage(bird.image, bird.x, bird.y, bird.width, bird.height);

    // Puanı ekrana yaz
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Skor: ${score}`, 20, 30);

    // Oyun bittiğinde ekrana yazı yaz
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Oyun Bitti!", canvas.width / 4, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText(`Skorun: ${finalScore}`, canvas.width / 3, canvas.height / 1.8);
        ctx.fillText("Yeniden başlamak için SPACE'e bas", canvas.width / 8, canvas.height / 1.5);
    }

    // Oyun başlamadıysa bilgilendirme yazısı ekleyelim
    if (!gameStarted && !gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Başlamak için SPACE'e bas", canvas.width / 4, canvas.height / 2);
    }
}

// Ana oyun döngüsü
function gameLoop() {
    if (!gameOver) {
        frameCount++;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        draw(); // Oyun bittiğinde skoru göstermek için bir kere daha çiz
    }
}

// Oyunu yeniden başlatma fonksiyonu
function restartGame() {
    bird.y = 200;
    bird.velocity = 0;
    pipes.length = 0; // Tüm boruları temizle
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameStarted = false; // Oyun yeniden başlamalı
    gameLoop();
}

// Oyunu başlat
gameLoop();
