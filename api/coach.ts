import { generateText } from 'ai';

const SYSTEM = `Sen UniSum uygulamasının "AI Akademik Koç"usun. Üniversite öğrencilerine GPA (4.00 üzerinden), dersler ve notlar konusunda yardımcı olursun.
Kurallar:
- Türkçe, samimi ve MOTİVE EDİCİ konuş.
- Öğrencinin GERÇEK verisine dayan; somut, uygulanabilir öneriler ver.
- Riskleri (düşük ortalama, kalma/koşullu geçme riski) nazikçe ama net belirt.
- Kısa ve öz yaz; madde işaretleri (•) kullan. Uzun paragraflardan kaçın.
- Sayısal hedefleri net ver (ör. "final'de en az 78 almalısın").
- Asla veri uydurma; verilmeyen bilgiyi varsayma.`;

const MODEL = process.env.AI_MODEL || 'anthropic/claude-sonnet-5';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { summary, question, mode } = body;
    const prompt =
      mode === 'chat'
        ? `Öğrencinin akademik verisi:\n${summary}\n\nÖğrencinin sorusu: "${question}"\n\nBu veriye dayanarak yanıtla.`
        : `Aşağıdaki öğrencinin akademik durumunu analiz et: güçlü yönler, riskler ve bu dönem/gelecek için 3-5 somut öneri ver.\n\n${summary}`;

    const { text } = await generateText({ model: MODEL, system: SYSTEM, prompt });
    res.status(200).json({ answer: text });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'AI çağrısı başarısız' });
  }
}
