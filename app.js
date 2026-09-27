'use strict';
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stages=[
['Observe','Live network data','Telemetry ingestion','ingest','Collect timestamped telemetry, KPIs and alarms from a controlled network testbed. Normalize units and preserve the raw event for replay.','TelemetryEvent → ValidatedEvent','Validate schema, deduplicate event IDs, flag missing samples and handle late events.','An identical replay produces identical validated events.'],
['Synchronize','Digital twin sync','State & topology','twin','Maintain a versioned graph of devices, links, capacity and service dependencies. Update state using event time, with a bounded staleness budget.','ValidatedEvent → TwinSnapshot','Use JGraphT for topology, immutable Java records for snapshots, and PostgreSQL for durable versions.','Measure twin lag and KPI error against held-out testbed observations.'],
['Predict','Predict degradation','Risk forecasting','predict','Estimate the probability of a defined SLA breach within a fixed horizon. Begin with rolling thresholds and a supervised Java baseline before complex models.','FeatureWindow → RiskPrediction','Build time-window features; use Tribuo for Java training and inference. Store model version and calibration metadata.','Compare PR-AUC, false alarms per hour and useful warning time on a temporal holdout.'],
['Diagnose','Root-cause analysis','Fault localization','diagnose','Rank likely faulty links or devices using topology and temporal evidence. Treat correlation as diagnostic evidence, not proof of causation.','RiskPrediction + TwinSnapshot → RankedCauses','Combine dependency traversal with residual scores; retain contributing signals and uncertainty.','Report top-1 / top-3 accuracy on injected faults, including unseen fault combinations.'],
['Simulate','Simulate candidate fixes','Counterfactual trials','simulate','Evaluate a bounded action catalogue on a frozen twin snapshot. Run each candidate and a no-action baseline using the same workload and seed.','Snapshot + CandidateAction → SimulationResult','Implement a Java discrete-event simulator; compare reroute, rate-limit and no-op candidates.','Validate simulated latency, loss and recovery against controlled testbed interventions.'],
['Decide','Select safest action','Constrained policy','policy','Reject actions that violate capacity, confidence or safety constraints. Rank the feasible set by predicted SLA impact and cost; allow abstention.','SimulationResult[] → Decision','Separate hard policy gates from ranking. Save constraints, model versions and the complete decision trace.','Verify stale snapshots, uncertainty and empty candidate sets always lead to a no-op or review.'],
['Execute','Autonomous self-healing','Guarded actuation','actuate','Progress from replay to shadow recommendations, human-approved testbed actions, then bounded testbed autonomy. Every action must have a rollback.','ApprovedDecision → ActionReceipt','Use allowlisted targets, idempotency keys, expiring approval, a circuit breaker and a pre-action snapshot.','Test timeouts, duplicate requests, partial failures, kill switch and compensating rollback.'],
['Verify','Outcome verification','Feedback & evidence','verify','Measure the post-action SLA window, resynchronize the twin and record failures as well as successes. Recovery is observed; prevention needs a counterfactual.','ActionReceipt + PostWindow → Outcome','Compare with matched no-action runs under identical fault and workload schedules. Roll back if verification fails.','Report outage minutes, action harm and recovery time with uncertainty, not just successful examples.']
];
function heading(k,title,desc,badge='JAVA / RESEARCH PROTOTYPE'){return `<div class="heading"><div><p class="eyebrow">${k}</p><h1>${title}</h1><p class="lede">${desc}</p></div><span class="badge">${badge}</span></div>`}
function code(text){return `<div class="code-wrap"><button class="copy">Copy</button><pre><code>${escapeHTML(text)}</code></pre></div>`}
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3000)}
function overview(){return `${heading('01 / PROJECT OVERVIEW','Build the twin.<br>Prove the recovery.','A developer’s blueprint for a digital-twin-assisted, predictive network self-healing system — from the first telemetry event to a defensible PhD submission.','24-MONTH PLAN')}
<div class="stats"><div class="stat"><strong>24 <small style="font-size:14px">months</small></strong><span>Research → submission</span></div><div class="stat"><strong>08</strong><span>Application capabilities</span></div><div class="stat"><strong>Java 21</strong><span>Proposed application baseline</span></div><div class="stat"><strong>03</strong><span>Research questions</span></div></div>
<div class="grid"><section class="panel"><div class="panel-top"><div><h2>The closed-loop system</h2><div class="subtle">Select a stage to inspect its development contract.</div></div><span class="mono">01 → 08 ↺</span></div><div class="loop">${stages.map((s,i)=>`<button class="stage ${i===0?'selected':''}" data-stage="${i}" aria-pressed="${i===0}"><em>${String(i+1).padStart(2,'0')}</em><strong>${s[0]}</strong><small>${s[2]}</small></button>`).join('')}</div><p class="loop-note">↺ No degradation: continue observing. After an action: verify and synchronize again.</p></section><section class="panel detail" id="stage-detail" aria-live="polite"></section></div>
<div class="next-strip"><div><p class="eyebrow">YOUR FIRST DEVELOPMENT MILESTONE</p><h3>Replay one fault through one reproducible twin.</h3><p>Start with one topology, one SLA, three fault types and a no-action baseline.</p></div><a class="button lime" href="#roadmap">Explore the roadmap <span>↗</span></a></div>
<div class="section-title"><h2>What makes this a PhD?</h2><a href="#research" class="subtle">Evaluation design ↗</a></div><div class="three">${[['RQ 01','Predict earlier','Does twin context improve warning time at the same false-alarm budget?'],['RQ 02','Diagnose better','Does topology-aware diagnosis improve localization on unseen faults?'],['RQ 03','Act more safely','Does simulation-based action selection reduce SLA violations and harmful interventions?']].map(s=>`<article class="panel card"><span class="number">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join('')}</div>
<p class="footnote">Scope assumption: a controlled packet-network testbed with latency, loss and throughput SLAs. This is a proposed research plan, not an assertion of novelty or completed results. Confirm the contribution and submission rules with your supervisor in months 1–3.</p>`}
function stageDetail(i){const s=stages[i];$('#stage-detail').innerHTML=`<p class="eyebrow">CAPABILITY ${String(i+1).padStart(2,'0')} / ${s[3].toUpperCase()}</p><h2>${s[1]}</h2><p>${s[4]}</p><div class="meta-row"><span>Contract</span><strong>${escapeHTML(s[5])}</strong></div><div class="meta-row"><span>Build</span><div>${s[6]}</div></div><div class="meta-row"><span>Verify</span><div>${s[7]}</div></div><a href="#architecture" class="button outline" style="margin-top:18px">Open Java blueprint ↗</a>`;document.querySelectorAll('[data-stage]').forEach(b=>{const active=+b.dataset.stage===i;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)})}
const pages={overview};
function render(){const name=location.hash.slice(1)||'overview';const page=pages[name]?name:'overview';$('#main').innerHTML=pages[page]();document.querySelectorAll('[data-page]').forEach(a=>{a.classList.toggle('active',a.dataset.page===page);if(a.dataset.page===page){a.setAttribute('aria-current','page');$('#breadcrumb').textContent=a.textContent.slice(2).trim()}else a.removeAttribute('aria-current')});if(page==='overview')stageDetail(0);if(typeof initPage==='function')initPage(page)}
document.addEventListener('click',async e=>{const stage=e.target.closest('[data-stage]');if(stage)stageDetail(+stage.dataset.stage);const copy=e.target.closest('.copy');if(copy){const content=copy.parentElement.querySelector('code').textContent;try{await navigator.clipboard.writeText(content);toast('Copied to clipboard')}catch{toast('Select the code and copy it manually.')}}});
$('#print').addEventListener('click',()=>window.print());window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);$('#main').focus({preventScroll:true})});

const diagrams={
loop:`flowchart TD
  A[Live network data: telemetry, KPIs, alarms] --> B[Digital twin sync: versioned network state]
  B --> C[Predict degradation risk]
  C --> D{Degradation predicted?}
  D -- No --> A
  D -- Yes --> E[Root-cause analysis]
  E --> F[Simulate candidate fixes and no action]
  F --> G[Select safest feasible action]
  G --> H{Fresh state and policy gates pass?}
  H -- No: abstain or review --> A
  H -- Yes --> I[Guarded self-healing in testbed]
  I --> J{SLA restored in verification window?}
  J -- No --> K[Rollback and record failure]
  K --> B
  J -- Yes --> L[Record recovery; test prevention against baseline]
  L --> B
  classDef twin fill:#e0f3ed,stroke:#399882,color:#184e48
  classDef ai fill:#eee9fb,stroke:#8b77c1,color:#493978
  classDef action fill:#fff0dc,stroke:#bd914c,color:#715022
  class B,F,L twin
  class C,E ai
  class G,I,K action`,
sequence:`sequenceDiagram
  participant T as Telemetry
  participant W as Twin
  participant P as Predictor
  participant S as Simulator
  participant D as Decision policy
  participant A as Actuator
  T->>W: ValidatedEvent (eventId, eventTime)
  W->>P: Snapshot v42 + FeatureWindow
  P->>D: RiskPrediction (modelVersion, horizon)
  D->>S: Snapshot v42 + candidate set + seed
  S-->>D: Outcomes + uncertainty + no-action result
  alt Policy gates pass
    D->>A: Decision (snapshotVersion, expiry, idempotencyKey)
    A->>W: Verify preconditions / version
    A-->>D: ActionReceipt
    T->>W: Post-action measurements
    W-->>D: Verification outcome
    opt Verification fails
      D->>A: Compensating rollback
    end
  else Stale state or uncertain outcome
    D-->>T: No-op / operator review
  end`,
architecture:`flowchart LR
  subgraph LAB[Controlled testbed]
    N[Network devices and fault injector]
  end
  subgraph JAVA[Java 21 / Spring Boot application]
    I[Ingestion and replay] --> T[Twin state / JGraphT]
    T --> P[Features and prediction / Tribuo]
    P --> R[Diagnosis]
    R --> S[Discrete-event simulation]
    S --> D[Decision policy]
    D --> A[Guarded actuator]
    A --> V[Verification and audit]
    V --> T
  end
  N --> I
  A --> N
  DB[(PostgreSQL: events, snapshots, experiments)] --- JAVA
  U[Research console / REST API] --> JAVA
  GH[GitHub Pages: this guide] -. documentation only .-> U`,
er:`erDiagram
  EXPERIMENT ||--o{ TELEMETRY_EVENT : records
  EXPERIMENT ||--o{ TWIN_SNAPSHOT : versions
  TWIN_SNAPSHOT ||--o{ RISK_PREDICTION : grounds
  RISK_PREDICTION ||--o{ CANDIDATE_ACTION : proposes
  CANDIDATE_ACTION ||--o{ SIMULATION_RUN : evaluates
  SIMULATION_RUN }o--|| TWIN_SNAPSHOT : uses
  RISK_PREDICTION ||--o| DECISION : yields
  DECISION ||--o| ACTION_RECEIPT : executes
  ACTION_RECEIPT ||--o| OUTCOME : verifies
  EXPERIMENT {
    UUID experimentId PK
    long seed
    string topologyHash
    string datasetHash
    string gitCommit
  }
  TELEMETRY_EVENT {
    UUID eventId PK
    UUID experimentId FK
    Instant eventTime
    string sourceId
    string metric
    double value
    string unit
  }
  TWIN_SNAPSHOT {
    UUID snapshotId PK
    UUID experimentId FK
    long version
    Instant watermark
    string stateHash
  }
  RISK_PREDICTION {
    UUID predictionId PK
    UUID snapshotId FK
    string modelVersion
    double breachProbability
    int horizonSeconds
  }
  DECISION {
    UUID decisionId PK
    UUID predictionId FK
    UUID selectedCandidateId FK
    string status
    Instant expiresAt
    string rationale
  }
  CANDIDATE_ACTION {
    UUID candidateId PK
    UUID predictionId FK
    string actionType
    string targetId
  }
  SIMULATION_RUN {
    UUID runId PK
    UUID candidateId FK
    UUID snapshotId FK
    long seed
    double slaViolationSeconds
  }
  ACTION_RECEIPT {
    UUID receiptId PK
    UUID decisionId FK
    string idempotencyKey UK
    string rollbackToken
    string status
  }
  OUTCOME {
    UUID outcomeId PK
    UUID receiptId FK
    double postSlaViolationSeconds
    string verificationStatus
  }`
};
let mermaidPromise;
async function drawMermaid(key,target){const el=document.getElementById(target);if(!el)return;el.textContent='Rendering diagram…';try{mermaidPromise??=import('https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs').then(m=>{m.default.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',themeVariables:{primaryColor:'#e7f3ef',primaryTextColor:'#192233',primaryBorderColor:'#4f9f8e',lineColor:'#7b899b',fontFamily:'system-ui',fontSize:'15px'},flowchart:{useMaxWidth:true,htmlLabels:false}});return m.default});const mermaid=await mermaidPromise;const {svg}=await mermaid.render('m'+Date.now()+Math.random().toString(36).slice(2),diagrams[key]);if(el.isConnected)el.innerHTML=svg}catch(err){if(el.isConnected)el.innerHTML='<p>Diagram library could not load. The complete Mermaid source below remains available; connect to the internet and reload to render.</p>'}}
function diagramPanel(key,id){return `<div class="diagram" id="${id}" aria-label="${key} diagram"></div><details class="source"><summary>View / copy Mermaid source</summary>${code(diagrams[key])}</details>`}
pages.workflow=()=>`${heading('02 / SYSTEM WORKFLOW','From observation to verified action.','Explore the control flow, service handoffs and relationships that turn your source diagram into a buildable system.','MERMAID + D3')}
<section class="panel"><div class="panel-top"><h2>The operational loop</h2><div class="tabs"><button class="tab" data-diagram="loop" aria-pressed="true">Control flow</button><button class="tab" data-diagram="sequence" aria-pressed="false">Service sequence</button></div></div><div id="workflow-diagram">${diagramPanel('loop','flow-diagram')}</div><div class="callout">The supplied diagram provides the core loop. This guide adds freshness checks, abstention, rollback and counterfactual evaluation. “Outage prevented” is a research claim to test, not an automatic success state.</div></section>
<section class="panel"><div class="panel-top"><div><h2>How the capabilities relate</h2><p class="subtle">A chord view of proposed module dependencies.</p></div><span class="mono">RELATIONSHIPS / NOT TRAFFIC</span></div><div class="chord-layout"><div id="chord-container"><svg id="chord" viewBox="-260 -260 520 520" role="img" aria-label="Chord diagram of module dependencies"></svg><p id="chord-status" class="footnote"></p></div><div><h3>Select a capability</h3><div class="legend" id="chord-legend"></div><div class="callout" id="relation-detail" aria-live="polite">Each ribbon represents one designed dependency. Ribbon width does not represent measured traffic or causal strength.</div><p class="footnote">“Concerd” is interpreted here as a chord diagram, built with D3. Use the dependency table below as the accessible text equivalent.</p></div></div><details><summary>Read all dependency contracts</summary><div class="table-scroll"><table><thead><tr><th>Producer</th><th>Consumer</th><th>Contract</th></tr></thead><tbody>${relations.map(r=>`<tr><td>${stages[r[0]][0]}</td><td>${stages[r[1]][0]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div></details></section><details class="panel"><summary>Original workflow reference</summary><img class="reference" src="reference-workflow.png" alt="Original workflow: live network data, twin sync, degradation prediction, diagnosis, simulated fixes, safest action, autonomous healing and outage prevention, with a no-degradation loop back to live data."></details>`;
const relations=[[0,1,'Validated telemetry'],[1,2,'Versioned state and features'],[1,3,'Topology and residuals'],[1,4,'Frozen simulation snapshot'],[2,3,'Risk and contributing features'],[3,4,'Ranked causes and candidates'],[4,5,'Candidate outcomes and uncertainty'],[1,5,'Freshness and constraints'],[5,6,'Expiring, idempotent decision'],[6,7,'Action receipt and rollback token'],[0,7,'Post-action measurements'],[7,1,'Verified state and feedback']];
const colors=['#427eab','#16887a','#8a6fca','#a2639b','#d6a244','#d47859','#53668b','#79984d'];
let d3Promise;
async function drawChord(){const svgEl=$('#chord');if(!svgEl)return;$('#chord-legend').innerHTML=stages.map((s,i)=>`<button data-relation="${i}" aria-pressed="false"><i style="background:${colors[i]}"></i>${s[0]}</button>`).join('')+'<button data-relation="all" aria-pressed="true">All</button>';try{d3Promise??=import('https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm');const d3=await d3Promise;if(!svgEl.isConnected)return;const matrix=stages.map(()=>stages.map(()=>0));relations.forEach(([a,b])=>{matrix[a][b]=1;matrix[b][a]=1});const chords=d3.chord().padAngle(.07)(matrix);const svg=d3.select(svgEl);svg.selectAll('*').remove();svg.append('g').selectAll('path').data(chords).join('path').attr('d',d3.ribbon().radius(177)).attr('fill',d=>colors[d.source.index]).attr('opacity',.32).attr('data-from',d=>d.source.index).attr('data-to',d=>d.target.index);const group=svg.append('g').selectAll('g').data(chords.groups).join('g');group.append('path').attr('d',d3.arc().innerRadius(181).outerRadius(199)).attr('fill',d=>colors[d.index]);group.append('text').each(d=>{d.angle=(d.startAngle+d.endAngle)/2}).attr('transform',d=>`rotate(${d.angle*180/Math.PI-90}) translate(211) ${d.angle>Math.PI?'rotate(180)':''}`).attr('text-anchor',d=>d.angle>Math.PI?'end':null).attr('font-size',12).attr('fill','#3f4e60').text(d=>stages[d.index][0]);$('#chord-status').textContent='12 dependency contracts · select a label to isolate its relationships.'}catch{$('#chord-status').textContent='D3 could not load. Select a capability to read its relationships or open the full dependency table.'}}
function relationSelect(value){document.querySelectorAll('[data-relation]').forEach(b=>{const active=b.dataset.relation===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});document.querySelectorAll('#chord path[data-from]').forEach(p=>p.setAttribute('opacity',value==='all'||p.dataset.from===value||p.dataset.to===value?'.55':'.045'));$('#relation-detail').innerHTML=value==='all'?'Each ribbon represents one designed dependency. Ribbon width does not represent measured traffic or causal strength.':relations.filter(r=>r[0]===+value||r[1]===+value).map(r=>`<p><strong>${stages[r[0]][0]} → ${stages[r[1]][0]}</strong><br>${r[2]}</p>`).join('')}
const snippets={
contracts:`// Java 21 — contract sketches; one public type per file.
public record TelemetryEvent(
    UUID eventId, UUID experimentId, Instant eventTime,
    String sourceId, String metric, double value, String unit) {}

public record RiskPrediction(
    UUID predictionId, UUID snapshotId, long snapshotVersion,
    double breachProbability, Duration horizon,
    String modelVersion, Instant generatedAt) {}

public interface TwinRepository {
    TwinSnapshot apply(ValidatedEvent event);
    Optional<TwinSnapshot> find(UUID snapshotId);
}

public interface DegradationPredictor {
    RiskPrediction predict(FeatureWindow features, TwinSnapshot twin);
}

public interface CandidateSimulator {
    SimulationResult evaluate(TwinSnapshot frozenTwin,
        CandidateAction action, Workload workload, long seed);
}

public interface DecisionPolicy {
    Decision choose(List<SimulationResult> results,
        SafetyConstraints constraints, Instant now);
}`,
policy:`// Policy sketch: scoring never overrides a hard constraint.
// Risk values must be calibrated estimates, not classifier confidence.
public Optional<SimulationResult> choose(
    List<SimulationResult> results,
    double maxHarmProbability,
    Duration maxSnapshotAge,
    Instant now) {
  return results.stream()
      .filter(r -> !r.snapshotTime().isAfter(now))
      .filter(r -> Duration.between(r.snapshotTime(), now)
          .compareTo(maxSnapshotAge) <= 0)
      .filter(SimulationResult::capacityConstraintsSatisfied)
      .filter(r -> Double.isFinite(r.harmUpperBound()))
      .filter(r -> r.harmUpperBound() <= maxHarmProbability)
      .filter(r -> r.expectedBenefit() > 0)
      .min(Comparator.comparingDouble(
          SimulationResult::predictedSlaViolationSeconds));
  // Empty => abstain / review, never execute a default action.
}
// Before actuation: atomically reserve idempotencyKey, recheck
// version/expiry/allowlist, record intent, execute with timeout,
// save receipt, verify, and compensate on failure.
// A DB transaction cannot atomically commit a remote network change:
// reconcile pending intents after crashes; design idempotent adapters.`,
layout:`twinlab/                         # Java application repository
├── pom.xml                      # Java 21 + Spring Boot BOM
├── mvnw / mvnw.cmd / .mvn/       # Commit Maven Wrapper files
├── src/main/java/org/twinlab/
│   ├── ingest/                  # Validation, replay, event time
│   ├── twin/                    # Immutable graph snapshots
│   ├── predict/                 # Features, train, inference
│   ├── diagnose/                # Fault ranking + evidence
│   ├── simulate/                # Seeded event queue + candidates
│   ├── policy/                  # Constraints and abstention
│   ├── actuate/                 # Testbed adapter + rollback
│   ├── verify/                  # Post-window + audit
│   └── api/                     # REST DTOs and auth
├── src/main/resources/db/migration/
├── src/test/                    # Unit, replay and policy tests
├── experiments/                 # YAML manifests + seeded scenarios
├── datasets/README.md           # Provenance, licenses, hashes
└── compose.yaml                 # PostgreSQL + app + testbed adapters`,
event:`{
  "eventId": "a7c9a8de-4c35-4a51-b33b-829c568fd401",
  "experimentId": "3a75a611-213f-468b-a4e2-cde2993e93db",
  "eventTime": "2026-10-01T10:00:00Z",
  "sourceId": "link-r1-r2",
  "metric": "latency_p95_ms",
  "value": 41.2,
  "unit": "ms",
  "schemaVersion": 1
}`};
pages.architecture=()=>`${heading('03 / JAVA BLUEPRINT','One application. Clear module boundaries.','Build a modular Java application first. Extract services only if measured scale or independent deployment needs justify the extra operational work.')}
<section class="panel"><h2>Reference architecture</h2>${diagramPanel('architecture','arch-diagram')}<p class="footnote">The application runs on a separate JVM host or university server. GitHub Pages serves the guide’s HTML, CSS and JavaScript; it cannot run the Java backend.</p></section>
<div class="grid equal"><section class="panel"><h2>Proposed stack</h2>${[['Java 21 + Maven','Use records, explicit interfaces and deterministic clocks. Commit the Maven Wrapper and pin dependency versions.'],['Spring Boot 4.1.x','REST API, configuration, validation, Actuator and test integration. Verify third-party library compatibility before pinning the exact patch.'],['JGraphT','Represent directed topology, service dependencies and candidate routes; persist serializable graph snapshots.'],['Tribuo','Train an interpretable Java baseline and probability model; retain preprocessing and model provenance.'],['PostgreSQL','Store events, versioned state, experiment manifests, decisions and immutable audit records.'],['JUnit + Testcontainers','Test event replay, persistence, API contracts, decision invariants and failure recovery against real service containers.']].map(s=>`<div class="stack-row"><strong>${s[0]}</strong><p>${s[1]}</p></div>`).join('')}<p class="footnote" style="margin-top:15px">Kafka is optional after a throughput benchmark shows a need. A database-backed ingestion queue is sufficient for the first reproducible prototype.</p></section><section class="panel"><h2>Repository structure</h2>${code(snippets.layout)}<h3>Build sequence</h3><ol><li>Generate a Maven Java 21 project using <a href="https://start.spring.io/" target="_blank" rel="noopener">Spring Initializr</a>: Web, Validation, Actuator, JDBC and PostgreSQL.</li><li>Create migrations and event validation; add a file-based replay adapter.</li><li>Implement immutable twin snapshots and a deterministic simulator.</li><li>Add prediction and diagnosis behind interfaces; wire policy last.</li><li>Keep the actuator in dry-run mode until the testbed safety gate passes.</li></ol>${code('./mvnw verify\n./mvnw spring-boot:run -Dspring-boot.run.profiles=local')}<p class="footnote">Commands apply to the Java application you create. This deliverable is the development guide, not the completed backend.</p></section></div>
<section class="panel"><div class="panel-top"><h2>Implementation contracts</h2><div class="tabs">${[['contracts','Java interfaces'],['policy','Decision policy'],['event','Telemetry JSON']].map(([k,t],i)=>`<button class="tab" data-code="${k}" aria-pressed="${i===0}">${t}</button>`).join('')}</div></div><div id="java-code">${code(snippets.contracts)}</div><p class="footnote">Illustrative contracts: supporting domain types, imports, validation and persistence must be implemented. Reject invalid probabilities, timestamps, units and missing identifiers at the boundary.</p></section>
<section class="panel"><h2>API surface to implement</h2><div class="table-scroll"><table><thead><tr><th>Endpoint</th><th>Purpose</th><th>Required behavior</th></tr></thead><tbody>${[['POST /api/v1/telemetry','Accept a validated batch','202 + ingestion ID; idempotent event IDs; 400 on invalid schema'],['GET /api/v1/twins/{id}','Inspect a snapshot','Return version, event-time watermark and freshness'],['POST /api/v1/experiments','Start a seeded replay','202 + run ID; dataset hash, topology hash and git commit required'],['GET /api/v1/experiments/{id}','Inspect experiment status','Queued / running / completed / failed with artifacts'],['POST /api/v1/simulations','Compare candidate actions','Frozen snapshot, seed, workload and no-action baseline required'],['POST /api/v1/decisions/{id}/approve','Approve a testbed decision','Researcher role; expiry; bind approval to snapshot and action'],['POST /api/v1/actions','Execute approved action','Operator role; idempotency key; 409 on stale state; fail closed'],['GET /api/v1/outcomes/{id}','Inspect outcome evidence','Pre/post windows, rollback status and counterfactual run links']].map(r=>`<tr><td><code>${r[0]}</code></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div><p class="footnote">Protect the future API with authentication and role checks. Persist an action intent before dispatch, reconcile timeouts, and never place backend credentials in the public guide.</p></section>
<section class="panel"><h2>Persistent research evidence</h2>${diagramPanel('er','er-diagram')}<p class="footnote">Logical model. Enforce selectedCandidateId → CANDIDATE_ACTION with a nullable foreign key (abstention has no selected action), record dataset/model hashes, and index eventTime + sourceId. Store large snapshots as immutable artifacts with checksums.</p></section>
<section class="panel"><h2>First vertical slice · definition of done</h2><ol><li>Replay a fixed 10-minute fixture with one injected link fault and a recorded random seed.</li><li>Produce identical twin state hashes on repeated replay, including duplicated and out-of-order inputs.</li><li>Emit a threshold-based risk event, rank a known faulty link, and simulate reroute versus no-op.</li><li>Persist a dry-run decision and its reasons. A stale or low-confidence snapshot produces abstention.</li><li>Generate an experiment report with latency, loss, twin error and decision latency; archive all inputs.</li></ol></section>`;
const phases=[
{title:'Frame the research',start:1,end:3,focus:'Scope & research gap',goal:'Agree a narrow, testable contribution and secure a usable testbed.',build:'Create the Java skeleton, telemetry schema, versioned experiment manifest and initial literature evidence matrix.',research:'Compare prior approaches by prediction horizon, twin fidelity, safety policy, datasets and evaluation quality. Define the primary endpoint before model development.',gate:['Supervisor approves RQs, scope and novelty hypothesis','Dataset / testbed access and permissions confirmed','Evaluation protocol, baselines and data split frozen'],artifact:'Proposal + related-work matrix + evaluation protocol',chapter:'Ch. 1 Introduction and Ch. 2 Related work',risk:'If network data access is delayed, use synthetic fault injection and explicitly limit external-validity claims.'},
{title:'Build the observable twin',start:4,end:6,focus:'Telemetry & twin MVP',goal:'Reproduce a network state from a deterministic replay.',build:'Implement ingestion, event-time handling, JGraphT topology, snapshot persistence and a seeded testbed driver.',research:'Quantify twin lag and state error on independent workload traces; characterize where the twin is unreliable.',gate:['Replay, duplicate and late-event tests pass','Twin fidelity benchmark and error budget recorded','MVP demo and first-year research direction reviewed'],artifact:'Twin MVP + dataset v1 + fidelity report',chapter:'Ch. 3 System design and methodology',risk:'If twin error exceeds the agreed budget, narrow the network model before adding autonomous actions.'},
{title:'Predict & localize',start:7,end:9,focus:'Prediction & diagnosis',goal:'Produce measurable warning time and defensible fault ranking.',build:'Implement rolling features, Java baselines, a calibrated predictor and topology-aware diagnosis.',research:'Run temporal holdouts, topology holdouts and ablations. Tune on validation data only; keep the final test partition sealed.',gate:['Leakage audit completed before training','Prediction and diagnosis baselines reproduced','RQ1 / RQ2 pilot evidence and uncertainty reviewed'],artifact:'Model registry v1 + prediction / diagnosis pilot',chapter:'Ch. 4 Prediction and localization',risk:'If an advanced model gives no benefit, retain the baseline and investigate which twin features add information.'},
{title:'Simulate & constrain',start:10,end:12,focus:'Candidate simulation',goal:'Demonstrate that the simulator can compare interventions credibly.',build:'Implement candidate catalogue, no-op baseline, capacity constraints, uncertainty gates and audit traces.',research:'Compare simulation outcomes to actual testbed interventions on withheld scenarios; measure action-ranking error.',gate:['Simulator validated against unseen testbed runs','Unsafe, stale and empty-candidate cases abstain','Year-one review and methods paper draft complete'],artifact:'Simulation engine + policy v1 + year-one report',chapter:'Ch. 5 Counterfactual action selection',risk:'If action rankings are unreliable, use the twin for recommendation only and study abstention behavior.'},
{title:'Close the loop safely',start:13,end:15,focus:'Testbed integration',goal:'Move from shadow operation to bounded testbed healing.',build:'Add approval, allowlists, durable action intents, idempotent adapters, verification, rollback and kill switch.',research:'Compare reactive recovery and proposed proactive recovery under matched workloads and faults.',gate:['Timeout, duplicate and partial-failure drills pass','Shadow-mode review authorizes testbed-only actuation','End-to-end protocol frozen before final runs'],artifact:'Integrated prototype + safety / rollback report',chapter:'Ch. 5 implementation and Ch. 6 evaluation setup',risk:'If rollback is unreliable, keep human approval and evaluate recommendations rather than autonomous deployment.'},
{title:'Run the evaluation',start:16,end:18,focus:'Experiments & ablations',goal:'Answer all three research questions with reproducible evidence.',build:'Automate experiment matrices, capture seeds and environment manifests, export immutable result tables.',research:'Run repeated paired trials; estimate confidence intervals by independent run; test load, topology, missing data and compound faults.',gate:['Primary and ablation experiments completed','Effect sizes, uncertainty and negative results documented','Data and analysis reproduced from a clean checkout'],artifact:'Frozen results + reproducibility package + paper draft',chapter:'Ch. 6 Results and Ch. 7 Discussion',risk:'Reduce exploratory experiments first if time slips; preserve primary comparisons, ablations and replication.'},
{title:'Write & challenge',start:19,end:21,focus:'Thesis & review',goal:'Turn the implementation and evidence into a coherent argument.',build:'Freeze research features. Fix reproducibility defects and document installation and limitations.',research:'Complete the thesis; review threats to validity, failed cases and comparison fairness. Plan publication revisions independently of submission.',gate:['Full thesis draft delivered to supervisor','Independent reader reproduces a representative run','Feedback, figures, citations and claims reconciled'],artifact:'Full thesis v1 + public-ready artifact candidate',chapter:'Complete all chapters, abstract and conclusion',risk:'Do not add new model families. Resolve only issues that materially affect validity or reproducibility.'},
{title:'Submit & prepare defense',start:22,end:24,focus:'Corrections & submission',goal:'Submit by the end of month 24 with institutional requirements satisfied.',build:'Archive the final release, checksums, environment and demonstration. Prepare a stable recorded demo.',research:'Apply review corrections, proofread, complete formatting and administrative checks; rehearse the defense.',gate:['Supervisor review and required forms completed','Final thesis and artifacts archived with checksums','Submission receipt saved; defense rehearsal complete'],artifact:'Submitted thesis + final software / data archive',chapter:'Final thesis and defense deck',risk:'Reserve month 24 for submission issues. Defense / viva timing follows university scheduling and may be later.'}
];
const months=[
['Define the problem','Scope one network type, one SLA and three initial faults: congestion, link loss and device overload.'],['Map the literature','Create a comparison matrix; inspect available datasets and access conditions; draft the novelty argument.'],['Freeze the protocol','Agree research questions, baseline definitions, initial success targets and test partitions with the supervisor.'],['Ingest & replay','Create Java records, schema validation, event deduplication and a deterministic file replay adapter.'],['Model the topology','Implement JGraphT state, timestamp watermarks and immutable snapshots; inject known faults.'],['Validate twin fidelity','Benchmark twin lag and KPI error against testbed measurements; deliver the first reproducible demo.'],['Establish baselines','Implement static threshold, rolling EWMA and a simple supervised predictor using Java.'],['Add twin features','Train and calibrate the proposed risk model; compare warning time at fixed false-alarm rates.'],['Localize faults','Compare topology-aware diagnosis to flat residual ranking; complete RQ1 / RQ2 pilot analysis.'],['Build candidate trials','Implement seeded simulation of reroute, rate-limit and no-op; record cost and SLA effects.'],['Validate interventions','Compare simulated and testbed outcomes on new faults and workloads; quantify ranking errors.'],['Constrain decisions','Add feasibility checks and abstention; deliver year-one review, methods chapter and paper draft.'],['Integrate in shadow mode','Log recommendations without execution; compare them with operator or scripted testbed actions.'],['Exercise failure recovery','Implement and test idempotency, stale-state rejection, kill switch, verification and rollback.'],['Freeze the full protocol','Demonstrate bounded testbed healing; finalize repetitions from pilot variance and practical effect size.'],['Run primary experiments','Execute no-action, reactive and proactive paired trials with recorded seeds and clean resets.'],['Run ablations & stress tests','Remove twin features, simulation or risk gates in the isolated testbed; test drift and missing data.'],['Freeze the evidence','Compute run-level confidence intervals, publish result tables and reproduce a clean end-to-end run.'],['Complete the thesis draft','Integrate chapters written throughout the project; align each claim with a figure or experiment.'],['Obtain critical review','Send the complete draft to the supervisor and an independent reader; log substantive corrections.'],['Resolve review findings','Revise arguments, verify plots and citations, and finalize the reproducibility package.'],['Prepare final submission','Check institutional format, originality, permissions, repository restrictions and required forms.'],['Rehearse & proofread','Prepare defense slides and a stable demo; complete supervisor corrections and final proofreading.'],['Submit with buffer','Upload the approved thesis, retain the receipt, archive artifacts and prepare for scheduled defense.']
];
let plan={start:'',done:[]};try{const saved=JSON.parse(localStorage.getItem('twinlab-plan-v1'));if(saved&&Array.isArray(saved.done))plan={start:/^\d{4}-\d{2}$/.test(saved.start)?saved.start:'',done:saved.done.filter(x=>Number.isInteger(x)&&x>=0&&x<24)}}catch{}
let activePhase=0;
function savePlan(){try{localStorage.setItem('twinlab-plan-v1',JSON.stringify(plan));return true}catch{toast('Browser storage unavailable. Export the plan to retain progress.');return false}}
function monthLabel(n){if(!plan.start)return 'Month '+n;const [y,m]=plan.start.split('-').map(Number);return new Date(y,m+n-2,1).toLocaleDateString('en',{month:'short',year:'numeric'})}
function roadmap(){return `${heading('04 / 24-MONTH ROADMAP','Build, evaluate, write — in parallel.','Eight review gates connect software delivery to thesis evidence. Select a phase to see its development work, research outputs and acceptance criteria.','SUBMISSION / MONTH 24')}
<div class="toolbar"><label for="start-month">Project start</label><input id="start-month" type="month" value="${plan.start}" min="2000-01" max="2100-12"><button class="button outline" id="export-plan">Export progress</button><button class="quiet" id="reset-plan">Reset checklist</button><span class="subtle">${plan.start?'Planned submission: '+monthLabel(24):'Choose a month to map the plan to calendar dates.'}</span></div>
<section class="panel"><div class="panel-top"><div><h2>Two-year delivery map</h2><p class="subtle">Every phase ends with a reviewable artifact.</p></div><span class="mono">YEAR 01 → YEAR 02</span></div><div class="timeline"><div class="timeline-grid"><span class="timeline-label">Workstream / month</span>${Array.from({length:24},(_,i)=>`<span class="month">${i+1}</span>`).join('')}${phases.map((p,i)=>`<span class="timeline-label" style="grid-row:${i+2};grid-column:1">${p.focus}</span><button class="bar ${i===activePhase?'selected':''}" data-phase="${i}" aria-pressed="${i===activePhase}" style="grid-row:${i+2};grid-column:${p.start+1}/span ${p.end-p.start+1}" aria-label="Phase ${i+1}: ${p.title}, months ${p.start} to ${p.end}">M${p.start}–${p.end} ↗</button>`).join('')}<span class="timeline-label" style="grid-row:10">Literature & thesis writing</span><span class="bar" style="grid-row:10;grid-column:2/span 24;background:#f0f2f5;color:#69768a">Monthly literature updates · chapter drafts · supervisor meetings · research log</span></div></div></section>
<div class="tabs" style="margin-bottom:20px">${phases.map((p,i)=>`<button class="tab" data-phase="${i}" aria-pressed="${i===activePhase}">Phase ${i+1}</button>`).join('')}</div><div id="phase-detail"></div><section class="panel"><div class="panel-top"><div><h2>Monthly deliverables</h2><p class="subtle">Keep a tangible output every month; progress stays in this browser.</p></div><span class="badge" id="progress-count">${plan.done.length} / 24 complete</span></div><div class="progress"><span style="width:${plan.done.length/24*100}%"></span></div><div class="month-list">${months.map((m,i)=>`<article class="month-card"><span class="number">M${String(i+1).padStart(2,'0')} / ${monthLabel(i+1)}</span><label style="display:flex;gap:9px"><input type="checkbox" data-month="${i}" ${plan.done.includes(i)?'checked':''} aria-label="Complete month ${i+1}: ${m[0]}"><strong style="font-size:14px">${m[0]}</strong></label><p>${m[1]}</p></article>`).join('')}</div></section><div class="callout">Planning assumptions: full-time effort, supervisor availability and testbed access by month 3. Publications are draft/submission targets; acceptance and university examination dates are not guaranteed. Confirm local milestones during the proposal phase.</div>`}
pages.roadmap=roadmap;
function phaseDetail(i){activePhase=i;const p=phases[i];document.querySelectorAll('[data-phase]').forEach(b=>{b.classList.toggle('selected',+b.dataset.phase===i);b.setAttribute('aria-pressed',+b.dataset.phase===i)});$('#phase-detail').innerHTML=`<section class="panel"><div class="panel-top"><div><p class="eyebrow">PHASE ${i+1} / MONTHS ${p.start}–${p.end} / ${monthLabel(p.start)} – ${monthLabel(p.end)}</p><h2>${p.title}</h2><p class="subtle">${p.goal}</p></div><span class="badge">GATE ${i+1}</span></div><div class="phase-card"><div><h3>Developer work</h3><p class="subtle">${p.build}</p><h3>Research work</h3><p class="subtle">${p.research}</p><h3>Thesis thread</h3><p class="subtle">${p.chapter}</p></div><div><h3>Exit criteria</h3><ul>${p.gate.map(g=>`<li>${g}</li>`).join('')}</ul><div class="callout"><strong>Deliverable</strong><br>${p.artifact}</div></div></div><div class="callout amber"><strong>Contingency:</strong> ${p.risk}</div></section>`}
pages.research=()=>`${heading('05 / RESEARCH & EVALUATION','Make every claim traceable.','The contribution is evidence that twin-assisted decisions improve outcomes under stated conditions. Build the comparison protocol before optimizing the model.','PROPOSED STUDY DESIGN')}
<section class="panel"><h2>Research questions → measurable evidence</h2><div class="table-scroll"><table><thead><tr><th>Question</th><th>Comparison</th><th>Primary evidence</th><th>Required ablation</th></tr></thead><tbody><tr><td><strong>RQ1 · Prediction</strong><br>Does twin context provide earlier warning?</td><td>Static threshold, EWMA, telemetry-only model, twin-aware model</td><td>Lead time at matched false alarms/hour; event recall; PR-AUC and calibration</td><td>Remove topology and twin residual features</td></tr><tr><td><strong>RQ2 · Diagnosis</strong><br>Does topology improve localization?</td><td>Flat residual ranking versus dependency-aware diagnosis</td><td>Top-1 / top-3 fault accuracy, diagnosis latency and abstention coverage</td><td>Remove topology; test unseen fault locations</td></tr><tr><td><strong>RQ3 · Recovery</strong><br>Does simulated action selection improve safety?</td><td>No action, reactive rule-based recovery, prediction + rules, full twin policy</td><td>SLA-violation seconds per run; recovery time; harmful-action rate</td><td>Remove simulation; remove risk gate in isolated testbed only</td></tr></tbody></table></div></section>
<div class="grid equal"><section class="panel"><h2>Experiment protocol</h2><ol><li><strong>Define the outcome.</strong> Example starting SLA: p95 latency &gt; 50 ms sustained for 30 s, or loss &gt; 1%. Select thresholds for the testbed before final runs.</li><li><strong>Create independent runs.</strong> Sample faults, loads and seeds; reset the network between conditions. Include fault-free controls and compound faults.</li><li><strong>Split without leakage.</strong> Separate training, validation and test by time and experiment run; hold out topologies. Fit scalers only on training data and embargo overlapping windows around split boundaries.</li><li><strong>Lock the protocol.</strong> Select thresholds on validation data. Determine repetitions from pilot variance and the smallest useful effect; do not count correlated telemetry samples as independent trials.</li><li><strong>Pair comparisons.</strong> Use matching fault schedules and seeds across policies. Randomize policy run order and record any uncontrolled conditions.</li><li><strong>Report uncertainty.</strong> Report paired effect sizes and 95% run-level bootstrap intervals; predeclare the primary metric and separate exploratory comparisons.</li><li><strong>Keep all outcomes.</strong> Include abstentions, failed actions, timeouts, simulator mismatch and negative results.</li></ol></section><section class="panel"><h2>Initial engineering targets</h2><p class="subtle">Discussion targets for months 1–3. These are unvalidated design choices, not research findings.</p><div class="table-scroll"><table><thead><tr><th>Property</th><th>Initial target</th></tr></thead><tbody><tr><td>Prediction horizon</td><td>60 seconds before defined SLA breach</td></tr><tr><td>Twin freshness</td><td>p95 lag ≤ 2 s at agreed ingestion load</td></tr><tr><td>Control-loop latency</td><td>p95 compute time ≤ 5 s, excluding observation window</td></tr><tr><td>False-alarm budget</td><td>≤ 1 alert/hour per monitored topology</td></tr><tr><td>Action precondition</td><td>No stale snapshot, allowlist violation or missing rollback path</td></tr><tr><td>Replay reproducibility</td><td>Same fixture + seed + version → same state and decisions</td></tr></tbody></table></div><div class="callout">Prediction is useful only if warning time exceeds diagnosis + simulation + actuation time. Report that margin, including its failure cases.</div><h3>Minimum data record</h3><p class="subtle">Event time and collection time; device/link identity; load; latency, loss and throughput; fault type, start and end; topology version; actions; observation windows. Ground truth comes from the fault injector, not from the predictor.</p></section></div>
<section class="panel"><div class="panel-top"><div><h2>Explore the abstention gate</h2><p class="subtle">A deterministic teaching example — no trained model and no live network connection.</p></div><span class="badge">ILLUSTRATIVE VALUES</span></div><div class="grid equal"><div><label for="risk-limit">Maximum tolerated harm probability: <strong id="risk-value">5%</strong></label><input class="range" id="risk-limit" type="range" min="0" max="20" value="5"><label for="snapshot-age">Snapshot age: <strong id="age-value">1 s</strong></label><input class="range" id="snapshot-age" type="range" min="0" max="10" value="1"><label style="display:flex;gap:10px;margin:16px 0"><input id="rollback-ready" type="checkbox" checked> Rollback available</label><p class="footnote">Example candidates: reroute (harm upper bound 4%, 8 predicted violation seconds), rate-limit (2%, 16 seconds). Both improve on the 30-second no-action baseline. Maximum state age is 2 seconds.</p></div><div class="decision" id="gate-result" aria-live="polite"></div></div></section>
<section class="panel"><h2>Threats to validity & controls</h2><div class="table-scroll"><table><thead><tr><th>Threat</th><th>Control</th></tr></thead><tbody><tr><td>Synthetic faults are easier than real failures</td><td>Include unseen topologies, compound faults and workload shifts; clearly scope conclusions to the evaluated domain.</td></tr><tr><td>Simulator favors its own action policy</td><td>Calibrate on separate runs and evaluate final outcomes on an independent testbed, not only in the same simulator.</td></tr><tr><td>Training / test leakage</td><td>Group by run, time and topology; embargo overlapping windows; freeze feature extraction with the model.</td></tr><tr><td>Only successful interventions are reported</td><td>Record all decisions and abstentions; count induced SLA violations and rollback failures.</td></tr><tr><td>“Prevention” is inferred from recovery alone</td><td>Compare matched no-action runs and report estimated reduction with confidence intervals. Avoid claims about individual counterfactuals in production.</td></tr></tbody></table></div></section>
<div class="three"><section class="panel card"><span class="number">ARTIFACT 01</span><h3>Reproducible software</h3><p>Tagged source, dependency lock/version manifest, container definitions, CI results and a one-command representative experiment.</p></section><section class="panel card"><span class="number">ARTIFACT 02</span><h3>Auditable evidence</h3><p>Licensed data, seeds, hashes, raw runs, model provenance, analysis code and figures linked to research questions.</p></section><section class="panel card"><span class="number">ARTIFACT 03</span><h3>Defensible thesis</h3><p>Problem, related work, method, prediction, action selection, results, limitations and conclusion. Draft chapters throughout the project.</p></section></div>`;
const deployment=`name: Publish developer guide
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: github-pages
  cancel-in-progress: false
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4`;
const refs=[['Spring Boot system requirements','https://docs.spring.io/spring-boot/system-requirements.html','Java compatibility and supported build tools'],['Tribuo','https://tribuo.org/','Java machine learning and model provenance'],['JGraphT','https://jgrapht.org/','Graph data structures and algorithms'],['Mermaid usage','https://mermaid.js.org/config/usage.html','Text-based workflows, sequence and ER diagrams'],['D3 chord layouts','https://d3js.org/d3-chord','Relationship visualization using a matrix'],['GitHub Pages overview','https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages','Static HTML, CSS and JavaScript hosting'],['GitHub Pages deployment','https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically','Publish from a GitHub Actions workflow'],['GitHub Pages publishing source','https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site','Repository configuration and troubleshooting']];
pages.hosting=()=>`${heading('06 / PUBLISH & RESOURCES','A guide you can version and share.','This static website is ready for a GitHub repository. No application server or build step is required to publish the guide.','GITHUB PAGES READY')}
<div class="callout">Hosting boundary: GitHub Pages hosts this guide. The Java research application requires a separate JVM runtime, database and testbed. The interactive examples here use illustrative data only.</div>
<div class="grid equal"><section class="panel"><h2>Publish with GitHub Pages</h2><ol><li>Create a GitHub repository such as <code>twinlab-guide</code>. Use a public repository if that fits your research disclosure plan and GitHub account.</li><li>Add the contents of the supplied <code>twinlab-guide</code> folder to the repository root, including the hidden <code>.github/workflows/pages.yml</code> file. Preserve the <code>dist/</code> directory.</li><li>In the repository, open <strong>Settings → Pages → Build and deployment → Source → GitHub Actions</strong>.</li><li>Push to <code>main</code>, or run <strong>Publish developer guide</strong> from the Actions tab.</li><li>Wait for a successful deployment and open the URL from the workflow summary or Pages settings.</li></ol><p class="subtle">Expected project URL: <code>https://YOUR-USERNAME.github.io/twinlab-guide/</code>. The exact address comes from GitHub after deployment.</p><h3>Local preview</h3>${code('cd twinlab-guide\npython3 -m http.server 8000 --directory dist\n# Open http://localhost:8000')}<p class="footnote">Mermaid and D3 are loaded from version-pinned public CDNs. Internet access is needed to render diagrams. Text, navigation, code and the roadmap remain usable if a CDN fails.</p></section><section class="panel"><h2>Included deployment workflow</h2>${code(deployment)}<p class="footnote">Already included at <code>.github/workflows/pages.yml</code>. The workflow uploads only <code>dist/</code>; private Java application files should live in a separate repository.</p></section></div>
<section class="panel"><h2>Maintain the guide</h2><div class="table-scroll"><table><thead><tr><th>File</th><th>Edit here</th></tr></thead><tbody><tr><td><code>dist/index.html</code></td><td>Page shell, navigation, title and metadata</td></tr><tr><td><code>dist/styles.css</code></td><td>Responsive layout, colors, typography and print styles</td></tr><tr><td><code>dist/app.js</code></td><td>Research content, monthly plan, diagrams and interactions</td></tr><tr><td><code>dist/reference-workflow.png</code></td><td>The original user-supplied workflow reference</td></tr><tr><td><code>.github/workflows/pages.yml</code></td><td>GitHub Pages deployment</td></tr></tbody></table></div><p class="subtle" style="margin-top:16px">Roadmap checkmarks and the start month are stored only in this browser. Export progress before changing devices. Printing saves the current guide section; navigate to another section to print it separately.</p></section>
<section class="panel"><h2>Technical references</h2><p class="subtle">Official implementation documentation, checked 27 September 2026. These sources support the tools and hosting instructions; the proposed research contribution still requires a systematic literature review.</p><div class="ref-list">${refs.map(r=>`<a href="${r[1]}" target="_blank" rel="noopener">${r[0]} ↗<small>${r[2]}</small></a>`).join('')}</div></section>
<section class="panel"><h2>Open-source components & attribution</h2><p class="subtle">Mermaid 11.4.1 (MIT) and D3 7.9.0 (ISC) are used for the diagrams. The source workflow is user-supplied. Java libraries listed in the blueprint are recommendations for the future application, not bundled dependencies. Review their licenses before redistribution.</p><p class="subtle">The plan, thresholds, topology assumptions and candidate actions are draft design choices. No empirical research results or publication acceptance claims are presented.</p></section>`;
function gate(){const limit=+$('#risk-limit').value;const age=+$('#snapshot-age').value;const rollback=$('#rollback-ready').checked;$('#risk-value').textContent=limit+'%';$('#age-value').textContent=age+' s';const chosen=age<=2&&rollback?(limit>=4?'Reroute':limit>=2?'Rate-limit':null):null;const el=$('#gate-result');el.classList.toggle('blocked',!chosen);el.innerHTML=chosen?`<p class="eyebrow">FEASIBLE CANDIDATE</p><h2>${chosen}</h2><p>${chosen==='Reroute'?'8':'16'} predicted SLA-violation seconds, compared with 30 for no action.</p><p class="subtle">The harm bound fits your limit, state is fresh and rollback is available. Select the lowest predicted violation time among feasible actions.</p>`:`<p class="eyebrow">ABSTAIN / REQUEST REVIEW</p><h2>No action authorized.</h2><p>${!rollback?'Rollback is unavailable.':age>2?'The snapshot is older than the 2-second freshness budget.':'Neither candidate satisfies the chosen harm bound.'}</p><p class="subtle">Continue observation and record the reason. A better ranking score never overrides a failed safety gate.</p>`}
function download(name,text,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function initPage(page){if(page==='workflow'){drawMermaid('loop','flow-diagram');drawChord()}if(page==='architecture'){drawMermaid('architecture','arch-diagram').then(()=>drawMermaid('er','er-diagram'))}if(page==='roadmap')phaseDetail(activePhase);if(page==='research')gate()}
document.addEventListener('click',e=>{const dg=e.target.closest('[data-diagram]');if(dg){document.querySelectorAll('[data-diagram]').forEach(b=>b.setAttribute('aria-pressed',b===dg));$('#workflow-diagram').innerHTML=diagramPanel(dg.dataset.diagram,'flow-diagram');drawMermaid(dg.dataset.diagram,'flow-diagram')}const c=e.target.closest('[data-code]');if(c){$('#java-code').innerHTML=code(snippets[c.dataset.code]);document.querySelectorAll('[data-code]').forEach(b=>b.setAttribute('aria-pressed',b===c))}const rel=e.target.closest('[data-relation]');if(rel)relationSelect(rel.dataset.relation);const phase=e.target.closest('[data-phase]');if(phase)phaseDetail(+phase.dataset.phase);if(e.target.closest('#export-plan')){download('twinlab-roadmap-progress.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),start:plan.start||null,completedMonths:plan.done.map(i=>i+1),months:months.map((m,i)=>({month:i+1,calendar:monthLabel(i+1),title:m[0],deliverable:m[1],complete:plan.done.includes(i)}))},null,2));toast('Roadmap progress exported')}if(e.target.closest('#reset-plan')){if(confirm('Clear the 24 monthly checkmarks saved in this browser? The start month will be kept.')){plan.done=[];savePlan();render()}}});
document.addEventListener('change',e=>{if(e.target.id==='start-month'){if(e.target.value&&!e.target.validity.valid){toast('Choose a start month between 2000 and 2100.');return}plan.start=e.target.value;savePlan();render()}if(e.target.matches('[data-month]')){const n=+e.target.dataset.month;plan.done=e.target.checked?[...new Set([...plan.done,n])]:plan.done.filter(x=>x!==n);savePlan();$('#progress-count').textContent=plan.done.length+' / 24 complete';$('.progress span').style.width=plan.done.length/24*100+'%'}if(e.target.id==='rollback-ready')gate()});
document.addEventListener('input',e=>{if(['risk-limit','snapshot-age'].includes(e.target.id))gate()});
render();
// Keep the accessibility skip link within the current section.
$('.skip').addEventListener('click',event=>{event.preventDefault();$('#main').focus();$('#main').scrollIntoView({block:'start'})});
