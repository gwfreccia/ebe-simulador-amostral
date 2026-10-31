(()=>{'use strict';
const $=id=>document.getElementById(id),stats=globalThis.EBEStats,planning=globalThis.EBEPlanning;
const num=(n,d=2)=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}),pct=(n,d=1)=>num(100*n,d)+'%',count=n=>Math.round(n).toLocaleString('pt-BR');
let current={};const activeInputs=['delta','sd','sample','alpha','target','outcome','effectMode','effectFraction'];
const signed=n=>(n<0?'−':'+')+num(Math.abs(n),1),nLabel=n=>n===null?'>10.000':n===5?'≤5':count(n);
function selectedOutcome(){return planning.outcomes.find(o=>o.id===$('outcome').value);}
function renderSourceRows(){
 $('sourceRows').innerHTML=planning.outcomes.map(o=>`<tr><th scope="row">${o.short}</th><td>${num(o.preE,1)} ± ${num(o.sdE,1)}<br>→ ${num(o.postE,1)} ± ${num(o.postSdE,1)}</td><td>${num(o.preA,1)} ± ${num(o.sdA,1)}<br>→ ${num(o.postA,1)} ± ${num(o.postSdA,1)}</td><td>${num(planning.baselineSD(o))}</td><td>${signed(planning.rawDifference(o))}</td><td>${o.p.replace('<','&lt;')}</td></tr>`).join('');
}
function updateCaseContext(o,mode,fraction,delta){
 $('baselineValue').textContent=num(planning.baselineSD(o))+' cm²';
 $('rawDifferenceValue').textContent=signed(planning.rawDifference(o))+' cm²';
 $('adjustedNote').textContent=o.adjusted;
 $('effectFractionValue').textContent=num(fraction);
 $('rulerControls').hidden=mode!=='baseline';
 $('delta').disabled=mode!=='absolute';
 $('delta').value=delta;
 $('deltaHint').textContent=mode==='absolute'?'cm² de vantagem na mudança de uma condição':'Calculada pela opção acima; escolha “Definir em cm²” para editar.';
 $('targetExplain').textContent=mode==='baseline'?`Cenário: detectar uma diferença de ${num(fraction)} × ${num(planning.baselineSD(o))} = ${num(delta)} cm² em ${o.short}. Esta é uma escala de planejamento, sem limiar estético estabelecido.`:mode==='published'?`Hipótese para nova coleta: uma diferença de magnitude ${num(delta)} cm², igual à diferença bruta da tabela em ${o.short}. Supor sua repetição pode ser otimista. O cálculo não é uma estimativa retrospectiva do poder do artigo.`:`Cenário: detectar ${num(delta)} cm² de vantagem média entre exercícios em ${o.short}. A magnitude foi definida por você; sua relevância precisa de justificativa própria.`;
 const basal=fraction*planning.baselineSD(o),paired=fraction*current.sd,max=Math.max(basal,paired);
 $('rulerComparison').innerHTML=[[`Fração ${num(fraction)} do DP basal`,basal,'baseline'],[`d_z = ${num(fraction)}`,paired,'paired']].map(([label,value,cls])=>`<div><span>${label}</span><div class="ruler-track"><i class="${cls}" style="width:${100*value/max}%"></i></div><strong>${num(value)} cm²</strong></div>`).join('');
 $('rulerExplain').textContent=`A primeira régua usa o DP basal de ${num(planning.baselineSD(o))} cm², calculado do suplemento. A segunda usa o DP pareado hipotético de ${num(current.sd)} cm². Os dois efeitos padronizados só coincidem quando os denominadores coincidem. Nenhum deles define, sozinho, importância estética.`;
}
function updateComparison(){
 const {mode,absolute,fraction,sd,alpha,target,n}=current,loss=+$('loss').value;
 const rows=planning.outcomes.map(o=>({...planning.scenario(o,{mode,absolute,fraction,sd,alpha,target,n,loss}),o}));
 const scale=Math.max(1,...rows.filter(r=>r.recruit!==null).map(r=>r.recruit));
 $('comparisonExplain').textContent=`Para comparar cenários, aplicamos o mesmo DP pareado hipotético de ${num(sd)} cm² e alfa=${num(alpha,5)} aos cinco desfechos. ${mode==='baseline'?`Cada alvo usa ${num(fraction)} do seu próprio DP basal.`:mode==='published'?'Cada alvo supõe a repetição da magnitude da diferença bruta publicada.':'O alvo absoluto é o mesmo em todos; por isso os resultados são iguais sob este mesmo DP.'} Não supomos que a dispersão real seja igual entre regiões.`;
 $('comparisonRows').innerHTML=rows.map(r=>`<tr class="${r.o.id===$('outcome').value?'selected-case':''}"><th scope="row"><button data-study-case="${r.o.id}" aria-pressed="${r.o.id===$('outcome').value}">${r.o.short}</button></th><td>${num(r.delta)}</td><td>${num(r.dz,3)}</td><td>${pct(r.power)}</td><td><strong>${nLabel(r.needed)}</strong>${r.needed===null?'':`<span class="n-bar" aria-hidden="true"><i class="n-recruit" style="width:${100*r.recruit/scale}%"><i class="n-complete" style="width:${100*r.needed/r.recruit}%"></i></i></span>`}</td><td>${r.recruit===null?'—':count(r.recruit)}</td></tr>`).join('');
}
function curveSVG(n,dz,alpha,target,needed){
 const xmax=Math.max(80,Math.min(10000,Math.ceil(Math.max(n,needed||500)*1.22/10)*10)),W=Math.max(280,Math.round($('powerChart').clientWidth||680)),H=325,L=52,R=22,T=25,B=55,pw=W-L-R,ph=H-T-B;
 $('powerChart').setAttribute('viewBox',`0 0 ${W} ${H}`);
 const X=x=>L+(x-5)/(xmax-5)*pw,Y=y=>T+(1-y)*ph;
 let s='<title>Poder por tamanho amostral</title><desc>Teste t pareado bilateral sob as hipóteses selecionadas. O eixo horizontal conta pessoas e o vertical mostra poder de zero a cem por cento.</desc>';
 for(let j=0;j<=4;j++){const y=j/4;s+=`<line x1="${L}" x2="${W-R}" y1="${Y(y)}" y2="${Y(y)}" stroke="#e4e8ee"/><text x="${L-12}" y="${Y(y)+4}" text-anchor="end">${j*25}%</text>`;}
 s+=`<path d="M${L} ${T}V${Y(0)}H${W-R}" fill="none" stroke="#8a95a2"/>`;
 for(let j=0;j<=4;j++){const v=Math.round(5+(xmax-5)*j/4);s+=`<text x="${X(v)}" y="${Y(0)+22}" text-anchor="middle">${count(v)}</text>`;}
 let points=[];for(let j=0;j<=100;j++){const v=Math.max(5,Math.round(5+(xmax-5)*j/100));points.push([X(v),Y(stats.power(v,dz,alpha))]);}
 s+=`<path d="${points.map((p,i)=>(i?'L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' ')}" stroke="#305394" stroke-width="3" fill="none"/>`;
 const py=stats.power(n,dz,alpha);s+=`<line x1="${L}" x2="${W-R}" y1="${Y(target)}" y2="${Y(target)}" stroke="#687482" stroke-dasharray="5 5"/><text x="${W-R-4}" y="${Y(target)-8}" text-anchor="end">Meta ${pct(target,0)}</text>`;
 s+=`<line x1="${X(n)}" x2="${X(n)}" y1="${Y(0)}" y2="${Y(py)}" stroke="#305394" stroke-dasharray="3 4"/><circle cx="${X(n)}" cy="${Y(py)}" r="6" fill="#305394" stroke="white" stroke-width="2"/>`;
 const labelx=Math.min(W-R-60,Math.max(L+6,X(n)+10)),labely=py>.9?Y(py)+25:Math.max(T+15,Y(py)-15);s+=`<text x="${labelx}" y="${labely}" style="fill:#243f70;font-weight:700">n=${count(n)}</text>`;
 if(needed&&needed!==n)s+=`<rect x="${X(needed)-5}" y="${Y(stats.power(needed,dz,alpha))-5}" width="10" height="10" fill="white" stroke="#687482" stroke-width="2"/>`;
 s+=`<text x="${L+pw/2}" y="${H-8}" text-anchor="middle">Pessoas com dados completos</text>`;return s;
}
function update(){
 const mode=$('effectMode').value,fraction=+$('effectFraction').value,absolute=+$('delta').value,o=selectedOutcome();
 const delta=planning.targetDelta(o,mode,absolute,fraction),sd=+$('sd').value,n=+$('sample').value,alpha=+$('alpha').value,target=+$('target').value,dz=delta/sd;
 const p=stats.power(n,dz,alpha),needed=stats.requiredN(dz,target,alpha);
 current={delta,sd,n,alpha,target,dz,p,needed,mode,fraction,absolute};
 updateCaseContext(o,mode,fraction,delta);
 $('deltaValue').textContent=num(delta)+' cm²';$('sdValue').textContent=num(sd)+' cm²';$('sampleValue').textContent=count(n);
 $('flowDelta').textContent=num(delta)+' cm²';$('flowSD').textContent=num(sd)+' cm²';$('flowDZ').textContent=num(dz,3);$('flowN').textContent=count(n);$('flowPower').textContent=pct(p);
 $('powerValue').textContent=pct(p);$('powerCaption').textContent='Probabilidade de significância bilateral, se estas hipóteses forem verdadeiras.';
 $('requiredValue').textContent=nLabel(needed);$('requiredCaption').textContent=needed===5?`meta ≥${pct(target,0)} já atingida no início do intervalo, n=5.`:needed?`pessoas com pares completos para poder ≥${pct(target,0)}.`:'O alvo não foi atingido no limite de cálculo. Não significa que o efeito seja impossível de detectar.';
 $('frequencyValue').textContent='≈ '+count(p*100);$('powerChart').innerHTML=curveSVG(n,dz,alpha,target,needed);
 const filled=Math.round(p*100);$('studyDots').innerHTML=Array.from({length:100},(_,i)=>`<i class="${i<filled?'filled':''}"></i>`).join('');$('studyDots').setAttribute('aria-label',`${filled} de 100 estudos atingiriam significância no cenário hipotético, em representação arredondada.`);
 $('useRequired').disabled=!needed;
 updateRecruitment();updateComparison();updateFrequency();
}
let frame;function scheduleUpdate(){cancelAnimationFrame(frame);frame=requestAnimationFrame(update);}
activeInputs.forEach(id=>$(id).addEventListener('input',scheduleUpdate));
window.addEventListener('resize',scheduleUpdate);
$('powerReset').addEventListener('click',()=>{Object.entries({delta:.5,sd:2,sample:17,alpha:.05,target:.8,outcome:'gmax',effectMode:'baseline',effectFraction:.2,loss:.2}).forEach(([k,v])=>$(k).value=v);$('sample').max=500;$('sd').min=.5;$('sd').max=12;$('sd').step='.01';update();});
$('use17').addEventListener('click',()=>{$('sample').value=17;update();});$('useRequired').addEventListener('click',()=>{if(!current.needed)return;$('sample').max=Math.max(500,current.needed);$('sample').value=current.needed;update();});
document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>{$('effectMode').value='absolute';$('delta').value=b.dataset.delta;update();}));
function updateRecruitment(){const loss=+$('loss').value,n=current.needed,recruit=n?Math.ceil(n/(1-loss)):null;$('recruitment').textContent=n?`No desfecho selecionado: ${count(n)} pessoas com dados completos → planejar cerca de ${count(recruit)} recrutadas, supondo perda de ${pct(loss,0)}.`:'O n completo ultrapassa o limite de cálculo; o recrutamento não foi estimado.';$('recruitValue').textContent=recruit?count(recruit):'—';$('recruitCaption').textContent=`Expectativa com ${pct(loss,0)} de perda. Ajuste a previsão abaixo da curva.`;}
$('loss').addEventListener('change',()=>{updateRecruitment();updateComparison();});
$('comparisonRows').addEventListener('click',e=>{const b=e.target.closest('[data-study-case]');if(!b)return;const id=b.dataset.studyCase;$('outcome').value=id;update();$('comparisonRows').querySelector(`[data-study-case="${id}"]`).focus({preventScroll:true});});
function getDecomp(){const ids=['bio','rho','sem'];if(ids.some(id=>!$(id).checkValidity()||!Number.isFinite(+$(id).value)||$(id).value===''))return null;return stats.pairedSD(+$('bio').value,+$('rho').value,+$('sem').value);}
function updateDecomp(){const v=getDecomp();$('applyDecomp').disabled=v===null;$('decompResult').textContent=v===null?'Preencha valores dentro dos limites indicados.':`DP total resultante: ${num(v,3)} cm². O mesmo valor será usado como dispersão total se você o aplicar.`;}
['bio','rho','sem'].forEach(id=>$(id).addEventListener('input',updateDecomp));$('applyDecomp').addEventListener('click',()=>{const v=getDecomp();if(v===null)return;$('sd').min=Math.min(.5,Math.floor(v*100)/100);$('sd').max=Math.max(5,Math.ceil(v*100)/100);$('sd').step='any';$('sd').value=v;update();});
function updateFrequency(){const pi=+$('prior').value/100,tp=1000*pi*current.p,fp=1000*(1-pi)*current.alpha;$('priorValue').textContent=pct(pi,0);$('truePositives').textContent='≈ '+count(tp);$('falsePositives').textContent='≈ '+count(fp);$('falseShare').textContent=pct(fp/(tp+fp));$('frequencyExplain').textContent=`De ${count(1000*pi)} estudos com efeito e ${count(1000*(1-pi))} sem efeito, esperamos cerca de ${count(tp+fp)} positivos no total. A fração usa as expectativas antes do arredondamento.`;}
$('prior').addEventListener('input',updateFrequency);
// Accessible contextual explanations: hover, keyboard focus, click/touch, Escape.
const concepts=JSON.parse($('concepts').textContent),tip=$('tooltip');let anchor=null,pinned=false,hideTimer;
function positionTip(){if(!anchor)return;const a=anchor.getBoundingClientRect(),r=tip.getBoundingClientRect();let x=Math.max(12,Math.min(innerWidth-r.width-12,a.left)),y=a.bottom+9;if(y+r.height>innerHeight-10)y=Math.max(10,a.top-r.height-9);tip.style.left=x+'px';tip.style.top=y+'px';}
function hideTip(){if(anchor)anchor.removeAttribute('aria-describedby');tip.hidden=true;anchor=null;pinned=false;}
function showTip(a){const c=concepts[a.dataset.tip];if(!c)return;clearTimeout(hideTimer);if(anchor&&anchor!==a)anchor.removeAttribute('aria-describedby');anchor=a;tip.innerHTML='';const title=document.createElement('strong');title.textContent=c.title;tip.append(title,document.createTextNode(c.text));tip.hidden=false;a.setAttribute('aria-describedby','tooltip');positionTip();}
document.querySelectorAll('[data-tip]').forEach(a=>{a.addEventListener('mouseenter',()=>{if(!pinned)showTip(a);});a.addEventListener('mouseleave',()=>{if(!pinned&&document.activeElement!==a)hideTimer=setTimeout(hideTip,180);});a.addEventListener('focus',()=>{if(!pinned)showTip(a);});a.addEventListener('blur',()=>{if(!pinned)hideTimer=setTimeout(hideTip,100);});a.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(anchor===a&&pinned)hideTip();else{showTip(a);pinned=true;}});});
tip.addEventListener('mouseenter',()=>clearTimeout(hideTimer));tip.addEventListener('mouseleave',()=>{if(!pinned)hideTip();});document.addEventListener('click',e=>{if(anchor&&!tip.contains(e.target)&&!e.target.closest('[data-tip]'))hideTip();});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});window.addEventListener('scroll',hideTip,{passive:true});window.addEventListener('resize',positionTip);
$('printButton').addEventListener('click',()=>print());let large=false;$('fontButton').addEventListener('click',()=>{large=!large;document.documentElement.style.setProperty('--read',large?'24px':'21px');$('fontButton').textContent=large?'A−':'A+';});
renderSourceRows();updateDecomp();update();
})();
