// Netlify Function (Node CJS): generate-quiz
// - POST with JSON { text }
// - If GEMINI_API_KEY set, try Gemini API; else return naive quiz

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method Not Allowed' });
    }
    const { text } = JSON.parse(event.body || '{}');
    const key = process.env.GEMINI_API_KEY;

    if (key) {
      try {
        const prompt = [
          {
            role: 'user',
            parts: [
              {
                text: `다음 한국어 짧은 글의 핵심을 평가하는 3문항(객관식 2, OX 1)을 JSON으로 만들어 주세요.
형식: {"questions":[{"id":"q1","type":"mc","question":"...","options":["...","...","...","..."],"answer":0}, {"id":"q3","type":"ox","question":"...","answer":true}]} 
응답에는 JSON만 포함해 주세요.\n\n글:\n${text}`,
              },
            ],
          },
        ];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: prompt }),
        });
        if (res.ok) {
          const data = await res.json();
          const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          const jsonText = textOut.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
          try {
            const parsed = JSON.parse(jsonText);
            if (Array.isArray(parsed?.questions)) {
              return json(200, { questions: parsed.questions });
            }
          } catch {}
        }
      } catch (e) {
        // fallthrough to naive
      }
    }

    const qs = naiveFromText(text);
    return json(200, { questions: qs });
  } catch (e) {
    return json(500, { error: 'Server Error' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function naiveFromText(text = '') {
  const sentences = (text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?\u3002\uFF01\uFF1F])\s+/)
    .filter(Boolean);
  const first = sentences[0] || '짧은 글';
  const theme = first.slice(0, 20);
  return [
    { id: 'q1', type: 'mc', question: '글의 주제를 가장 잘 나타내는 것은?', options: [`${theme} 소개`, '여행 계획', '역사 인물전', '기술 매뉴얼'], answer: 0 },
    { id: 'q2', type: 'mc', question: '글에서 제안하는 태도에 가까운 것은?', options: ['꾸준한 실천', '즉각 중단', '고가 장비 구매', '무리한 훈련'], answer: 0 },
    { id: 'q3', type: 'ox', question: '이 글은 일상에서 적용 가능한 방법을 다룬다.', answer: true },
  ];
}


