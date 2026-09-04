import{c as s,e as c,a as g,p as E,w as R,i as I,b as O,g as P,r as D,d as N}from"./reveal-Dbyj4W15.js";function V(){const l=s.steps.length,r=s.steps.map((i,d)=>{const p=i.type==="multiple"?"checkbox":"radio",u=i.options.map(h=>`
        <label class="wizard-option">
          <input type="${p}" name="${c(i.id)}" value="${c(h.value)}" />
          <span class="wizard-option__box" aria-hidden="true"></span>
          <span class="wizard-option__label">${c(h.label)}</span>
        </label>`).join("");return`
      <fieldset class="wizard-step" data-step="${d}"${d===0?"":" hidden"}>
        <legend class="wizard-step__question">
          <span class="wizard-step__count u-en">Step ${d+1} / ${l}</span>
          ${c(i.question)}
          ${i.type==="multiple"?'<span class="wizard-step__hint">（複数選択可）</span>':""}
        </legend>
        <div class="wizard-step__options">${u}</div>
      </fieldset>`}).join("");return`
  <section class="wizard-section">
    <div class="container container--narrow">
      <header class="wizard-intro" data-wizard-intro>
        <span class="section-head__eyebrow">Diagnosis</span>
        <h1 class="wizard-intro__title">${c(s.intro.heading)}</h1>
        <p class="wizard-intro__lead">${c(s.intro.lead)}</p>
        <button class="btn btn--accent btn--lg" type="button" data-wizard-start>
          ${c(s.intro.startLabel)}${g()}
        </button>
      </header>

      <form class="wizard" data-wizard hidden>
        <div class="wizard__progress" data-wizard-progress>
          <div class="wizard__progress-head">
            <span data-wizard-progress-label>Step 1 / ${l}</span>
            <span data-wizard-progress-pct>0%</span>
          </div>
          <div class="wizard__progress-track">
            <span class="wizard__progress-bar" data-wizard-progress-bar></span>
          </div>
        </div>

        <div class="wizard__viewport">
          <div class="wizard__rail" data-wizard-rail>
            ${r}
          </div>
        </div>

        <div class="wizard__nav">
          <button class="btn btn--ghost" type="button" data-wizard-prev hidden>戻る</button>
          <button class="btn btn--accent" type="button" data-wizard-next>
            次へ${g()}
          </button>
        </div>
      </form>

      <div class="wizard-result" data-wizard-result hidden>
        <span class="section-head__eyebrow">Result</span>
        <h2 class="wizard-result__title" data-result-title></h2>
        <p class="wizard-result__summary" data-result-summary></p>
        <ul class="wizard-result__actions" data-result-actions></ul>

        <div class="wizard-result__outro">
          <h3>${c(s.outro.heading)}</h3>
          <p>${c(s.outro.body)}</p>
          <div class="wizard-result__cta">
            <a class="btn btn--accent btn--lg" href="${c(s.outro.cta.href)}">
              ${c(s.outro.cta.label)}${g()}
            </a>
            <button class="btn btn--ghost" type="button" data-wizard-restart>もう一度診断する</button>
          </div>
        </div>
      </div>
    </div>
  </section>`}function W({gsap:l}={}){var A,x;const r=document.querySelector("[data-wizard]");if(!r)return;const i=document.querySelector("[data-wizard-intro]"),d=document.querySelector("[data-wizard-result]"),p=r.querySelector("[data-wizard-rail]"),u=Array.from(p.querySelectorAll(".wizard-step")),h=r.querySelector("[data-wizard-prev]"),_=r.querySelector("[data-wizard-next]"),L=r.querySelector("[data-wizard-progress-bar]"),M=r.querySelector("[data-wizard-progress-label]"),C=r.querySelector("[data-wizard-progress-pct]"),w=E()||!l,b=u.length;let a=0;const m={};function v(){u.forEach((e,o)=>{e.hidden=o!==a});const t=Math.round((a+1)/b*100);L.style.width=`${t}%`,M.textContent=`Step ${a+1} / ${b}`,C.textContent=`${t}%`,h.hidden=a===0,_.textContent=a===b-1?"診断結果を見る":"次へ",_.appendChild(B()),k()}function B(){const t=document.createElementNS("http://www.w3.org/2000/svg","svg");return t.setAttribute("class","btn__arrow"),t.setAttribute("width","16"),t.setAttribute("height","16"),t.setAttribute("viewBox","0 0 16 16"),t.setAttribute("aria-hidden","true"),t.innerHTML='<path d="M1 8h12M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',t}function S(t,e){const o=a;if(a=Math.max(0,Math.min(b-1,t)),w||o===a){v(),y();return}const n=e==="next"?40:-40;l.fromTo(p,{autoAlpha:0,x:n},{autoAlpha:1,x:0,duration:.4,ease:"power2.out",onStart:v,onComplete:y})}function y(){const t=u[a].querySelector(".wizard-step__question");t==null||t.setAttribute("tabindex","-1"),t==null||t.focus({preventScroll:!0})}function $(t){const e=s.steps[t],o=Array.from(u[t].querySelectorAll(`input[name="${e.id}"]`));if(e.type==="multiple")m[e.id]=o.filter(n=>n.checked).map(n=>n.value);else{const n=o.find(f=>f.checked);m[e.id]=n?n.value:null}}function q(t){const e=s.steps[t];return Array.from(u[t].querySelectorAll(`input[name="${e.id}"]`)).some(n=>n.checked)}function k(){_.disabled=!q(a)}const T={few_applicants:"acquisition",media:"acquisition",decline:"conversion",ops:"conversion",early_turnover:"retention",sns:"branding"};function j(){const t=m.problems||[];if(!t.length)return s.results.balanced;const e={};t.forEach(f=>{const z=T[f];z&&(e[z]=(e[z]||0)+1)});const o=Object.keys(e);if(o.length>=3)return s.results.balanced;const n=o.sort((f,z)=>e[z]-e[f]);return o.length===2&&e[n[0]]===e[n[1]]?s.results.balanced:s.results[n[0]]||s.results.balanced}function H(){const t=j();d.querySelector("[data-result-title]").textContent=t.title,d.querySelector("[data-result-summary]").textContent=t.summary;const e=d.querySelector("[data-result-actions]");e.innerHTML=t.actions.map(o=>`<li>${o.replace(/</g,"&lt;")}</li>`).join(""),r.hidden=!0,d.hidden=!1,d.scrollIntoView({behavior:w?"auto":"smooth",block:"start"}),w||l.from(d.children,{autoAlpha:0,y:20,duration:.5,stagger:.08,ease:"power2.out"})}(A=document.querySelector("[data-wizard-start]"))==null||A.addEventListener("click",()=>{i.hidden=!0,r.hidden=!1,v(),w||l.from(r,{autoAlpha:0,y:16,duration:.4,ease:"power2.out"}),y()}),_.addEventListener("click",()=>{$(a),q(a)&&(a===b-1?H():S(a+1,"next"))}),h.addEventListener("click",()=>{$(a),S(a-1,"prev")}),p.addEventListener("change",t=>{t.target.matches("input")&&k()}),(x=document.querySelector("[data-wizard-restart]"))==null||x.addEventListener("click",()=>{Object.keys(m).forEach(t=>delete m[t]),p.querySelectorAll("input").forEach(t=>t.checked=!1),a=0,d.hidden=!0,i.hidden=!1,r.hidden=!0,i.scrollIntoView({behavior:w?"auto":"smooth",block:"start"})}),v()}document.documentElement.classList.remove("no-js");document.documentElement.classList.add("has-js");function F(){const l=document.getElementById("site-header"),r=document.getElementById("main"),i=document.getElementById("site-footer");l&&(l.outerHTML=D({solid:!0})),i&&(i.outerHTML=N()),r&&(r.innerHTML=V())}F();R();I();O({});W({gsap:E()?null:P});
