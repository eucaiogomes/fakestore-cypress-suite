// ============================================================
// GERADOR DE RELATÓRIO HTML + ANÁLISE GROQ AI
// ============================================================
const fs = require('fs')
const path = require('path')
const https = require('https')

const REPORT_DIR = path.join(__dirname, '..', 'report')
const FAILED_FILE = path.join(REPORT_DIR, 'failed-tests.json')
const RESULTS_FILE = path.join(REPORT_DIR, 'raw-results.json')

// ──────────────────────────────────────────
// Lê arquivos de resultado
// ──────────────────────────────────────────
function readJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (e) { }
  return fallback
}

// ──────────────────────────────────────────
// Chamada Groq AI
// ──────────────────────────────────────────
async function analyzeWithGroq(failedTests) {
  const apiKey = process.env.GROQ_API_KEY || ''

  if (!apiKey) {
    return '⚠️ **Análise Groq AI não disponível**: Configure a variável de ambiente `GROQ_API_KEY` com sua chave da Groq para ativar a análise inteligente de falhas.'
  }

  if (!failedTests || failedTests.length === 0) {
    return '✅ **Nenhuma falha detectada!** Todos os testes passaram com sucesso. A suite está completamente verde — ótimo trabalho!'
  }

  const failSummary = failedTests
    .map((t, i) => `${i + 1}. **${t.fullTitle}**\n   Erro: ${t.error}`)
    .join('\n')

  const prompt = `Você é um especialista em QA e testes de API REST. Analise as seguintes falhas de testes automatizados no Cypress e forneça:

1. Um diagnóstico claro de cada falha
2. Possíveis causas raiz
3. Sugestões de correção

Testes que falharam:
${failSummary}

API testada: FakeStore API (https://fakestoreapi.com)

Seja direto, técnico e objetivo. Responda em português.`

  return new Promise((resolve) => {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    })

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed.choices?.[0]?.message?.content || 'Resposta inválida da API Groq.')
        } catch {
          resolve('Erro ao processar resposta do Groq AI.')
        }
      })
    })

    req.on('error', () => resolve('Erro de conexão com a API Groq AI.'))
    req.write(body)
    req.end()
  })
}

// ──────────────────────────────────────────
// Gerador de HTML
// ──────────────────────────────────────────
function buildHTML(results, failedTests, grokAnalysis) {
  const total = results.length
  const passed = results.filter((r) => r.status === 'passed').length
  const failed = results.filter((r) => r.status === 'failed').length
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  const suites = {}
  results.forEach((r) => {
    if (!suites[r.suite]) suites[r.suite] = { passed: 0, failed: 0, tests: [] }
    suites[r.suite][r.status === 'passed' ? 'passed' : 'failed']++
    suites[r.suite].tests.push(r)
  })

  const suiteIcons = {
    Autenticação: '🔐',
    Produtos: '🛍️',
    Carrinho: '🛒',
    Usuários: '👤',
  }

  const suiteCards = Object.entries(suites)
    .map(([name, data]) => {
      const rate = Math.round((data.passed / (data.passed + data.failed)) * 100)
      const icon = suiteIcons[name] || '🧪'
      const testRows = data.tests
        .map(
          (t) => `
        <div class="test-row ${t.status}">
          <span class="test-status-dot ${t.status}"></span>
          <span class="test-name">${t.test}</span>
          <span class="test-badge ${t.status}">${t.status === 'passed' ? 'PASSOU' : 'FALHOU'}</span>
        </div>`
        )
        .join('')

      return `
      <div class="suite-card">
        <div class="suite-header" onclick="toggleSuite('${name.replace(/\s/g, '_')}')">
          <div class="suite-title">
            <span class="suite-icon">${icon}</span>
            <span>${name}</span>
          </div>
          <div class="suite-meta">
            <span class="suite-rate" style="color:${rate >= 80 ? '#4ade80' : rate >= 50 ? '#fbbf24' : '#f87171'}">${rate}%</span>
            <span class="passed-count">✓ ${data.passed}</span>
            <span class="failed-count">✗ ${data.failed}</span>
            <span class="chevron">▼</span>
          </div>
        </div>
        <div class="suite-tests" id="${name.replace(/\s/g, '_')}">
          ${testRows}
        </div>
      </div>`
    })
    .join('')

  const grokFormatted = grokAnalysis
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')

  const timestamp = new Date().toLocaleString('pt-BR')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FakeStore API — Test Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #111118;
      --surface2: #1a1a24;
      --border: #2a2a38;
      --accent: #7c3aed;
      --accent2: #06b6d4;
      --green: #4ade80;
      --red: #f87171;
      --yellow: #fbbf24;
      --text: #e2e8f0;
      --muted: #64748b;
      --font-mono: 'Space Mono', monospace;
      --font-sans: 'Inter', sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Grid background */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.3;
      pointer-events: none;
      z-index: 0;
    }

    .container { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 40px 24px; }

    /* Header */
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 48px;
    }

    .logo {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--accent2);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    h1 {
      font-size: 36px;
      font-weight: 600;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #fff 30%, var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .timestamp {
      font-size: 12px;
      color: var(--muted);
      font-family: var(--font-mono);
      margin-top: 4px;
    }

    .badge-suite {
      background: var(--surface2);
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--accent2);
      letter-spacing: 1px;
    }

    /* Stats bar */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }

    @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .stat-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
    }
    .stat-card.total::after { background: var(--accent); }
    .stat-card.pass::after  { background: var(--green); }
    .stat-card.fail::after  { background: var(--red); }
    .stat-card.rate::after  { background: var(--accent2); }

    .stat-label {
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 2px;
      font-family: var(--font-mono);
      margin-bottom: 12px;
    }

    .stat-value {
      font-size: 42px;
      font-weight: 700;
      font-family: var(--font-mono);
      line-height: 1;
    }

    .stat-card.total .stat-value { color: var(--accent); }
    .stat-card.pass  .stat-value { color: var(--green); }
    .stat-card.fail  .stat-value { color: var(--red); }
    .stat-card.rate  .stat-value { color: var(--accent2); }

    /* Progress */
    .progress-wrap {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
      font-size: 13px;
      color: var(--muted);
      font-family: var(--font-mono);
    }

    .progress-bar {
      height: 10px;
      background: var(--surface2);
      border-radius: 100px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 100px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
    }

    /* Section Title */
    .section-title {
      font-size: 12px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 3px;
      font-family: var(--font-mono);
      margin-bottom: 16px;
    }

    /* Suite Cards */
    .suites { margin-bottom: 40px; display: flex; flex-direction: column; gap: 12px; }

    .suite-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .suite-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .suite-header:hover { background: var(--surface2); }

    .suite-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      font-size: 15px;
    }

    .suite-icon { font-size: 20px; }

    .suite-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-family: var(--font-mono);
      font-size: 12px;
    }

    .suite-rate { font-size: 18px; font-weight: 700; font-family: var(--font-mono); }
    .passed-count { color: var(--green); }
    .failed-count { color: var(--red); }
    .chevron { color: var(--muted); transition: transform 0.3s; }
    .suite-card.open .chevron { transform: rotate(180deg); }

    .suite-tests {
      border-top: 1px solid var(--border);
      padding: 8px 0;
      display: none;
    }

    .suite-card.open .suite-tests { display: block; }

    .test-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px;
      font-size: 13px;
      transition: background 0.15s;
    }

    .test-row:hover { background: var(--surface2); }

    .test-status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .test-status-dot.passed { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .test-status-dot.failed { background: var(--red); box-shadow: 0 0 6px var(--red); }

    .test-name { flex: 1; color: #cbd5e1; }

    .test-badge {
      font-size: 10px;
      font-family: var(--font-mono);
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .test-badge.passed { background: rgba(74,222,128,0.1); color: var(--green); border: 1px solid rgba(74,222,128,0.2); }
    .test-badge.failed { background: rgba(248,113,113,0.1); color: var(--red); border: 1px solid rgba(248,113,113,0.2); }

    /* Grok AI section */
    .grok-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px;
      position: relative;
      overflow: hidden;
    }

    .grok-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #7c3aed, #06b6d4, #4ade80);
    }

    .grok-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .grok-badge {
      background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2));
      border: 1px solid rgba(124,58,237,0.4);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11px;
      font-family: var(--font-mono);
      color: #a78bfa;
    }

    .grok-title {
      font-size: 18px;
      font-weight: 600;
    }

    .grok-content {
      font-size: 14px;
      line-height: 1.8;
      color: #cbd5e1;
      border-left: 3px solid var(--accent);
      padding-left: 16px;
    }

    /* Footer */
    footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--muted);
      font-family: var(--font-mono);
    }
  </style>
</head>
<body>
<div class="container">
  <header>
    <div>
      <div class="logo">▸ Test Report</div>
      <h1>FakeStore API Suite</h1>
      <div class="timestamp">Gerado em \${timestamp}</div>
    </div>
    <div class="badge-suite">CYPRESS + GROQ AI</div>
  </header>

  <div class="stats-grid">
    <div class="stat-card total">
      <div class="stat-label">Total</div>
      <div class="stat-value">\${total}</div>
    </div>
    <div class="stat-card pass">
      <div class="stat-label">Passaram</div>
      <div class="stat-value">\${passed}</div>
    </div>
    <div class="stat-card fail">
      <div class="stat-label">Falharam</div>
      <div class="stat-value">\${failed}</div>
    </div>
    <div class="stat-card rate">
      <div class="stat-label">Taxa</div>
      <div class="stat-value">\${passRate}%</div>
    </div>
  </div>

  <div class="progress-wrap">
    <div class="progress-header">
      <span>Taxa de aprovação</span>
      <span>\${passed} / \${total} testes</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: \${passRate}%"></div>
    </div>
  </div>

  <div class="section-title">▸ Resultados por Suite</div>
  <div class="suites">
    \${suiteCards}
  </div>

  <div class="section-title">▸ Análise Inteligente — Groq AI</div>
  <div class="grok-card">
    <div class="grok-header">
      <div class="grok-badge">GROQ AI</div>
      <div class="grok-title">Diagnóstico de Falhas</div>
    </div>
    <div class="grok-content">\${grokFormatted}</div>
  </div>

  <footer>
    FakeStore API Test Suite &nbsp;·&nbsp; Cypress &nbsp;·&nbsp; Groq AI &nbsp;·&nbsp; \${timestamp}
  </footer>
</div>

<script>
  function toggleSuite(id) {
    const card = document.getElementById(id).closest('.suite-card')
    card.classList.toggle('open')
  }
  // Abrir todas as suites por padrão
  document.querySelectorAll('.suite-card').forEach(c => c.classList.add('open'))
</script>
</body>
</html>`
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────
async function main() {
  console.log('\n🚀 Gerando relatório FakeStore API Test Suite...\n')

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })

  const results = readJSON(RESULTS_FILE, [])
  const failedTests = readJSON(FAILED_FILE, [])

  console.log(`📊 Testes coletados: ${results.length}`)
  console.log(`❌ Falhas encontradas: ${failedTests.length}`)

  console.log('🤖 Analisando falhas com Groq AI...')
  const groqAnalysis = await analyzeWithGroq(failedTests)

  const html = buildHTML(results, failedTests, groqAnalysis)
  const reportPath = path.join(REPORT_DIR, 'index.html')
  fs.writeFileSync(reportPath, html)

  console.log(`\n✅ Relatório gerado: ${reportPath}`)
  console.log('🌐 Abra report/index.html no navegador para visualizar\n')
}

main().catch(console.error)
