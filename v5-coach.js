/* Capsule AP V5 - Coach de revision local : planning, seances rapides, flashcards et QRC.
 * Aucun service externe, aucune note automatique par IA. Les donnees V5 restent sur cet appareil.
 */
window.CAPSULE_COACH = (() => {
  'use strict';
  const STORE_KEY='capsule-ap-v5-coach-v1';
  const DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const limit=(x,n=180)=>esc(String(x||'').slice(0,n));
  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const asDate=s=>{const p=String(s||'').split('-').map(Number);return new Date(p[0]||2026,(p[1]||1)-1,p[2]||1,12)};
  const addDays=(date,n)=>{const r=new Date(date);r.setDate(r.getDate()+n);return r};
  const weekKey=()=>{let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)};
  const formatDay=x=>new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(asDate(x));
  const defaultData=()=>({preferences:{days:[0,1,3],minutes:30,subject:'Toutes'},plans:{},reviews:{},qrcHistory:[],quick:{duration:15,focus:'weak'},quickSession:null});
  let data;try{data=Object.assign(defaultData(),JSON.parse(localStorage.getItem(STORE_KEY)||'{}'))}catch{data=defaultData()}
  if(!data.preferences||!Array.isArray(data.preferences.days))data.preferences=defaultData().preferences;
  if(!data.plans||typeof data.plans!=='object')data.plans={};
  if(!data.reviews||typeof data.reviews!=='object')data.reviews={};
  if(!Array.isArray(data.qrcHistory))data.qrcHistory=[];
  if(!data.quick)data.quick=defaultData().quick;
  let host=null, app={}, pane='overview', deck=[], pos=0, flipped=false, flashSubject='Toutes', flashLesson='', qrcItem=null, qrcAnswer='', qrcShow=false, criteria=[false,false,false], notification='';
  const save=()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(data));return true}catch{notification='Le stockage est indisponible : exporte tes donnees et libere de la place.';return false}};
  const nowDay=()=>iso(new Date());
  const allLessons=()=>Array.isArray(app.lessons)?app.lessons:[];
  const subjects=()=>[...new Set(allLessons().map(l=>l.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  const mainResults=()=>app.store?.results||{};
  const weakCount=id=>(app.store?.weak||[]).filter(x=>String(x).startsWith(id+'::')).length;
  const scoreLesson=l=>(mainResults()[l.id]?.best||0);
  function pickLessons(subject='Toutes'){
    const month=new Date().getMonth(), currentSemester=(month>=8||month<=1)?'S5':'S6';
    const a=allLessons().filter(l=>subject==='Toutes'||l.subject===subject);
    const priority=l=>(l.semester===currentSemester?0:75)+(mainResults()[l.id]?65+scoreLesson(l):0)-weakCount(l.id)*25;
    if(subject!=='Toutes')return a.sort((x,y)=>priority(x)-priority(y)||x.title.localeCompare(y.title,'fr'));
    const grouped=new Map();
    for(const l of a){if(!grouped.has(l.subject))grouped.set(l.subject,[]);grouped.get(l.subject).push(l)}
    for(const g of grouped.values())g.sort((x,y)=>priority(x)-priority(y)||x.title.localeCompare(y.title,'fr'));
    const names=[...grouped.keys()].sort((a,b)=>a.localeCompare(b,'fr'));
    const interleaved=[];let any=true;
    while(any){any=false;for(const name of names){const x=grouped.get(name).shift();if(x){interleaved.push(x);any=true}}}
    return interleaved;
  }
  function planWeek(force=false){
    const key=weekKey();if(data.plans[key]&&!force)return data.plans[key];
    const prefs=data.preferences, weekdays=prefs.days.filter(d=>Number.isInteger(d)&&d>=0&&d<7).sort((a,b)=>a-b);
    const candidates=pickLessons(prefs.subject), days=[];let cursor=0;
    const next=()=>{if(!candidates.length)return null;return candidates[(cursor++)%candidates.length]};
    for(let d=0;d<7;d++){
      const date=iso(addDays(asDate(key),d));const enabled=weekdays.includes(d),tasks=[];
      if(enabled){
        const duration=Math.max(5,Math.min(90,num(prefs.minutes,30)));
        const main=next();
        if(main){
          if(duration<=10){tasks.push({id:date+'-flash-'+main.id,type:'flash',lessonId:main.id,minutes:5,done:false});}
          else {
            tasks.push({id:date+'-lesson-'+main.id,type:'lesson',lessonId:main.id,minutes:15,done:false});
            if(duration>=25)tasks.push({id:date+'-flash-'+main.id,type:'flash',lessonId:main.id,minutes:5,done:false});
            if(duration>=30)tasks.push({id:date+'-qrc-'+main.id,type:'qrc',lessonId:main.id,minutes:10,done:false});
            if(duration>=45){const second=next();if(second)tasks.push({id:date+'-lesson-'+second.id,type:'lesson',lessonId:second.id,minutes:15,done:false})}
            if(duration>=60){const third=next();if(third)tasks.push({id:date+'-qrc-'+third.id,type:'qrc',lessonId:third.id,minutes:10,done:false})}
          }
        }
      }
      days.push({date,name:DAYS[d],tasks});
    }
    data.plans[key]={createdAt:Date.now(),days};
    for(const k of Object.keys(data.plans).sort().slice(0,Math.max(0,Object.keys(data.plans).length-10)))delete data.plans[k];
    save();return data.plans[key];
  }
  const getPlan=()=>planWeek();
  const getCard=(l,i)=>{
    const q=l?.questions?.[i];if(!q)return null;
    const correct=(q.correct||[]).map(n=>q.choices?.[n]).filter(Boolean);
    return {id:l.id+'::'+i,lessonId:l.id,lesson:l,question:q.text||'',answer:correct.join(' · '),pill:q.pill||'',reasons:(q.correct||[]).map(n=>q.reason?.[n]).filter(Boolean)};
  };
  function dueCards({subject='Toutes',lessonId='',weakOnly=false}={}){
    const today=nowDay(), base=(lessonId?allLessons().filter(l=>l.id===lessonId):allLessons().filter(l=>subject==='Toutes'||l.subject===subject));
    const cards=[];
    for(const l of base){for(let i=0;i<(l.questions||[]).length;i++){
      const c=getCard(l,i);if(!c)continue;
      const review=data.reviews[c.id];if(review?.due && review.due>today)continue;
      if(weakOnly && !(app.store?.weak||[]).includes(c.id))continue;
      cards.push(c);
    }}
    cards.sort((a,b)=>{
      const wa=(app.store?.weak||[]).includes(a.id)?-3:0,wb=(app.store?.weak||[]).includes(b.id)?-3:0;
      const aa=(data.reviews[a.id]? -1:0)+wa,bb=(data.reviews[b.id]? -1:0)+wb;
      return aa-bb || a.lesson.subject.localeCompare(b.lesson.subject,'fr') || a.lesson.title.localeCompare(b.lesson.title,'fr');
    });
    return cards;
  }
  function pills(title,sub){return `<header class="v5-header"><span class="v5-badge">CAPSULE AP V5 · COACH</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></header>`}
  const button=(label,action,css='',extra='')=>`<button type="button" class="v5-btn ${css}" data-v5="${action}" ${extra}>${label}</button>`;
  const tabbar=()=>`<div class="v5-tabs" role="navigation" aria-label="Outils de revision">${[['overview','Vue d’ensemble'],['plan','Planning'],['flash','Flashcards'],['qrc','QRC'],...(data.quickSession?[['session','Ma séance']]:[])].map(([id,label])=>`<button type="button" data-v5="pane" data-pane="${id}" class="${pane===id?'selected':''}">${label}</button>`).join('')}</div>`;
  function overview(){const p=getPlan(), tasks=p.days.flatMap(x=>x.tasks),done=tasks.filter(t=>t.done).length, today=p.days.find(x=>x.date===nowDay())||null;
    const due=dueCards({subject:data.preferences.subject}).length;
    return `${pills('Réviser sans se disperser','Des séances courtes, un planning réaliste et des entraînements sur tes véritables capsules.')}${tabbar()}
      <div class="v5-metrics"><div><strong>${done}/${tasks.length}</strong><span>activités cette semaine</span></div><div><strong>${due}</strong><span>flashcards à découvrir / réviser</span></div></div>
      <section class="v5-card v5-accent"><h2>⏱️ J’ai un peu de temps</h2><p>Choisis une durée et une priorité. Ta séance sera préparée à partir des capsules disponibles.</p>
      <label class="v5-label" for="v5-quick-duration">Temps disponible</label><select class="v5-field" id="v5-quick-duration">${[5,15,30,60].map(n=>`<option value="${n}" ${num(data.quick.duration)===n?'selected':''}>${n} minutes</option>`).join('')}</select>
      <label class="v5-label" for="v5-quick-focus">Ma priorité</label><select class="v5-field" id="v5-quick-focus"><option value="weak" ${data.quick.focus==='weak'?'selected':''}>Mes points faibles</option><option value="new" ${data.quick.focus==='new'?'selected':''}>Découvrir une notion</option><option value="exam" ${data.quick.focus==='exam'?'selected':''}>M’entraîner à l’examen</option></select>
      ${button('Préparer ma séance →','quick','primary')}</section>
      <section class="v5-card"><div class="v5-heading"><h2>📅 Aujourd’hui</h2><span class="v5-small">${esc(formatDay(nowDay()))}</span></div>${today&&today.tasks.length?today.tasks.map(taskHtml).join(''):'<p class="v5-muted">Pas de séance planifiée aujourd’hui. Tu peux lancer une séance rapide à tout moment.</p>'}${button('Voir ma semaine →','pane','light','data-pane="plan"')}</section>
      <section class="v5-card"><h2>🧠 Apprentissage actif</h2><p>Les flashcards reprennent les bonnes réponses et explications des QCM. Les QRC proposent une autoévaluation guidée, sans notation automatique trompeuse.</p><div class="v5-inline">${button('Réviser des cartes','pane','light','data-pane="flash"')}${button('Rédiger une QRC','pane','light','data-pane="qrc"')}</div></section>
      <section class="v5-card"><h2>💾 Sauvegarder le Coach</h2><p>Planning, cartes révisées et brouillons QRC restent sur cet appareil. Ils ne sont pas encore synchronisés entre téléphones, même avec un compte Supabase.</p>
      <div class="v5-inline">${button('Exporter mon Coach','export','light')}<label class="v5-upload">Importer un Coach<input type="file" id="v5-import" accept="application/json,.json" aria-label="Importer une sauvegarde du Coach"></label></div></section>`;
  }
  function taskHtml(t,isQuick=false){const l=allLessons().find(x=>x.id===t.lessonId);if(!l)return '';
    const type={lesson:'Lire + QCM',flash:'Flashcards',qrc:'Réponse courte'}[t.type]||t.type;
    return `<article class="v5-task ${t.done?'done':''}"><input type="checkbox" id="v5-done-${esc(t.id)}" data-v5-check="${esc(t.id)}" data-v5-quick="${isQuick?'1':'0'}" ${t.done?'checked':''} aria-label="Terminer ${esc(type)} : ${esc(l.title)}"><div class="v5-task-body"><strong>${esc(type)} · ${esc(l.title)}</strong><span>${esc(l.subject)} · ${t.minutes} min · ${esc(l.semester)}</span></div>${button('Ouvrir',isQuick?'quick-task':'task','tiny','data-id="'+esc(t.id)+'"')}</article>`;
  }
  function planning(){const plan=getPlan();const done=plan.days.flatMap(x=>x.tasks).filter(t=>t.done).length,total=plan.days.flatMap(x=>x.tasks).length;
    return `${pills('Mon planning','Un programme hebdomadaire enregistré sur cet appareil, ajustable en fonction de ton emploi du temps.')}${tabbar()}
      <section class="v5-card"><h2>Mes disponibilités</h2><p>Choisis tes jours, le temps disponible et une matière prioritaire. Le programme propose des capsules encore peu maîtrisées.</p>
      <label class="v5-label">Jours de révision</label><div class="v5-days">${DAYS.map((x,i)=>`<label><input type="checkbox" class="v5-day" value="${i}" ${data.preferences.days.includes(i)?'checked':''}><span>${x.slice(0,3)}</span></label>`).join('')}</div>
      <label class="v5-label" for="v5-minutes">Temps prévu par jour</label><select class="v5-field" id="v5-minutes">${[5,15,30,45,60,90].map(n=>`<option value="${n}" ${num(data.preferences.minutes)===n?'selected':''}>${n} minutes</option>`).join('')}</select>
      <label class="v5-label" for="v5-priority">Matière prioritaire</label><select class="v5-field" id="v5-priority"><option value="Toutes">Toutes les matières</option>${subjects().map(s=>`<option value="${esc(s)}" ${data.preferences.subject===s?'selected':''}>${esc(s)}</option>`).join('')}</select>
      ${button('Enregistrer et recalculer ma semaine','save-pref','primary')}<p class="v5-small">Recalculer la semaine remplace les cases cochées du planning actuel. Les résultats de tes QCM, flashcards et QRC restent conservés.</p></section>
      <section class="v5-card"><div class="v5-heading"><h2>Semaine du ${esc(formatDay(weekKey()))}</h2><span class="v5-small">${done}/${total} terminées</span></div><div class="v5-progress"><span style="width:${total?Math.round(done/total*100):0}%"></span></div>
      ${plan.days.map(d=>`<div class="v5-daygroup"><div class="v5-daytitle"><b>${esc(d.name)}</b><span>${esc(formatDay(d.date))}</span></div>${d.tasks.length?d.tasks.map(taskHtml).join(''):'<p class="v5-muted">Pause / repos</p>'}</div>`).join('')}</section>`;
  }
  function flash(){const count=dueCards({subject:flashSubject}).length;const card=deck[pos];return `${pills('Flashcards','Révise les notions difficiles en les rappelant de mémoire avant de révéler la réponse.')}${tabbar()}
    <section class="v5-card"><label class="v5-label" for="v5-flash-subject">Filtrer par matière</label><select class="v5-field" id="v5-flash-subject"><option value="Toutes">Toutes les matières</option>${subjects().map(s=>`<option value="${esc(s)}" ${flashSubject===s?'selected':''}>${esc(s)}</option>`).join('')}</select>
    <p class="v5-muted">${count} cartes disponibles aujourd’hui dans ce filtre. Une carte revue sera reprogrammée pour un autre jour.</p>${button('Démarrer une session (10 cartes)','start-flash','primary')}</section>
    ${card?`<section class="v5-card"><div class="v5-heading"><span class="v5-badge">CARTE ${pos+1} / ${deck.length}</span><span class="v5-small">${esc(card.lesson.subject)}</span></div><div class="v5-flash" role="group" aria-label="Carte de révision"><p class="v5-small">${esc(card.lesson.title)}</p><h2>${esc(card.question)}</h2>${flipped?`<div class="v5-reveal"><b>Réponse attendue</b><p>${esc(card.answer)}</p>${card.reasons.length?`<p>${esc(card.reasons.join(' '))}</p>`:''}${card.pill?`<p class="v5-tip">${esc(card.pill)}</p>`:''}</div>`:`<p class="v5-muted">Essaie de répondre à voix haute ou dans ta tête, puis retourne la carte.</p>`}</div>
      ${!flipped?button('Afficher la réponse','flip','primary'):`<p class="v5-small">Comment as-tu retrouvé la réponse ?</p><div class="v5-inline">${button('À revoir','grade','bad','data-grade="again"')}${button('Bien','grade','light','data-grade="good"')}${button('Facile','grade','good','data-grade="easy"')}</div>`}</section>`:
      `<section class="v5-card"><h2>Une méthode fondée sur la répétition espacée</h2><p>Choisis « À revoir », « Bien » ou « Facile » après avoir retourné chaque carte. Tes prochaines révisions sont enregistrées localement.</p></section>`}
    <p class="v5-small">Les cartes sont construites à partir des QCM existants, et ne constituent pas des flashcards officielles du CNED.</p>`;
  }
  function qrc(){const l=qrcItem?.lesson,sec=qrcItem?.section;return `${pills('S’entraîner aux QRC','Rédige une réponse structurée puis compare-la au passage de référence. Autoévaluation uniquement.')}${tabbar()}
    <section class="v5-card"><label class="v5-label" for="v5-qrc-subject">Matière</label><select class="v5-field" id="v5-qrc-subject"><option value="Toutes">Toutes les matières</option>${subjects().map(s=>`<option value="${esc(s)}" ${flashSubject===s?'selected':''}>${esc(s)}</option>`).join('')}</select>${button('Proposer un sujet QRC','new-qrc','primary')}<p class="v5-small">Sujets d’entraînement créés à partir des sections des capsules, pas des sujets officiels ni une correction d’enseignant.</p></section>
    ${l&&sec?`<section class="v5-card"><span class="v5-badge">QRC · ${esc(l.semester)} · ${esc(l.subject)}</span><h2 class="v5-qrc-prompt">Expliquez « ${esc(sec.title)} » en définissant la notion, en décrivant ses mécanismes essentiels et en donnant un exemple.</h2><p class="v5-small">Durée indicative : 10 à 15 minutes. Répondez avec vos propres mots, sans consulter le cours.</p>
      <label class="v5-label" for="v5-qrc-answer">Ma réponse</label><textarea class="v5-field v5-textarea" id="v5-qrc-answer" maxlength="5000" placeholder="Je définis d'abord...">${esc(qrcAnswer)}</textarea>
      ${!qrcShow?button('Voir les éléments de correction','show-qrc','primary'):`<div class="v5-correction"><h3>Passage de référence</h3><p>${esc(sec.body||'')}</p>${sec.example?`<h3>Illustration</h3><p>${esc(sec.example)}</p>`:''}${l.takeaway?.length?`<h3>Points essentiels de la capsule</h3><ul>${l.takeaway.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}<p class="v5-small"><b>Source :</b> ${esc(l.source?.file||'Capsule AP')}${l.source?.pages?' · '+esc(l.source.pages):''}. Vérifie toujours le support original.</p></div>
      <h3>Je vérifie ma réponse</h3>${['J’ai défini la notion avec précision.','J’ai expliqué les mécanismes ou règles essentiels.','J’ai donné un exemple ou une illustration pertinente.'].map((x,i)=>`<label class="v5-check"><input type="checkbox" data-v5-criterion="${i}" ${criteria[i]?'checked':''}>${x}</label>`).join('')}
      ${button('Enregistrer mon autoévaluation','save-qrc','primary')}<p class="v5-small">Aucune IA ne note ta copie. Le résultat reflète uniquement ton autoévaluation.</p>`}</section>`:''}
    ${data.qrcHistory.length?`<section class="v5-card"><h2>Mes derniers entraînements</h2>${data.qrcHistory.slice(0,6).map(h=>`<div class="v5-history"><strong>${esc(h.title)}</strong><span>${esc(h.subject)} · ${h.score}/3 critères · ${esc(formatDay(h.date))}</span></div>`).join('')}</section>`:''}`;
  }
  function quick(){const minutes=num(data.quick.duration,15),focus=data.quick.focus;const a=pickLessons(data.preferences.subject);
    let chosen=a[0];if(focus==='weak')chosen=a.find(l=>weakCount(l.id)>0)||chosen;
    if(focus==='new')chosen=a.find(l=>!mainResults()[l.id])||chosen;
    if(!chosen){notification='Aucune capsule disponible pour cette sélection.';return}
    const tasks=[], add=(type,l,min)=>tasks.push({id:'quick-'+nowDay()+'-'+tasks.length+'-'+l.id,type,lessonId:l.id,minutes:min,done:false});
    const follow=a.find(l=>l.id!==chosen.id)||chosen;
    if(minutes===5)add('flash',chosen,5);
    else if(minutes===15)add(focus==='exam'?'qrc':'lesson',chosen,15);
    else if(minutes===30){add('lesson',chosen,15);add('flash',chosen,5);add('qrc',chosen,10)}
    else {add('lesson',chosen,15);add('flash',chosen,5);add('qrc',chosen,10);add('lesson',follow,15);add('qrc',follow,15)}
    data.quickSession={date:nowDay(),duration:minutes,focus,tasks};save();pane='session';render();
  }
  function session(){
    const ss=data.quickSession;
    if(!ss)return `${pills('Ma séance','Aucune séance rapide préparée.')}${tabbar()}${button('Retour au coach','pane','light','data-pane="overview"')}`;
    const done=ss.tasks.filter(t=>t.done).length;
    return `${pills('Ma séance de '+ss.duration+' minutes','Suis les étapes dans l’ordre. Tu peux revenir ici après une lecture, une session de cartes ou une QRC.')}${tabbar()}
      <section class="v5-card"><div class="v5-heading"><h2>${done} / ${ss.tasks.length} étapes terminées</h2><span class="v5-small">${esc(formatDay(ss.date))}</span></div>
      <div class="v5-progress"><span style="width:${Math.round(done/ss.tasks.length*100)}%"></span></div>
      ${ss.tasks.map(t=>taskHtml(t,true)).join('')}
      ${done===ss.tasks.length?'<p class="v5-note-success">Bravo, séance terminée !</p>':'<p class="v5-small">Coche manuellement chaque étape une fois terminée.</p>'}
      ${button('Nouvelle séance','pane','light','data-pane="overview"')}</section>`;
  }
  function beginFlash(lessonId=''){
    deck=dueCards({lessonId,subject:lessonId?'Toutes':flashSubject}).slice(0,10);pos=0;flipped=false;pane='flash';
    if(!deck.length){notification='Aucune carte due pour cette sélection. Choisis une autre matière ou reviens demain.'}
    render();
  }
  function beginQrc(lessonId=''){
    const a=lessonId?allLessons().filter(l=>l.id===lessonId):pickLessons(flashSubject).filter(l=>(l.sections||[]).length);
    if(!a.length){notification='Aucun sujet disponible.';render();return}
    const recent=new Set(data.qrcHistory.slice(0,20).map(x=>x.lessonId+'-'+x.sectionIndex));
    let found=null;
    for(const l of a){for(let i=0;i<l.sections.length;i++){if(!recent.has(l.id+'-'+i)){found={lesson:l,index:i,section:l.sections[i]};break}}if(found)break}
    if(!found){const l=a[0];found={lesson:l,index:0,section:l.sections[0]}}
    qrcItem=found;qrcAnswer='';qrcShow=false;criteria=[false,false,false];pane='qrc';render();
  }
  const body=()=>pane==='overview'?overview():pane==='plan'?planning():pane==='flash'?flash():pane==='qrc'?qrc():session();
  function render(){if(!host||!host.isConnected)return;host.innerHTML='<div class="v5-wrap">'+(notification?`<div class="v5-alert" role="status">${esc(notification)}</div>`:'')+body()+'</div>';notification=''}
  function handleClick(e){const b=e.target.closest('[data-v5]');if(!b||!host.contains(b))return;const a=b.dataset.v5;
    if(a==='pane'){pane=b.dataset.pane||'overview';render();return}
    if(a==='export'){
      const blob=new Blob([JSON.stringify({format:'capsule-ap-coach-v5',exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='capsule-ap-coach-sauvegarde.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);return;
    }
    if(a==='quick'){
      data.quick.duration=num(host.querySelector('#v5-quick-duration')?.value,15);
      data.quick.focus=host.querySelector('#v5-quick-focus')?.value||'weak';save();quick();return;
    }
    if(a==='save-pref'){
      const days=[...host.querySelectorAll('.v5-day:checked')].map(x=>num(x.value)).filter(x=>x>=0&&x<7);
      if(!days.length){notification='Sélectionne au moins un jour de révision.';render();return}
      const plan=data.plans[weekKey()];if(plan?.days?.some(d=>d.tasks.some(t=>t.done))&&!confirm('Recalculer le planning effacera les cases cochées de la semaine. Continuer ?'))return;
      data.preferences={days,minutes:num(host.querySelector('#v5-minutes')?.value,30),subject:host.querySelector('#v5-priority')?.value||'Toutes'};
      delete data.plans[weekKey()];planWeek(true);notification='Planning enregistré. Bonne révision !';render();return;
    }
    if(a==='task'||a==='quick-task'){
      const id=b.dataset.id;const t=(a==='quick-task'?data.quickSession?.tasks:getPlan().days.flatMap(d=>d.tasks))?.find(x=>x.id===id);
      if(!t)return;
      if(t.type==='lesson')app.openLesson?.(t.lessonId);
      else if(t.type==='flash')beginFlash(t.lessonId);
      else beginQrc(t.lessonId);
      return;
    }
    if(a==='start-flash'){flashSubject=host.querySelector('#v5-flash-subject')?.value||'Toutes';beginFlash();return}
    if(a==='flip'){flipped=true;render();return}
    if(a==='grade'){
      const c=deck[pos];if(!c||!flipped)return;
      const grade=b.dataset.grade,previous=data.reviews[c.id], prior=num(previous?.interval,0);
      const days=grade==='again'?1:grade==='good'?(prior>=3?Math.min(120,Math.round(prior*1.9)):3):prior>=7?Math.min(180,Math.round(prior*2.4)):7;
      data.reviews[c.id]={due:iso(addDays(asDate(nowDay()),days)),interval:days,last:nowDay(),grade,count:num(previous?.count)+1};save();pos++;flipped=false;
      if(pos>=deck.length){deck=[];pos=0;notification='Session terminée ! Tes prochaines révisions sont programmées.'}
      render();return;
    }
    if(a==='new-qrc'){flashSubject=host.querySelector('#v5-qrc-subject')?.value||'Toutes';beginQrc();return}
    if(a==='show-qrc'){qrcAnswer=host.querySelector('#v5-qrc-answer')?.value||'';qrcShow=true;render();return}
    if(a==='save-qrc'){
      if(!qrcItem)return;
      criteria=[...host.querySelectorAll('[data-v5-criterion]')].sort((a,b)=>num(a.dataset.v5Criterion)-num(b.dataset.v5Criterion)).map(e=>e.checked);
      data.qrcHistory.unshift({date:nowDay(),lessonId:qrcItem.lesson.id,sectionIndex:qrcItem.index,title:qrcItem.section.title,subject:qrcItem.lesson.subject,score:criteria.filter(Boolean).length,answer:qrcAnswer.slice(0,5000)});
      data.qrcHistory=data.qrcHistory.slice(0,40);save();notification='Autoévaluation enregistrée uniquement sur cet appareil.';qrcItem=null;qrcShow=false;render();return;
    }
  }
  function handleChange(e){const t=e.target;if(t.dataset.v5Check){let p=getPlan();const task=(t.dataset.v5Quick==='1'?data.quickSession?.tasks:p.days.flatMap(d=>d.tasks))?.find(x=>x.id===t.dataset.v5Check);if(task){task.done=t.checked;save();render()}}
    if(t.dataset.v5Criterion!==undefined){criteria[num(t.dataset.v5Criterion)]=t.checked}
    if(t.id==='v5-flash-subject')flashSubject=t.value;
    if(t.id==='v5-qrc-subject')flashSubject=t.value;
  }
  async function handleImport(e){
    if(e.target?.id!=='v5-import')return;
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>2_000_000)throw Error('Le fichier dépasse 2 Mo.');
      const parsed=JSON.parse(await file.text());
      if(parsed.format!=='capsule-ap-coach-v5'||!parsed.data||!parsed.data.preferences||!Array.isArray(parsed.data.preferences.days)||typeof parsed.data.reviews!=='object'||!Array.isArray(parsed.data.qrcHistory))throw Error('Format de sauvegarde non reconnu.');
      if(!confirm('Importer cette sauvegarde remplacera les données Coach enregistrées sur cet appareil. Continuer ?'))return;
      data={...defaultData(),...parsed.data};save();notification='Sauvegarde du Coach importée.';pane='overview';render();
    }catch(error){notification='Importation impossible : '+error.message;render()}
  }
  function mount(element,options={}){host=element;app=options;host.addEventListener('click',handleClick);host.addEventListener('change',handleChange);host.addEventListener('change',handleImport);render()}
  return {mount};
})();
