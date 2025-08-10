// 앱 상태
const appState = {
  selectedCategory: null,
  articleText: '',
  sentences: [],
  activeSentenceIndex: 0,
  ttsUtterance: null,
  ttsIsPaused: false,
  t0: 0,
  elapsedMs: 0,
  quiz: [],
  quizAnswers: {},
  // ASR/정독률
  speechRecognition: null,
  isMicOn: false,
  recognizedBySentence: [], // 배열 인덱스 = 문장 인덱스
  similarityBySentence: [], // 0..1
  readingAccuracy: 0, // 0..1
};

// 내장 샘플 기사(200~250단어 수준의 짧은 문장 위주)
const SAMPLE_ARTICLES = {
  health: `하루 1분 읽기는 뇌를 깨우는 가장 간단한 습관입니다. 너무 길지 않은 글을 꾸준히 읽으면 집중력이 조금씩 늘어납니다. 글을 소리 내어 읽을 때는 호흡이 일정해지고 마음이 차분해집니다. 또한 새로운 단어를 접하면 뇌가 연결을 만들며 기억을 강화합니다. 오늘은 균형 잡힌 식사와 가벼운 걷기가 건강에 주는 이점을 소개합니다. 채소와 과일은 몸에 필요한 비타민과 식이섬유를 제공합니다. 하루에 20분 정도 걷기만 해도 혈액 순환이 좋아지고 기분이 밝아질 수 있습니다. 읽고, 듣고, 생각을 정리하는 이 짧은 시간이 인지 건강을 지키는 발판이 됩니다.`,
  life: `가까운 공원을 천천히 산책하는 것만으로도 하루가 달라질 수 있습니다. 나무와 꽃을 바라보고 햇빛을 쬐면 기분이 한결 가벼워집니다. 짧은 산책 전에는 물 한 잔을 마시고, 편한 신발을 신는 것이 좋습니다. 산책 중에는 주변을 살피며 바람 소리나 새소리를 들어보세요. 오감이 깨어나면 마음이 안정되고 생각이 정리됩니다. 산책이 끝나면 가볍게 스트레칭을 하며 몸의 느낌을 확인해 보세요. 작은 습관이 모이면 생활의 리듬이 생기고, 하루가 더 분명하게 기억됩니다.`,
  economy: `가계부를 간단히 정리하는 것만으로도 생활이 더 안정됩니다. 오늘 들어온 돈과 나간 돈을 적어 보면 지출의 흐름이 보입니다. 꼭 필요한 지출과 그렇지 않은 지출을 구분하는 것이 첫걸음입니다. 일주일에 한 번 비용을 되돌아보면 낭비를 줄일 방법을 떠올릴 수 있습니다. 예를 들면, 사용하지 않는 구독을 정리하거나 에너지 절약을 실천하는 것입니다. 이렇게 작은 선택이 쌓이면 한 달 뒤 남는 금액이 달라집니다. 돈의 흐름을 이해하는 일은 미래에 대한 불안을 줄이고 마음의 여유를 만듭니다.`,
  society: `동네 도서관은 가까운 곳에서 새로운 생각을 만나는 공간입니다. 회원 가입만 하면 누구나 책을 빌릴 수 있고, 무료 강좌나 소모임에도 참여할 수 있습니다. 낯선 사람과 이야기해 보면 다른 관점을 배우게 됩니다. 도서관에서 한 시간 정도 머물며 신문을 읽거나 관심 있는 책을 살펴보세요. 조용한 공간에서 천천히 글을 읽다 보면 마음이 차분해지고 호기심이 살아납니다. 작은 교류가 이어지면 사회와의 연결감도 자연스럽게 커집니다.`,
  sports: `가벼운 근력 운동은 일상 속에서 쉽게 시작할 수 있습니다. 의자에 앉았다 일어나기를 10번 반복하고, 물병을 들고 팔을 천천히 들어 올려 보세요. 무리하지 않고 호흡을 고르게 유지하는 것이 중요합니다. 운동 전후에는 어깨와 다리를 부드럽게 풀어 줍니다. 일주일에 세 번, 10분만 실천해도 몸의 균형과 안정감이 좋아집니다. 몸을 움직이면 혈액 순환이 활발해지고 수면의 질도 향상될 수 있습니다. 간단한 운동이지만 꾸준함이 힘이 됩니다.`,
};

// DOM 참조
const stepEls = [1, 2, 3, 4].map((n) => document.getElementById(`step-${n}`));
const goStep2Btn = document.getElementById('go-step-2');
const goStep3Btn = document.getElementById('go-step-3');
const readingTextEl = document.getElementById('reading-text');
const elapsedEl = document.getElementById('elapsed');
const fontSizeRange = document.getElementById('font-size');
const lineHeightRange = document.getElementById('line-height');
const ttsRateSelect = document.getElementById('tts-rate');
const btnListen = document.getElementById('btn-listen');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const btnMicStart = document.getElementById('btn-mic-start');
const btnMicStop = document.getElementById('btn-mic-stop');
const quizArea = document.getElementById('quiz-area');
const submitQuizBtn = document.getElementById('submit-quiz');
const resultEl = document.getElementById('result');
const btnShare = document.getElementById('btn-share');
const btnCopy = document.getElementById('btn-copy');
const restartBtn = document.getElementById('restart');

// 단계 제어
function goToStep(stepNumber) {
  stepEls.forEach((el, idx) => {
    el.classList.toggle('active', idx === stepNumber - 1);
  });
}

// 카테고리 선택
document.querySelectorAll('.btn.category').forEach((btn) => {
  btn.addEventListener('click', () => {
    appState.selectedCategory = btn.dataset.category;
    document.querySelectorAll('.btn.category').forEach((b) => b.classList.remove('primary'));
    btn.classList.add('primary');
    goStep2Btn.disabled = false;
  });
});

goStep2Btn.addEventListener('click', () => {
  if (!appState.selectedCategory) return;
  appState.articleText = SAMPLE_ARTICLES[appState.selectedCategory] || '';
  appState.sentences = splitIntoSentences(appState.articleText);
  appState.activeSentenceIndex = 0;
  appState.recognizedBySentence = new Array(appState.sentences.length).fill('');
  appState.similarityBySentence = new Array(appState.sentences.length).fill(0);
  appState.readingAccuracy = 0;
  renderSentences();
  resetTimer();
  goToStep(2);
});

// 읽기 영역 렌더링
function renderSentences() {
  readingTextEl.innerHTML = '';
  appState.sentences.forEach((s, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'sentence' + (i === appState.activeSentenceIndex ? ' active' : '');
    const original = document.createElement('span');
    original.textContent = s;
    const recognized = document.createElement('span');
    recognized.className = 'recognized';
    recognized.textContent = appState.recognizedBySentence[i] || '';
    applyMatchColor(recognized, appState.similarityBySentence[i] || 0);
    wrap.appendChild(original);
    wrap.appendChild(recognized);
    wrap.addEventListener('click', () => {
      appState.activeSentenceIndex = i;
      highlightActiveSentence();
    });
    readingTextEl.appendChild(wrap);
  });
  applyTypography();
}

// 문장 분리(간단 규칙)
function splitIntoSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?\u3002\uFF01\uFF1F])\s+/)
    .filter((s) => s && s.trim().length > 0);
}

// 타이포 조정
function applyTypography() {
  const fontPx = Number(fontSizeRange.value);
  const linePx = Number(lineHeightRange.value);
  readingTextEl.style.fontSize = `${fontPx}px`;
  readingTextEl.style.lineHeight = `${linePx / 10}`;
}

fontSizeRange.addEventListener('input', applyTypography);
lineHeightRange.addEventListener('input', applyTypography);

// 타이머
let timerHandle = null;
function resetTimer() {
  clearInterval(timerHandle);
  appState.t0 = Date.now();
  appState.elapsedMs = 0;
  updateElapsed();
  timerHandle = setInterval(() => {
    appState.elapsedMs = Date.now() - appState.t0;
    updateElapsed();
  }, 250);
}

function updateElapsed() {
  const totalSec = Math.floor(appState.elapsedMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  elapsedEl.textContent = `${mm}:${ss}`;
}

// TTS 제어
function speakCurrentArticle() {
  stopTTS();
  const utter = new SpeechSynthesisUtterance(appState.articleText);
  utter.lang = 'ko-KR';
  utter.rate = Number(ttsRateSelect.value);
  utter.onstart = () => {
    appState.activeSentenceIndex = 0;
    renderSentences();
  };
  // 일부 브라우저만 boundary 지원
  utter.onboundary = (e) => {
    if (e.name === 'sentence' || e.charIndex != null) {
      // 거친 추정: 글자 위치 기준으로 문장 인덱스 업데이트
      const upto = appState.articleText.slice(0, e.charIndex);
      const count = splitIntoSentences(upto).length - 1;
      appState.activeSentenceIndex = Math.max(0, Math.min(count, appState.sentences.length - 1));
      highlightActiveSentence();
    }
  };
  utter.onend = () => highlightNone();
  appState.ttsUtterance = utter;
  window.speechSynthesis.speak(utter);
}

function pauseTTS() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    appState.ttsIsPaused = true;
  } else if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    appState.ttsIsPaused = false;
  }
}

function stopTTS() {
  try { window.speechSynthesis.cancel(); } catch {}
  appState.ttsUtterance = null;
}

function highlightActiveSentence() {
  const spans = readingTextEl.querySelectorAll('.sentence');
  spans.forEach((el, i) => el.classList.toggle('active', i === appState.activeSentenceIndex));
}

function highlightNone() {
  const spans = readingTextEl.querySelectorAll('.sentence');
  spans.forEach((el) => el.classList.remove('active'));
}

btnListen.addEventListener('click', speakCurrentArticle);
btnPause.addEventListener('click', pauseTTS);
btnStop.addEventListener('click', stopTTS);

// 마이크 따라 읽기 (ASR)
btnMicStart.addEventListener('click', startMicReading);
btnMicStop.addEventListener('click', stopMicReading);

function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  return new SR();
}

function startMicReading() {
  if (appState.isMicOn) return;
  const rec = getSpeechRecognition();
  if (!rec) {
    alert('이 브라우저는 음성 인식을 지원하지 않습니다 (Chrome 권장)');
    return;
  }
  appState.speechRecognition = rec;
  rec.lang = 'ko-KR';
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (event) => {
    const lastIdx = event.results.length - 1;
    if (lastIdx < 0) return;
    const res = event.results[lastIdx];
    const transcript = Array.from(res)
      .map((alt) => alt.transcript)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const idx = appState.activeSentenceIndex;
    appState.recognizedBySentence[idx] = transcript;
    const ref = (appState.sentences[idx] || '').trim();
    const sim = normalizedSimilarity(ref, transcript);
    appState.similarityBySentence[idx] = sim;
    updateRecognizedRender(idx, transcript, sim);
    updateReadingAccuracy();
  };
  rec.onerror = () => {};
  rec.onend = () => {
    appState.isMicOn = false;
  };
  try {
    rec.start();
    appState.isMicOn = true;
  } catch {}
}

function stopMicReading() {
  try { appState.speechRecognition && appState.speechRecognition.stop(); } catch {}
  appState.isMicOn = false;
}

function updateRecognizedRender(index, text, similarity) {
  const nodes = readingTextEl.querySelectorAll('.sentence');
  const node = nodes[index];
  if (!node) return;
  let recognized = node.querySelector('.recognized');
  if (!recognized) {
    recognized = document.createElement('span');
    recognized.className = 'recognized';
    node.appendChild(recognized);
  }
  recognized.textContent = text || '';
  applyMatchColor(recognized, similarity || 0);
}

function applyMatchColor(element, similarity) {
  element.classList.remove('match-good', 'match-mid', 'match-bad');
  if (!element.textContent) return;
  if (similarity >= 0.85) element.classList.add('match-good');
  else if (similarity >= 0.6) element.classList.add('match-mid');
  else element.classList.add('match-bad');
}

function updateReadingAccuracy() {
  const sims = appState.similarityBySentence;
  if (!sims.length) { appState.readingAccuracy = 0; return; }
  // 읽은 문장만 평균(인식 텍스트 있는 문장 기준)
  const pairs = sims.map((v, i) => ({ v, t: appState.recognizedBySentence[i] }))
    .filter((p) => (p.t || '').length > 0);
  if (!pairs.length) { appState.readingAccuracy = 0; return; }
  const avg = pairs.reduce((acc, p) => acc + (p.v || 0), 0) / pairs.length;
  appState.readingAccuracy = avg;
}

// 문자열 유사도(정규화된 레벤슈타인 유사도)
function normalizedSimilarity(a, b) {
  const s = (a || '').trim();
  const t = (b || '').trim();
  if (!s && !t) return 1;
  const d = levenshteinDistance(s, t);
  const denom = Math.max(s.length, t.length) || 1;
  return Math.max(0, 1 - d / denom);
}

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) dp[j] = prev;
      else dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      prev = temp;
    }
  }
  return dp[n];
}

// 퀴즈 단계
goStep3Btn.addEventListener('click', async () => {
  stopTTS();
  appState.quiz = await generateQuiz(appState.articleText);
  appState.quizAnswers = {};
  renderQuiz();
  goToStep(3);
});

async function generateQuiz(text) {
  // Netlify 서버리스 함수가 배포되면 아래 경로가 활성화됩니다
  try {
    const res = await fetch('/.netlify/functions/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.questions)) return data.questions;
    }
  } catch {}
  // Fallback: 간단 규칙 기반 3문항
  return naiveQuestions(text);
}

function naiveQuestions(text) {
  const first = appState.sentences[0] || '';
  const theme = first.replace(/입니다[.!?]?$/, '').slice(0, 20);
  return [
    {
      id: 'q1',
      type: 'mc',
      question: `글의 주된 내용으로 가장 가까운 것은?`,
      options: [
        `${theme}에 대한 설명`,
        '복잡한 역사 이야기',
        '장거리 여행 안내',
        '전문 투자 분석',
      ],
      answer: 0,
    },
    {
      id: 'q2',
      type: 'mc',
      question: '글에서 권장하거나 제안하는 행동은?',
      options: ['꾸준한 짧은 실천', '고가 장비 구매', '장시간 고강도 훈련', '즉시 중단'],
      answer: 0,
    },
    { id: 'q3', type: 'ox', question: '이 글은 일상에서 작은 변화를 강조한다.', answer: true },
  ];
}

function renderQuiz() {
  quizArea.innerHTML = '';
  appState.quiz.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    const title = document.createElement('h3');
    title.textContent = `${idx + 1}. ${q.question}`;
    card.appendChild(title);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'quiz-options';
    if (q.type === 'mc') {
      q.options.forEach((opt, i) => {
        const id = `${q.id}_${i}`;
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = q.id;
        input.value = String(i);
        input.id = id;
        input.addEventListener('change', () => (appState.quizAnswers[q.id] = i));
        label.setAttribute('for', id);
        label.textContent = opt;
        optionsWrap.appendChild(input);
        optionsWrap.appendChild(label);
      });
    } else if (q.type === 'ox') {
      ['O(참)', 'X(거짓)'].forEach((opt, i) => {
        const id = `${q.id}_${i}`;
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = q.id;
        input.value = i === 0 ? 'true' : 'false';
        input.id = id;
        input.addEventListener('change', () => (appState.quizAnswers[q.id] = i === 0));
        label.setAttribute('for', id);
        label.textContent = opt;
        optionsWrap.appendChild(input);
        optionsWrap.appendChild(label);
      });
    }
    card.appendChild(optionsWrap);
    quizArea.appendChild(card);
  });
}

submitQuizBtn.addEventListener('click', () => {
  const { scoreQuiz, scoreTime, totalScore, message } = grade();
  renderResult(scoreQuiz, scoreTime, totalScore, message);
  goToStep(4);
});

function grade() {
  // 퀴즈 60점
  let correct = 0;
  appState.quiz.forEach((q) => {
    if (q.type === 'mc' && Number(appState.quizAnswers[q.id]) === Number(q.answer)) correct++;
    if (q.type === 'ox' && Boolean(appState.quizAnswers[q.id]) === Boolean(q.answer)) correct++;
  });
  const scoreQuiz = Math.round((correct / appState.quiz.length) * 60);
  // 시간 20점(목표 60초, 선형 감점)
  const sec = Math.max(1, Math.floor(appState.elapsedMs / 1000));
  const target = 60;
  const ratio = Math.max(0, Math.min(1, target / sec));
  const scoreTime = Math.round(20 * ratio);
  // 정독률 20점(문장 평균 유사도)
  const acc = appState.readingAccuracy || 0;
  const scoreAccuracy = Math.round(20 * acc);
  const totalScore = scoreQuiz + scoreTime + scoreAccuracy;
  let message = '잘하셨어요! 작은 실천이 힘이 됩니다.';
  if (totalScore >= 90) message = '멋져요! 오늘도 또렷한 집중! ⭐';
  else if (totalScore >= 70) message = '아주 좋아요! 내일은 더 가볍게! 😊';
  else message = '괜찮아요! 내일은 조금만 더 또박또박! 💪';
  return { scoreQuiz, scoreTime, scoreAccuracy, totalScore, message };
}

function renderResult(scoreQuiz, scoreTime, totalScore, message) {
  resultEl.innerHTML = `
    <div><strong>총점</strong>: ${totalScore}점 (퀴즈 ${scoreQuiz} + 시간 ${scoreTime} + 정독률 ${Math.round((appState.readingAccuracy||0)*20)})</div>
    <div class="stamp">오늘도 읽기 완료! ✅</div>
    <div class="msg">${message}</div>
  `;
}

// 공유
btnShare.addEventListener('click', async () => {
  const shareText = buildShareText();
  if (navigator.share) {
    try { await navigator.share({ title: '실버리드', text: shareText }); } catch {}
  } else {
    await copyToClipboard(shareText);
    alert('클립보드에 복사되었습니다.');
  }
});

btnCopy.addEventListener('click', async () => {
  await copyToClipboard(buildShareText());
  alert('클립보드에 복사되었습니다.');
});

function buildShareText() {
  const acc = Math.round((appState.readingAccuracy || 0) * 100);
  return `실버리드 1분 읽기 완료! 카테고리: ${appState.selectedCategory || ''} / 시간: ${elapsedEl.textContent} / 정독률: ${acc}%`;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); } catch {}
}

// 다시 시작
restartBtn.addEventListener('click', () => {
  stopTTS();
  stopMicReading();
  appState.selectedCategory = null;
  goStep2Btn.disabled = true;
  document.querySelectorAll('.btn.category').forEach((b) => b.classList.remove('primary'));
  readingTextEl.innerHTML = '';
  quizArea.innerHTML = '';
  resultEl.innerHTML = '';
  elapsedEl.textContent = '00:00';
  clearInterval(timerHandle);
  goToStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


