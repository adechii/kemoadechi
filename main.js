'use strict';

// 要素
const elem = {
    start: document.querySelector('#start'),
    restart: document.querySelector('#restart'),
    title: document.querySelector('#title'),
    game: document.querySelector('#game'),
    result: document.querySelector('#result'),
    chi: document.querySelector('#chi'),
    canvas: document.querySelector('#canvas'),
    song: document.querySelector('#song'),
    say: document.querySelector('#say'),
    round: document.querySelector('#round'),
};

// 音声の周波数計算
const note = [];
let nextFreq = Math.pow(2, 1 / 12);
let f;
f = 440;
for (let n = 49; n < 128; n++) {
    note[n] = f;
    f *= nextFreq;
}
f = 440;
for (let n = 49; n >= 0; n--) {
    note[n] = f;
    f /= nextFreq;
}

// 音声開始
let audioContext;
let gainNode = [];
let oscillatorNode = [];
const soundStart = () => {
    audioContext = new AudioContext();

    for(let n = 0; n < 4; n++) {
        oscillatorNode[n] = new OscillatorNode(audioContext);
        oscillatorNode[n].type = "square";

        gainNode[n] = audioContext.createGain();

        oscillatorNode[n].connect(gainNode[n]).connect(audioContext.destination);
        oscillatorNode[n].start(0);

        gainNode[n].gain.setValueAtTime(0, audioContext.currentTime);
    }
}

// 曲データ
const songData = [
    [
        51, 51, -1, 51, // シシ・シ♪
        52, 52, -1, 52, // ドド・ド♪
        51, 51, -1, 51,
        52, 52, -1, 52,
        51, 51, -1, 51,
        52, 52, -1, 52,
        51, 51, 52, 52,
        51, -1, -1, -1,
    ],
    [
        47, 47, -1, 47,
        49, 49, -1, 49,
        47, 47, -1, 47,
        49, 49, -1, 49,
        47, 47, -1, 47,
        49, 49, -1, 49,
        47, 47, 49, 49,
        47, -1, -1, -1,
    ],
    [
        40, 40, -1, 40,
        42, 42, -1, 42,
        40, 40, -1, 40,
        42, 42, -1, 42,
        40, 40, -1, 40,
        42, 42, -1, 42,
        40, 40, 42, 42,
        40, -1, -1, -1,
    ],
    [
        56, 57, 59, 61, // ミファソラ♪
        59, 56, 52, 54, // ソミドレ♪
        56, 57, 59, 56,
        64, -1, 64, -1,
        56, 57, 59, 61,
        59, 56, 52, 54,
        56, 57, 59, 56,
        52, -1, -1, -1,
    ],
];

// 歌詞表示
const lyrics = [
    'けもけも',
    'けもけも',
    'あでちー',
    'あでちー',
    'けもあで',
    'けもあで',
    'ちーちー',
    'ちーちー',
    'けもけも',
    'けもけも',
    'あでちー',
    'あでちー',
    'けもあでちー',
    'けもあでちー',
    'けもあでちー',
    '',
];

// おどりの振り付け
const dance = [
    0, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 1,
    2,
];

// 曲再生
const playSong = () => {
    const currentTime = audioContext.currentTime;
    for (let p = 0; p < 4; p++) {
        gainNode[p].gain.cancelScheduledValues(currentTime);
        oscillatorNode[p].frequency.cancelScheduledValues(currentTime);
        gainNode[p].gain.setValueAtTime(0, currentTime);

        for(let n = 0; n < 32; n++) {
            const d = songData[p][n];
            if(d === -1) continue;

            gainNode[p].gain.setValueAtTime(0, currentTime + n * 0.25);
            gainNode[p].gain.linearRampToValueAtTime(0.25, currentTime + n * 0.25 + 0.001);
            gainNode[p].gain.linearRampToValueAtTime(0.0, currentTime + n * 0.25 + 0.24 - 0.001);

            oscillatorNode[p].frequency.setValueAtTime(note[d], currentTime + n * 0.25);
        }
    }
}

// 「ち」再生
const playChi = () => {
    const currentTime = audioContext.currentTime;
    for (let p = 0; p < 4; p++) {
        gainNode[p].gain.cancelScheduledValues(currentTime);
        oscillatorNode[p].frequency.cancelScheduledValues(currentTime);
        gainNode[p].gain.setValueAtTime(0, currentTime);
    }

    gainNode[0].gain.setValueAtTime(0, currentTime);
    gainNode[0].gain.linearRampToValueAtTime(0.25, currentTime + 0.001);
    gainNode[0].gain.linearRampToValueAtTime(0.25, currentTime + 0.2 - 0.001);
    gainNode[0].gain.linearRampToValueAtTime(0, currentTime + 0.2);

    oscillatorNode[0].frequency.setValueAtTime(note[64], currentTime);
}

// もぬ再生
const playMonu = (startNote, time, deltaNote) => {
    const currentTime = audioContext.currentTime;
    gainNode[0].gain.cancelScheduledValues(currentTime);
    oscillatorNode[0].frequency.cancelScheduledValues(currentTime);

    gainNode[0].gain.setValueAtTime(0, currentTime);
    gainNode[0].gain.linearRampToValueAtTime(0.25, currentTime + 0.001);
    gainNode[0].gain.linearRampToValueAtTime(0.0, currentTime + time - 0.001);

    oscillatorNode[0].frequency.setValueAtTime(note[startNote], currentTime);
    oscillatorNode[0].frequency.linearRampToValueAtTime(note[startNote + deltaNote], currentTime + time);
}

// 表示
const show = (id) => {
    if(elem[id].classList.contains('none')) elem[id].classList.remove('none');
};
// 非表示
const hide = (id) => {
    if(!elem[id].classList.contains('none')) elem[id].classList.add('none');
};

const context = elem.canvas.getContext('2d'); // 描画コンテキスト
const image = document.createElement('img'); // 画像

// 画像の読み込みの監視
let imageLoaded = false;
image.addEventListener('load', (e) => {
    imageLoaded = true;
});
image.src = 'image.png';

// 描画関数
const draw = (sx, sy) => {
    if(!imageLoaded) return;
    context.drawImage(image, sx * 128, sy * 128, 128, 128, 0, 0, 128, 128);
};

let stage = 'title'; // ゲームの段階
let songTime; // 曲の進行度
let monuCount; // もぬ回数
let prevMonuCount; // 前フレームのもぬ回数
let monuDamage; // もぬされた時に減るHP
let monuSpeed; // もぬするスピード
let monuSprite = []; // もぬの絵
let monuSound = []; // もぬ音
let countdown; // 最初のカウントダウン
let chiWait; // 「ち」の時のウェイト
let judge; // 判定のための時間
let prevTimestamp = 0; // 前回フレームのタイムスタンプ
let round = 0; // HP
let hp = 100; // HP

// セリフ表示
const viewSong = (text) => {
    elem.song.textContent = text;
};

// セリフ表示
const say = (name, text) => {
    elem.say.className = name;
    elem.say.textContent = text;
};

// 初期化
const init = () => {
    songTime = 0;
    monuCount = 0;
    prevMonuCount = 0;
    countdown = 4;
    chiWait = 3;
    judge = -100;
    round++;
}

// ゲーム中の処理
const gameFn = (deltaTime) => {
    if(countdown > 0) {
        countdown -= deltaTime * 2;
        viewSong(Math.floor(countdown));
        draw(2, 0);
        if(countdown <= 0) playSong();
        else return;
    }

    songTime += deltaTime;

    const beat = Math.floor(songTime * 2);
    if(beat < lyrics.length) {
        viewSong(lyrics[beat]);
        draw(dance[beat], 0);
    }
}

// 「ち」中の処理
const chiFn = (deltaTime) => {
    if(chiWait > 0) {
        chiWait -= deltaTime;
        if(chiWait <= 0) {
            hide('game');
            show('result');
            stage = 'eaten';
        }
    }
}

// もぬ開始
const monuStart = () => {
    // 始まる前
    if(judge < -7.4) {
        monuSpeed = 8;
        monuDamage = 1;
        monuSprite = [0, 2, 3, 1, 1, 2, 3, 1, 2, 2, 3, 1, 3, 2, 3, 1, 0, 3, 3, 1, 1, 3, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1, 32, 12, -1, -1, 32, -12, -1, -1, 32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', 'まだ始まってないだろ！めちゃくちゃになめてやる。');
    } else
    // 早すぎ
    if(judge < -1) {
        monuSpeed = 6;
        monuDamage = 0.5;
        monuSprite = [0, 2, 3, 1, 1, 2, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', '早すぎるだろ！罰として速く前後になめてやる。');
    } else
    // 早い
    if(judge < -0.05) {
        monuSpeed = 5;
        monuDamage = 0.2;
        monuSprite = [0, 2, 3, 1, 1, 2, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', '少し早いわ。お仕置きで前後になめてやる。');
    } else
    // ジャスト
    if(judge < 0.05) {
        monuSpeed = 4;
        monuDamage = 0.1;
        monuSprite = [2, 2, 3, 1, 3, 2, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', 'ぴったりだ。ご褒美に上下になめてやる。');
    } else
    // 遅い
    if(judge < 1) {
        monuSpeed = 5;
        monuDamage = 0.2;
        monuSprite = [0, 3, 3, 1, 1, 3, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', '少し遅いわ。お仕置きで左右になめてやる。');
    } else
    // 遅すぎ
    if(judge < 5) {
        monuSpeed = 6;
        monuDamage = 0.5;
        monuSprite = [0, 3, 3, 1, 1, 3, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', '遅すぎるだろ！罰として速く左右になめてやる。');
    } else
    // 待ちくたびれた
    {
        monuSpeed = 8;
        monuDamage = 1;
        monuSprite = [0, 2, 3, 1, 1, 2, 3, 1, 2, 2, 3, 1, 3, 2, 3, 1, 0, 3, 3, 1, 1, 3, 3, 1];
        monuSound = [32, 12, -1, -1, 32, -12, -1, -1, 32, 12, -1, -1, 32, -12, -1, -1, 32, 12, -1, -1, 32, -12, -1, -1];
        say('dragon', '待ちくたびれたわ！めちゃくちゃになめてやる。');
    }
}

// もぬ開始
const monuContinue = () => {
    // 始まる前
    if(judge < -7.4) {
        say('dragon', '処刑中。');
    } else
    // 早すぎ
    if(judge < -1) {
        say('dragon', '処罰中。');
    } else
    // 早い
    if(judge < -0.05) {
        say('dragon', 'お仕置き中。');
    } else
    // ジャスト
    if(judge < 0.05) {
        say('dragon', 'ご褒美中。');
    } else
    // 遅い
    if(judge < 1) {
        say('dragon', 'お仕置き中。');
    } else
    // 遅すぎ
    if(judge < 5) {
        say('dragon', '処罰中。');
    } else
    // 待ちくたびれた
    {
        say('dragon', '処刑中。');
    }
}
// もぬした結果
const monuResult = () => {
    // 始まる前
    if(judge < -7.4) {
        say('dragon', 'ふざけるとこうするからな。');
    } else
    // 早すぎ
    if(judge < -1) {
        say('dragon', 'よし、もう許してやる。');
    } else
    // 早い
    if(judge < -0.05) {
        say('dragon', '残念だったな。');
    } else
    // ジャスト
    if(judge < 0.05) {
        say('dragon', 'おいしかったぞ。');
    } else
    // 遅い
    if(judge < 1) {
        say('dragon', '残念だったな。');
    } else
    // 遅すぎ
    if(judge < 5) {
        say('dragon', 'よし、もう許してやる。');
    } else
    // 待ちくたびれた
    {
        say('dragon', 'ふざけるとこうするからな。');
    }
}

// もぬ開始
const monuEnd = () => {
    // 始まる前
    if(judge < -7.4) {
        say('adechi', 'いやああん…まじめにやります…。');
    } else
    // 早すぎ
    if(judge < -1) {
        say('adechi', 'やあん…ちゃんとやります…。');
    } else
    // 早い
    if(judge < -0.05) {
        say('adechi', 'やんん…次は頑張る…。');
    } else
    // ジャスト
    if(judge < 0.05) {
        say('adechi', 'ドラゴンさん好き…。');
    } else
    // 遅い
    if(judge < 1) {
        say('adechi', 'やんん…次は頑張る…。');
    } else
    // 遅すぎ
    if(judge < 5) {
        say('adechi', 'やあん…ちゃんとやります…。');
    } else
    // 待ちくたびれた
    {
        say('adechi', 'いやああん…まじめにやります…。');
    }
}

let prevSound = -1;

// たべられ中の処理
const eatenFn = (deltaTime) => {
    prevMonuCount = monuCount;
    monuCount += deltaTime;

    // セリフ
    if(monuCount < 4) {
        monuStart();
        draw(0, 1);
    }else

    // 口に入れるアニメーション
    if(monuCount < 8) {
        const c = Math.floor(monuCount) - 4
        draw(c, 1);

        if(Math.floor(monuCount) === 5 && Math.floor(prevMonuCount) === 4) playMonu(32, 0.2, -12);
    }else

    // もぬ中
    if(monuCount < 8 + 12) {
        const c = Math.floor(monuCount * monuSpeed) - 8
        const s = c % (monuSprite.length / 2);
        draw(
            monuSprite[s * 2],
            monuSprite[s * 2 + 1]
        );
        if(
            s !== prevSound &&
            monuSound[s * 2] >= 0
        ) {
            playMonu(monuSound[s * 2], 0.1, monuSound[s * 2 + 1]);
            hp -= monuDamage;
            if(hp <= 0) {
                hp = 0;
            }
        }
        monuContinue();
        prevSound = s;
    }else

    // もぬ終了
    if(monuCount < 26) {
        const c = Math.floor(monuCount) - 20;
        if(c === 0) draw(3, 1);
        if(c === 2) draw(2, 1);
        if(c === 4) draw(1, 1);
        if(c === 0) say('dragon', '');
        if(c === 4 && hp > 0) monuResult();
        if(c === 4 && hp <= 0) say('dragon', '');
    }else

    // 口を開ける
    if(monuCount < 100) {
        const c = Math.floor(monuCount) - 26;
        draw(c % 2 + 2, 3);
        if(Math.floor(monuCount) === 26 && Math.floor(prevMonuCount) === 25) playMonu(24, 0.2, 24);
        if(hp > 0) {
            monuEnd();
            show('restart');
        }
        else {
            say('adechi', 'も…もうだめ…。');
        }
    }
}

let startDance = 0;

// 描画フレーム
const frame = (timestamp) => {
    requestAnimationFrame(frame);
    const deltaTime = (timestamp - prevTimestamp) / 1000;

    if(stage === 'title') {
        startDance += deltaTime;
        draw(Math.floor(startDance) % 2, 0);
    }
    if(stage === 'game') gameFn(deltaTime);
    if(stage === 'chi') chiFn(deltaTime);
    if(stage === 'eaten') eatenFn(deltaTime);

    prevTimestamp = timestamp;
}
requestAnimationFrame(frame);

// 開始ボタンを押した
elem.start.addEventListener('click', (e) => {
    hide('title');
    show('game');
    soundStart();
    stage = 'game';
    songTime = 0;
    init();
});

// 「ち」ボタンを押した
elem.chi.addEventListener('click', (e) => {
    judge = songTime - 7.5; // 判定
    playChi();
    stage = 'chi';
    viewSong('ち');
    draw(3, 0);
});

// リスタートボタンを押した
elem.restart.addEventListener('click', (e) => {
    hide('result');
    hide('restart');
    show('game');
    stage = 'game';
    init();
});