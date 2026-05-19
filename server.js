const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Prompt data
const PROMPTS = {
  1: {
    title: 'Pressure Test Your Idea',
    desc: 'Find every fatal flaw before you waste a month building',
    role: 'Act as a Paul Graham-style startup evaluator who has reviewed thousands of ideas and knows exactly which ones die in week one and which ones become billion dollar companies.',
    task: 'Pressure test my startup idea the way Paul Graham evaluates YC applications, finding every fatal flaw before I waste a single month building the wrong thing.',
    steps: [
      'Ask for my startup idea description before starting (skip if already provided)',
      'Identify the core assumption that must be true for the business to work',
      'Find the most likely reasons this idea fails, specific and ranked by severity',
      'Test the problem — is this a real pain people pay to solve or a nice-to-have',
      'Assess the founder-market fit — why am I the right person to build this',
      'Deliver a brutally honest verdict — strong, weak, or pivot required'
    ],
    rules: [
      'Every flaw must be specific to this idea, no generic startup advice',
      'Core assumption must be testable before building anything',
      'Verdict must be direct, never "it has potential but"',
      'Fatal flaws ranked by severity, most dangerous first',
      'Include only real flaws, do not pad to hit a number'
    ],
    output: 'Core Assumption &rarr; Fatal Flaws &rarr; Problem Validation &rarr; Founder-Market Fit &rarr; Brutal Verdict'
  },
  2: {
    title: 'Validate the Real Problem',
    desc: 'Know if people actually pay for this or if it is in your head',
    role: 'Act as a customer discovery specialist applying Paul Graham\'s "talk to users" framework — the only way to know if a problem is real is to find people actively suffering from it and willing to pay for a solution.',
    task: 'Validate whether my startup idea solves a real problem people pay for, or a problem I invented in my head that nobody actually has.',
    steps: [
      'Ask for my startup idea and target customer before starting (skip if already provided)',
      'Define the specific pain — exactly what frustration my customer experiences and when',
      'Identify who has this problem most acutely — the early adopter profile',
      'Design 5 customer discovery questions that reveal truth without leading the witness',
      'Define validation criteria — what specific signals prove the problem is real and urgent',
      'Flag if the problem is a vitamin or a painkiller, and what that means for the business'
    ],
    rules: [
      'Problem must be felt with enough frequency and intensity that customers actively seek a fix',
      'Early adopter must be a specific person, not a demographic',
      'Discovery questions must be open-ended and ask about past behavior, never hypothetical intent',
      'Vitamin vs painkiller verdict must be explicit, never implied',
      'Test — are people currently cobbling together a solution because nothing exists'
    ],
    output: 'Specific Pain &rarr; Early Adopter Profile &rarr; 5 Discovery Questions &rarr; Validation Criteria &rarr; Vitamin or Painkiller Verdict'
  },
  3: {
    title: 'Map Your Real Competition',
    desc: 'Find the invisible competitors before it is too late',
    role: 'Act as a competitive intelligence analyst applying Paul Graham\'s "what are people doing now" framework — the most dangerous competitor is never the obvious one, it is the current behavior your product has to replace.',
    task: 'Map every real competitor my startup faces, including the invisible ones most founders never see until it is too late.',
    steps: [
      'Ask for my startup idea and target customer before starting (skip if already provided)',
      'Identify what customers currently do instead of using my product',
      'Map direct competitors — companies solving the exact same problem',
      'Map indirect competitors — alternatives customers use that solve the same pain differently',
      'Identify the real enemy — the behavior or habit my product must replace',
      'Assess my genuine differentiation — why would someone switch from what they do now'
    ],
    rules: [
      '"We have no competition" is always wrong — flag it immediately',
      'Current behavior is always a competitor — never ignore it',
      'Differentiation must be specific, not "we\'re better" or "we\'re cheaper"',
      'Every competitor assessed on awareness, switching cost, and satisfaction level',
      'Test — why would my target customer switch from what they do today'
    ],
    output: 'Current Behavior &rarr; Direct Competitors &rarr; Indirect Competitors &rarr; Real Enemy &rarr; Genuine Differentiation'
  },
  4: {
    title: 'Find Your First 10 Customers',
    desc: 'Build a manual outreach plan before you automate anything',
    role: 'Act as an early traction specialist applying Paul Graham\'s "do things that don\'t scale" framework — the fastest path to product-market fit is finding 10 people who use and pay for your product before building anything automated.',
    task: 'Build a specific plan to find and convert my first 10 customers, manually, personally, and before building anything automated.',
    steps: [
      'Ask for my startup idea and target customer before starting (skip if already provided)',
      'Identify exactly where my first 10 customers are right now — specific communities, forums, or networks',
      'Design the manual outreach approach — how to reach them personally without automation',
      'Write the first message — specific, personal, and asking for nothing except a conversation',
      'Define what success looks like with the first 10 — what they must do to prove real demand',
      'Create a feedback loop — how to use their input to make the product worth paying for'
    ],
    rules: [
      'First 10 must be found manually — no automation, no cold mass emails',
      'Specific communities or people — not "people on LinkedIn"',
      'First message must be one-on-one — written for one person, not a template',
      'Success means paying customers, not just interested leads',
      'Feedback must change the product — document what you learn and what you build'
    ],
    output: 'Customer Habitat &rarr; Manual Outreach Plan &rarr; First Message Template &rarr; Success Definition &rarr; Feedback Loop'
  },
  5: {
    title: 'Sharpen Your One-Line Pitch',
    desc: 'If it takes more than one sentence, you do not understand it',
    role: 'Act as a positioning expert applying Paul Graham\'s "make something people want" clarity principle — your pitch is the first test of whether you understand your market, and if it takes more than one sentence, you do not.',
    task: 'Refine my startup pitch until it can be delivered in a single compelling line that makes someone ask for more.',
    steps: [
      'Ask for my current startup pitch or description before starting (skip if already provided)',
      'Identify what is actually unique about what I am building',
      'Strip anything that could apply to a hundred other startups',
      'Replace vague language with specific, concrete terms',
      'Test whether someone hearing this for the first time knows exactly what I do and for whom',
      'Deliver the refined one-liner with a brief explanation of why each word stays'
    ],
    rules: [
      'One line only — no subheadline, no "basically," no "it\'s like X but for Y"',
      'Specific audience — "for" must appear and be a real person type',
      'Specific outcome — what changes for the customer, not what the product does',
      'Unique in the room — if a competitor could say the same thing, change it',
      'Testable in conversation — if they ask "how?" you are already winning'
    ],
    output: 'Current Pitch &rarr; What\'s Unique &rarr; What Gets Cut &rarr; Refined One-Liner &rarr; Why Each Word Stays'
  },
  6: {
    title: 'Write a YC-Style Application',
    desc: 'Every answer must prove you understand your market',
    role: 'Act as a YC application coach applying Paul Graham\'s application evaluation criteria — the best applications show, do not tell, and every word proves the founder understands their market.',
    task: 'Evaluate and improve my YC application, making every answer concrete, specific, and impossible to misinterpret.',
    steps: [
      'Ask for my current application answers or describe my startup',
      'Flag any answer that uses startup jargon, vague promises, or passive voice',
      'Identify the strongest answer — where does the founder\'s expertise show',
      'Find the weakest answer — where does the application dodge a hard question',
      'Rewrite each answer with concrete specifics — numbers, stories, evidence',
      'Deliver the improved version with notes on what changed and why'
    ],
    rules: [
      'No startup cliches — "disrupt," "revolutionary," "game-changer," "AI-powered"',
      'Every claim backed by a specific example or number',
      'Founders must show, not claim — "I built X for Y people" beats "I have deep expertise"',
      'Difficult questions answered directly — never deflect or say "not applicable"',
      'The application should read like someone with skin in the game wrote it'
    ],
    output: 'Current Answer &rarr; Jargon Flagged &rarr; Strength/Weakness &rarr; Improved Answer &rarr; Why It Works'
  },
  7: {
    title: 'Design Your First Experiment',
    desc: 'Learn the truth at the lowest possible cost before building',
    role: 'Act as a lean startup coach applying Paul Graham\'s "keep the feature inventory small" principle — every week you spend building without data is a week you might be building the wrong thing.',
    task: 'Design the single most important experiment to run before I build anything else, so I learn the truth about my idea at the lowest possible cost.',
    steps: [
      'Ask for my startup idea and what I am currently building (skip if already provided)',
      'Identify the biggest assumption — the thing that if false, the whole business fails',
      'Design one experiment that directly tests that assumption',
      'Specify exactly what success looks like — the specific outcome that proves the assumption',
      'Define the minimum viable version of the experiment — no more work than needed to learn',
      'Set a deadline — when will I know if this assumption is validated or busted'
    ],
    rules: [
      'Experiment must test the biggest assumption, not a minor detail',
      'Success criteria must be binary — either the assumption holds or it does not',
      'Minimum viable — no full product, no perfect landing page, no full feature set',
      'Deadline forces action — "when I have time" never comes',
      'If the experiment fails, the response must include an honest pivot or kill decision'
    ],
    output: 'Biggest Assumption &rarr; Experiment Design &rarr; Success Criteria &rarr; Minimum Build &rarr; Deadline + Kill/Continue Decision'
  }
};

// Build prompt text
function buildPromptText(promptId, startupIdea) {
  const p = PROMPTS[promptId];
  const steps = p.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const rules = p.rules.map(r => `★ ${r}`).join('\n');
  return `<role>
${p.role}
</role>

<task>
${p.task}
</task>

<steps>
${steps}
</steps>

<rules>
${rules}
</rules>

<output>
${p.output}
</output>

---
MY STARTUP IDEA:
${startupIdea}`;
}

// Escape HTML helper
function e(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Build card HTML
function buildCard(promptId, p) {
  const n = String(promptId).padStart(2, '0');
  const stepsHtml = p.steps.map((s, i) => `<div class="si"><span class="sn">${i + 1}.</span>${e(s)}</div>`).join('');
  const rulesHtml = p.rules.map(s => `<div class="ri"><span class="st">&#9733;</span>${e(s)}</div>`).join('');

  return `<div class="pc" id="card${promptId}">
  <div class="ch" onclick="tc(${promptId})">
    <div class="n">${n}</div>
    <div class="ci">
      <div class="ct">${e(p.title)}</div>
      <div class="cd">${e(p.desc)}</div>
    </div>
    <div class="actions" onclick="event.stopPropagation()">
      <button class="run-btn" id="runbtn${promptId}" onclick="runPrompt(${promptId})">Run Prompt</button>
      <button class="copy-btn" id="cpybtn${promptId}" onclick="copyPrompt(${promptId},event)">Copy</button>
    </div>
    <div class="ch-toggle" id="toggle${promptId}">+</div>
  </div>
  <div class="cb">
    <div class="ps">
      <div class="section-label">&lt;role&gt;</div>
      <div class="content-block">${e(p.role)}</div>
    </div>
    <div class="ps">
      <div class="section-label">&lt;task&gt;</div>
      <div class="content-block">${e(p.task)}</div>
    </div>
    <div class="ps">
      <div class="section-label">&lt;steps&gt;</div>
      <div class="content-block">${stepsHtml}</div>
    </div>
    <div class="ps">
      <div class="section-label">&lt;rules&gt;</div>
      <div class="content-block">${rulesHtml}</div>
    </div>
    <div class="ps">
      <div class="section-label">&lt;output&gt;</div>
      <div class="content-block output-flow">${p.output}</div>
    </div>
    <div class="output-section" id="output${promptId}">
      <div class="output-label"><span class="dot"></span>AI Response</div>
      <div class="output-content" id="outcontent${promptId}"></div>
      <div class="output-meta" id="outmeta${promptId}"></div>
    </div>
  </div>
</div>`;
}

// Serve main page
app.get('/', (req, res) => {
  const cardsHtml = Object.entries(PROMPTS).map(([id, p]) => buildCard(id, p)).join('\n');
  const promptsJson = JSON.stringify(PROMPTS);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Startup Refinement Playbook</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--bg:#080810;--card:#111120;--cb:#0e0e1a;--bd:rgba(255,255,255,.07);--g:#c9a84c;--gl:#e8c96a;--t:#f0ede6;--td:#8a8a9a;--s:#22c55e;--r:#ef4444}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--t);min-height:100vh;line-height:1.6}
.cn{max-width:820px;margin:0 auto;padding:0 24px}
header{text-align:center;padding:56px 0 48px;border-bottom:1px solid var(--bd);margin-bottom:40px}
.bdg{display:inline-block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--g);border:1px solid rgba(201,168,76,.3);padding:6px 16px;border-radius:50px;margin-bottom:20px}
h1{font-size:clamp(26px,5vw,44px);font-weight:900;color:#fff;line-height:1.1;margin-bottom:14px}
h1 span{color:var(--g)}
header p{font-size:15px;color:var(--td);max-width:520px;margin:0 auto;line-height:1.7}

/* Idea input */
.idea-section{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:28px;margin-bottom:28px}
.idea-section h2{font-size:16px;font-weight:700;color:#fff;margin-bottom:4px}
.idea-section p{font-size:13px;color:var(--td);margin-bottom:14px}
textarea{width:100%;background:var(--cb);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;font-size:14px;color:var(--t);font-family:'Inter',sans-serif;line-height:1.7;resize:vertical;min-height:110px;outline:none;transition:border-color .2s}
textarea:focus{border-color:rgba(201,168,76,.4)}
textarea::placeholder{color:var(--td)}
.controls{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;align-items:center}
select{background:var(--cb);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--t);font-family:'Inter',sans-serif;cursor:pointer;outline:none}
select:focus{border-color:rgba(201,168,76,.4)}
.run-all-btn{flex:1;background:linear-gradient(135deg,var(--g),#a8852f);border:none;border-radius:10px;padding:12px 20px;font-size:14px;font-weight:700;color:#080810;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;min-width:160px}
.run-all-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(201,168,76,.3)}
.run-all-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* Cards */
.pc{background:var(--card);border:1px solid var(--bd);border-radius:20px;margin-bottom:14px;overflow:hidden;transition:border-color .25s}
.pc:hover{border-color:rgba(201,168,76,.12)}
.pc.running{border-color:rgba(201,168,76,.5)}
.pc.done{border-color:rgba(34,197,94,.25)}
.ch{padding:18px 22px;display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
.n{width:38px;height:38px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--g);flex-shrink:0}
.ci{flex:1}
.ct{font-size:15px;font-weight:700;color:#fff}
.cd{font-size:12px;color:var(--td);margin-top:2px}
.actions{display:flex;gap:8px;flex-shrink:0}
.run-btn{padding:7px 14px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);border-radius:8px;font-size:12px;font-weight:600;color:var(--gl);cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.run-btn:hover{background:rgba(201,168,76,.2)}
.run-btn.running{background:rgba(201,168,76,.2);border-color:var(--g)}
.run-btn:disabled{opacity:.4;cursor:not-allowed}
.copy-btn{padding:7px 14px;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;font-size:12px;font-weight:600;color:var(--td);cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.copy-btn:hover{background:rgba(255,255,255,.05);color:var(--t)}
.copy-btn.copied{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:var(--s)}
.ch-toggle{font-size:20px;color:var(--td);transition:transform .3s;flex-shrink:0;padding:6px}
.pc.o .ch-toggle{transform:rotate(45deg)}
.cb{display:none;padding:0 22px 20px;border-top:1px solid var(--bd);background:rgba(0,0,0,.1)}
.pc.o .cb{display:block}
.ps{margin-bottom:18px}
.ps:last-child{margin-bottom:0}
.section-label{display:inline-block;font-family:Courier New,monospace;font-size:10px;font-weight:600;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.18);color:var(--gl);padding:2px 8px;border-radius:4px;margin-bottom:8px;margin-top:16px}
.content-block{background:var(--cb);border:1px solid rgba(255,255,255,.04);border-radius:10px;padding:14px;font-size:13px;line-height:1.75;color:var(--t);white-space:pre-wrap}
.ri,.si{display:flex;gap:8px;margin-bottom:5px}
.ri:last-child,.si:last-child{margin-bottom:0}
.st,.sn{color:var(--g);font-weight:700;flex-shrink:0;margin-top:1px;font-size:12px}
.output-flow{font-weight:600}
.output-section{display:none;padding:16px 0 0;border-top:1px solid rgba(201,168,76,.08);margin-top:4px}
.output-section.visible{display:block}
.output-label{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--s);margin-bottom:10px}
.dot{width:6px;height:6px;background:var(--s);border-radius:50%;animation:pd 1.5s infinite}
@keyframes pd{0%,100%{opacity:1}50%{opacity:.4}}
.output-content{background:var(--cb);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:18px;font-size:13px;line-height:1.8;color:var(--t);white-space:pre-wrap;max-height:500px;overflow-y:auto}
.output-content::-webkit-scrollbar{width:5px}
.output-content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}
.output-meta{font-size:11px;color:var(--td);margin-top:8px}
.output-meta span{color:var(--g)}
.spinner{display:inline-block;width:11px;height:11px;border:2px solid rgba(201,168,76,.25);border-top-color:var(--g);border-radius:50%;animation:sp .7s linear infinite;vertical-align:middle;margin-right:3px}
@keyframes sp{to{transform:rotate(360deg)}}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--card);border:1px solid var(--s);color:var(--s);padding:12px 22px;border-radius:12px;font-size:13px;font-weight:600;opacity:0;transition:all .3s;z-index:1000;pointer-events:none}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.toast.err{border-color:var(--r);color:var(--r)}
.cta{text-align:center;padding:48px 0;border-top:1px solid var(--bd);margin-top:8px}
.cta h2{font-size:22px;font-weight:800;color:#fff;margin-bottom:8px}
.cta p{font-size:14px;color:var(--td)}
footer{text-align:center;padding:24px 0;font-size:11px;color:var(--td);border-top:1px solid var(--bd)}
footer a{color:var(--g);text-decoration:none}
@media(max-width:600px){.ch{padding:14px 16px}.cb{padding:0 16px 16px}textarea{min-height:88px}.controls{flex-direction:column}.run-all-btn{width:100%}.actions{flex-direction:column}.run-btn,.copy-btn{width:100%;text-align:center}}
</style>
</head>
<body>
<div class="cn">
<header>
  <div class="bdg">Paul Graham x Claude</div>
  <h1>Startup Refinement<br><span>Prompt Playbook</span></h1>
  <p>7 battle-tested prompts. Enter your idea, run any prompt, get a structured AI response.</p>
</header>

<div class="idea-section">
  <h2>Your Startup Idea</h2>
  <p>Paste or describe your startup idea below. This will be automatically injected into every prompt you run.</p>
  <textarea id="startupIdea" placeholder="e.g. A lending app for small businesses in India that uses alternative data for credit scoring..."></textarea>
  <div class="controls">
    <select id="modelSelect">
      <option value="anthropic/claude-opus-4-7">Claude Opus 4.7 (Recommended)</option>
      <option value="anthropic/claude-sonnet-4-6">Claude Sonnet 4.6</option>
      <option value="openai/gpt-4o">GPT-4o</option>
      <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
      <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B (Free)</option>
      <option value="deepseek/deepseek-chat-v3-0324">DeepSeek V3 (Free)</option>
    </select>
    <button class="run-all-btn" id="runAllBtn" onclick="runAllPrompts()">Run All 7 Prompts</button>
  </div>
</div>

${cardsHtml}

<div class="cta">
  <h2>Like this tool?</h2>
  <p>Open the prompt in Claude directly and add your startup idea. Or build your own with this framework.</p>
</div>
</div>

<footer>Built by <a href="https://divinesuccessflow.com" target="_blank">Divine Success Flow</a> &mdash; Source: @codingknowledge</footer>
<div class="toast" id="toast"></div>

<script>
const P=${promptsJson};

function tc(n){
  var c=document.getElementById('card'+n);
  var isOpen=c.classList.contains('o');
  document.querySelectorAll('.pc').forEach(function(pc){pc.classList.remove('o')});
  if(!isOpen)c.classList.add('o');
}

function getIdea(){
  return document.getElementById('startupIdea').value.trim();
}

function getModel(){
  return document.getElementById('modelSelect').value;
}

function showToast(msg,isError){
  var t=document.getElementById('toast');
  t.textContent=msg;
  t.className='toast'+(isError?' err':'');
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},3000);
}

function copyPrompt(n,e){
  e.stopPropagation();
  var p=P[n];
  var idea=getIdea();
  var prompt=\`<role>\${p.role}</role>

<task>\${p.task}</task>

<steps>\${p.steps.map(function(s,i){return(i+1)+'. '+s}).join('\\n')}</steps>

<rules>\${p.rules.map(function(r){return'★ '+r}).join('\\n')}</rules>

<output>\${p.output}</output>

---
MY STARTUP IDEA:
\${idea}\`;

  navigator.clipboard.writeText(prompt).then(function(){
    var btn=document.getElementById('cpybtn'+n);
    btn.textContent='Copied!';
    btn.classList.add('copied');
    showToast('Prompt copied to clipboard!');
    setTimeout(function(){
      btn.textContent='Copy';
      btn.classList.remove('copied');
    },2000);
  });
}

function setRunning(n,state){
  var card=document.getElementById('card'+n);
  var btn=document.getElementById('runbtn'+n);
  var outSec=document.getElementById('output'+n);
  if(state==='loading'){
    card.classList.add('running');
    card.classList.remove('done');
    btn.disabled=true;
    btn.innerHTML='<span class="spinner"></span>Running...';
    outSec.classList.remove('visible');
    outSec.classList.add('visible');
    document.getElementById('outcontent'+n).textContent='Analyzing your startup idea...';
    document.getElementById('outmeta'+n).textContent='';
  } else if(state==='done'){
    card.classList.remove('running');
    card.classList.add('done');
    btn.disabled=false;
    btn.innerHTML='Run Again';
  } else if(state==='error'){
    card.classList.remove('running');
    btn.disabled=false;
    btn.innerHTML='Retry';
  }
}

async function runPrompt(n){
  var idea=getIdea();
  if(!idea){showToast('Please enter your startup idea first',true);return;}

  setRunning(n,'loading');

  try {
    var model=getModel();
    var resp=await fetch('/api/run',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({promptId:n,startupIdea:idea,model:model})
    });
    var data=await resp.json();

    if(data.success){
      document.getElementById('outcontent'+n).textContent=data.output;
      document.getElementById('outmeta'+n).innerHTML='Model: <span>'+data.model+'</span>';
      setRunning(n,'done');
      // auto-open output
      var card=document.getElementById('card'+n);
      card.classList.add('o');
    } else {
      document.getElementById('outcontent'+n).textContent='Error: '+(data.error||'Something went wrong');
      if(data.hint) document.getElementById('outcontent'+n).textContent+='\\n\\nHint: '+data.hint;
      setRunning(n,'error');
    }
  } catch(err){
    document.getElementById('outcontent'+n).textContent='Network error. Make sure the server is running.';
    setRunning(n,'error');
  }
}

async function runAllPrompts(){
  var idea=getIdea();
  if(!idea){showToast('Please enter your startup idea first',true);return;}

  for(var i=1;i<=7;i++){
    await runPrompt(i);
    await new Promise(function(r){setTimeout(r,1500)});
  }
  showToast('All 7 prompts complete!');
}
</script>
</body>
</html>`;

  res.send(html);
});

// API endpoint to run prompts
app.post('/api/run', async (req, res) => {
  const { promptId, startupIdea, model } = req.body;

  if (!promptId || !startupIdea) {
    return res.status(400).json({ error: 'promptId and startupIdea are required' });
  }

  const promptData = PROMPTS[parseInt(promptId)];
  if (!promptData) {
    return res.status(400).json({ error: 'Invalid promptId. Choose 1-7.' });
  }

  const promptText = buildPromptText(promptId, startupIdea);
  const selectedModel = model || 'anthropic/claude-opus-4-7';

  // Try OpenRouter
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey && openrouterKey.length > 10) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
          'HTTP-Referer': 'https://divinesuccessflow.com',
          'X-Title': 'Startup Refinement Playbook'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: promptText }],
          max_tokens: 4096,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const output = data.choices?.[0]?.message?.content;
        if (output) {
          return res.json({
            success: true,
            output,
            model: selectedModel,
            promptId: parseInt(promptId),
            promptTitle: promptData.title
          });
        }
      }
    }
  } catch (e) {
    console.log('OpenRouter error:', e.message);
  }

  // Try Groq
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey.length > 10) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: promptText }],
          max_tokens: 4096,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const output = data.choices?.[0]?.message?.content;
        if (output) {
          return res.json({
            success: true,
            output,
            model: 'groq/llama-3.3-70b-versatile',
            promptId: parseInt(promptId),
            promptTitle: promptData.title
          });
        }
      }
    }
  } catch (e) {
    console.log('Groq error:', e.message);
  }

  res.status(503).json({
    error: 'No AI provider configured. Set OPENROUTER_API_KEY or GROQ_API_KEY as environment variables.',
    hint: 'Get a free OpenRouter key at openrouter.ai — $1 credit is enough for 500+ prompts.'
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', prompts: Object.keys(PROMPTS).length }));

app.listen(PORT, () => {
  console.log(`Startup Playbook running on port ${PORT}`);
});