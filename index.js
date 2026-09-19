// PUSYA PET v1.0 — SillyTavern
(function(){
'use strict';

function ctx(){ return SillyTavern.getContext(); }

var _alive = true;
function alive(){ return _alive; }

function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function lsSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }

var MIN = 60000, HOUR = 3600000, DAY = 86400000;
function now(){ return Date.now(); }
function clamp(v){ return v < 0 ? 0 : (v > 100 ? 100 : v); }
function ri(n){ return Math.floor(Math.random()*n); }
function pick(a){ return (a && a.length) ? a[ri(a.length)] : ''; }
function djb2(s){ var h=5381,i; s=String(s||''); for(i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))|0; } return (h>>>0).toString(36); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function plain(s){
  s = String(s||'');
  s = s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ');
  return s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}
function ago(ts){
  if (!ts) return '';
  var m = Math.round((now()-ts)/60000);
  if (m < 1) return 'только что';
  if (m < 60) return m + ' мин';
  var h = Math.round(m/60);
  if (h < 24) return h + ' ч';
  var d = Math.round(h/24);
  return d + ' дн';
}
function since(ts){ var s = ago(ts); return s === 'только что' ? s : (s + ' назад'); }
function dayKey(t){ var d = new Date(t||now()); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }

var ARCH = {
  dog: { label:'собачьи', hint:'собака, волк, лиса', hunger:6.5, energy:5, clean:4.5, night:false, walk:'выгулять',
    words:['собак','пёс','пес','щен','кобел','сук','волк','волч','лис','шакал','койот','динго','хаск','овчар','корг','такс','доберман','дворня','гончая','пудел','шпиц','мопс','бульдог','ретривер','лайка','борза','терьер','спаниел','чихуа','акита','маламут','сенбернар','ротвейлер'],
    spot:['коврик у двери','место под столом','угол дивана','пол у батареи'],
    food:['варёная курица','кусок сыра','мозговая косточка','кусок колбасы'],
    greet:{ short:['поднимает голову и идёт навстречу','встаёт и не сводит глаз с хозяина'],
            long:['кидается навстречу так, будто хозяина не было год','скулит, крутится и не даёт пройти дальше порога'] },
    act:{
      hungry:['скребёт лапой пустую миску и не отходит от кухни','тычется мордой в руку и тянет в сторону еды','садится напротив и смотрит в упор, не моргая','подбирает что-то с пола и жуёт с вызовом'],
      bored:['приносит мяч и роняет его на ногу','утробно вздыхает и падает поперёк прохода','крутится у двери, стуча хвостом по стене','лезет мордой между вами и требует своё'],
      love:['кладёт голову на колено и замирает','пихает носом руку, пока её не положат на голову','приваливается боком всем весом','вылизывает запястье, не давая отнять руку'],
      mischief:['стягивает со стола то, что плохо лежит','грызёт обувь у порога, глядя прямо в глаза','сдирает покрывало и тащит его в угол','лает на пустой коридор и не унимается'],
      scared:['забивается под стол и рычит оттуда на дверь','прижимает уши и вжимается в ноги','вздрагивает от каждого звука и не отходит ни на шаг'],
      sleepy:['растягивается поперёк комнаты и вырубается','сопит у ног, дёргая лапами во сне'],
      sick:['лежит носом в пол и не поднимает головы','отворачивается от еды и тяжело дышит'],
      happy:['носится кругами и врезается в мебель','катается по полу, задрав лапы']
    }},
  cat: { label:'кошачьи', hint:'кошка, рысь, пантера', hunger:5.5, energy:4, clean:2.5, night:true, walk:'выпустить',
    words:['кош','кот','кис','рысь','пантер','леопард','тигр','лев','ягуар','пума','гепард','мейн-кун','сфинкс','сиам','british','бенгал'],
    spot:['подоконник','верх шкафа','колени хозяина','нагретое место у лампы'],
    food:['варёная рыба','сметана','сырое мясо','сливки'],
    greet:{ short:['выходит навстречу и трётся о ногу','поднимает голову и щурится, будто и не ждал'],
            long:['орёт всю дорогу до кухни и требует объяснений','сначала демонстративно отворачивается, а потом всё-таки лезет на руки'] },
    act:{
      hungry:['орёт над миской, требуя еды','запрыгивает на стол и сбрасывает всё лишнее','путается под ногами и подставляет бок, пока не покормят'],
      bored:['садится ровно туда, куда все смотрят','раскачивает лапой чашку у края стола','вклинивается между вами и укладывается','смотрит в стену и не двигается'],
      love:['бодает лбом в подбородок и урчит','запрыгивает на колени и топчется когтями','обвивает хвостом запястье и не отпускает'],
      mischief:['точит когти о самое дорогое в комнате','смахивает вещь со стола, не разрывая зрительного контакта','залезает туда, куда нельзя, и делает вид, что так и надо'],
      scared:['уходит под кровать и не выходит','шипит на дверь, распушив хвост','замирает и следит за углом комнаты'],
      sleepy:['сворачивается в тёплом углу','дремлет, дёргая ухом на каждый звук'],
      sick:['лежит вытянувшись и не реагирует на голос','не притрагивается к воде и жмурится'],
      happy:['гоняет невидимую добычу по всей комнате','срывается в бешеный галоп без причины']
    }},
  herb: { label:'травоядные', hint:'кролик, коза, олень', hunger:7, energy:4.5, clean:6, night:false, walk:'выпустить побегать',
    words:['крол','заяц','зайч','коз','овц','баран','олен','косул','лань','лошад','конь','пони','альпак','лам','капибар'],
    spot:['угол с сеном','тень под креслом','нора из пледа'],
    food:['морковка','сушёные яблоки','пучок петрушки','одуванчики'],
    greet:{ short:['подбегает и встаёт столбиком','тычется носом в ногу, проверяя, тот ли это человек'],
            long:['нарезает круги вокруг хозяина и не даёт сесть','долго обнюхивает, будто заново знакомится'] },
    act:{
      hungry:['грызёт угол мебели вместо еды','стучит лапой по полу и требует','лезет мордой в пакет с продуктами'],
      bored:['перекапывает подстилку и раскидывает её вокруг','нарезает круги под ногами','встаёт столбиком и смотрит в упор'],
      love:['утыкается носом в ладонь и замирает','ложится вплотную и вытягивает лапы','тычет мордой в ногу, требуя руки'],
      mischief:['перегрызает провод','подкапывает ковёр в углу','сгрызает край чего-то важного'],
      scared:['замирает столбиком и не дышит','срывается и уходит за мебель','громко бьёт задней лапой'],
      sleepy:['вытягивается на боку и отключается','дремлет с открытыми глазами'],
      sick:['сидит нахохлившись и не ест','скрипит зубами и не двигается'],
      happy:['подпрыгивает и крутится в воздухе','срывается в галоп через всю комнату']
    }},
  bird: { label:'птицы', hint:'попугай, ворон, сова', hunger:6, energy:4, clean:5, night:false, walk:'выпустить полетать',
    words:['попуг','птиц','ворон','сов','сокол','ястреб','орёл','орел','канарей','голуб','воробь','какаду','ара','амазон','корелл','неразлучник','страус','пингвин','чайк','филин'],
    spot:['верхняя жёрдочка','плечо хозяина','карниз'],
    food:['семечки','кусочек яблока','орех','кукуруза'],
    greet:{ short:['перелетает ближе и косит глазом','встряхивается и здоровается своим словом'],
            long:['орёт на всю комнату, требуя объяснить, где все были','садится на плечо и отказывается слезать'] },
    act:{
      hungry:['долбит клювом по кормушке','орёт, перекрывая любой разговор','пробует на клюв всё, до чего дотягивается'],
      bored:['копирует чужой голос в самый неподходящий момент','сбрасывает вниз мелкие предметы один за другим','перебирает лапами по плечу и лезет к лицу'],
      love:['перебирает клювом волосы у виска','прижимается к шее и тихо бормочет','садится на плечо и не даёт себя снять'],
      mischief:['повторяет вслух то, что говорить не стоило','раздирает клювом бумагу в клочья','щиплет за палец и отворачивается'],
      scared:['срывается с места и бьётся о стены','кричит и вжимается в жёрдочку','распушается и щёлкает клювом'],
      sleepy:['прячет голову под крыло','покачивается на одной лапе и затихает'],
      sick:['сидит нахохлившись, распушив перья','молчит, чего с ним не бывает'],
      happy:['носится по комнате и орёт от восторга','раскачивается и повторяет одно слово без конца']
    }},
  rodent: { label:'грызуны', hint:'хомяк, крыса, хорёк', hunger:8, energy:5.5, clean:6.5, night:true, walk:'выпустить побегать',
    words:['хомя','крыс','мыш','хорёк','хорек','хорьк','шиншилл','морская свинка','свинк','бурундук','белк','ёж','еж','дегу','песчанк','сурикат','ласк','куниц'],
    spot:['гнездо из подстилки','домик в углу','карман халата'],
    food:['семечки','кусочек огурца','орех','сушёная кукуруза'],
    greet:{ short:['высовывается из укрытия и принюхивается','лезет по рукаву проверять, кто пришёл'],
            long:['мечется по всей клетке, требуя выпустить немедленно','обнюхивает пальцы долго и подозрительно'] },
    act:{
      hungry:['гремит кормушкой на всю комнату','набивает щёки всем, что попадается','грызёт прутья без остановки'],
      bored:['крутит колесо так, что слышно за стеной','перетаскивает подстилку из угла в угол','ищет щель, чтобы сбежать'],
      love:['забирается в ладонь и утыкается носом','обнюхивает пальцы и замирает','карабкается по рукаву вверх'],
      mischief:['выбирается наружу и исчезает под мебелью','ворует что-то мелкое и прячет в углу','грызёт то, что грызть нельзя'],
      scared:['зарывается в подстилку с головой','замирает и не дышит','пищит и пятится в угол'],
      sleepy:['сворачивается в шар и отключается','спит так крепко, что кажется мёртвым'],
      sick:['лежит на боку и тяжело дышит','не выходит из угла и не ест'],
      happy:['носится кругами без остановки','скачет от избытка сил, набив щёки']
    }},
  slow: { label:'медлительные', hint:'черепаха, улитка, ленивец', hunger:2, energy:2, clean:2, night:false, walk:'вынести погреться',
    words:['черепах','улитк','ленивец','ленивц','краб','рак','ёрш','аксолотл','тритон','лягуш','жаб','моллюск'],
    spot:['тёплый камень','пятно света на полу','угол под лампой'],
    food:['лист салата','кусочек огурца','одуванчик','помидор'],
    greet:{ short:['разворачивается в сторону хозяина','высовывает голову и смотрит'],
            long:['упрямо ползёт навстречу через всю комнату','вылезает из укрытия, где просидел всё это время'] },
    act:{
      hungry:['ползёт к ногам и тычется в них','стучит панцирем о стенку','упрямо лезет в сторону кухни'],
      bored:['выбирается на середину комнаты и стоит там','пытается перелезть препятствие и застревает','скребёт когтями по полу'],
      love:['вытягивает шею под ладонь','подползает вплотную и замирает у ноги'],
      mischief:['опрокидывает миску с водой','заползает туда, откуда потом не достать'],
      scared:['втягивает голову и замирает','шипит и уходит в панцирь'],
      sleepy:['зарывается и не подаёт признаков жизни','дремлет, вытянув лапы'],
      sick:['не втягивает голову и вяло дышит','сидит с закрытыми глазами и не ест'],
      happy:['неожиданно бодро топает через всю комнату','тянется к теплу и вытягивается во весь рост']
    }},
  reptile: { label:'рептилии', hint:'змея, ящерица, дракон', hunger:1.2, energy:1.5, clean:1.5, night:false, walk:'дать размяться',
    words:['зме','пито','удав','полоз','кобр','гадюк','ящер','игуан','геккон','варан','хамелеон','дракон','вивер','крокодил','аллигатор','динозавр'],
    spot:['тёплый камень','ветка под лампой','складка ткани'],
    food:['крупная мышь','живой корм','кусок мяса'],
    greet:{ short:['поднимает голову и пробует воздух языком','перетекает ближе к стеклу'],
            long:['выбирается из укрытия и долго изучает хозяина','обвивает руку и не отпускает, будто проверяя, настоящая ли'] },
    act:{
      hungry:['выползает на открытое место и пробует воздух языком','сворачивается у дверцы и следит за движением','тычется мордой в стекло'],
      bored:['перетекает по руке и ищет, куда деться','обвивает запястье и стягивает кольца','идёт вдоль плинтуса, исследуя комнату'],
      love:['обвивает предплечье и затихает от тепла','заползает под рукав и устраивается там'],
      mischief:['выбирается наружу и пропадает','заползает в чужие вещи','сталкивает что-то с полки, протискиваясь мимо'],
      scared:['сворачивается в тугую спираль','шипит и уходит в укрытие'],
      sleepy:['лежит неподвижно, переваривая','замирает под корягой на сутки'],
      sick:['лежит вяло и не реагирует на прикосновение','отказывается от еды, глаза мутные'],
      happy:['вытягивается во всю длину и греется','обходит всё вокруг, пробуя воздух']
    }},
  other: { label:'свой зверь', hint:'всё остальное', hunger:5.5, energy:4, clean:4, night:false, walk:'выпустить',
    words:[],
    spot:['тёплый угол','место у двери','своя подстилка'],
    food:['любимое лакомство','кусок со стола'],
    greet:{ short:['идёт навстречу, едва услышав хозяина','поднимается и не сводит глаз'],
            long:['не отходит ни на шаг, будто боится, что снова уйдут','сначала держится в стороне, а потом всё-таки подходит'] },
    act:{
      hungry:['крутится там, где его обычно кормят, и не уходит','тычется в руку и уводит взгляд к пустой миске','не сводит глаз с еды, что бы вокруг ни происходило'],
      bored:['слоняется по комнате и не находит себе места','встревает ровно туда, где идёт разговор','возится с чем-то в углу, пока это не начинает мешать'],
      love:['прижимается и замирает, пока не отгонят','лезет под руку и подставляется','устраивается вплотную и не даёт встать'],
      mischief:['тянет к себе то, что трогать не следовало','лезет туда, куда его не пускают','роняет что-то на пол и делает вид, что не при чём'],
      scared:['вжимается в угол и следит за дверью','замирает и перестаёт дышать','пятится и не даёт себя тронуть'],
      sleepy:['сворачивается там, где теплее','затихает и перестаёт отзываться'],
      sick:['лежит и не поднимает головы','отворачивается от еды'],
      happy:['носится так, что задевает всё вокруг','не может усидеть на месте от радости']
    }}
};
var AR_ORDER = ['dog','cat','herb','bird','rodent','slow','reptile','other'];
function arch(p){ return ARCH[(p && p.arch)] || ARCH.other; }

function guessArch(kind){
  var s = String(kind||'').toLowerCase().replace(/ё/g,'е').trim();
  if (!s) return 'other';
  var best = '', bestLen = 0, k, i, w;
  for (k in ARCH) {
    if (!ARCH.hasOwnProperty(k)) continue;
    for (i=0;i<ARCH[k].words.length;i++) {
      w = ARCH[k].words[i].replace(/ё/g,'е');
      if (s.indexOf(w) !== -1 && w.length > bestLen) { best = k; bestLen = w.length; }
    }
  }
  return best || 'other';
}

var TEMPER = {
  calm:    { label:'спокойный', freq:0.55, mis:0.4, love:1.0, fear:0.8 },
  playful: { label:'игривый',   freq:1.35, mis:1.0, love:1.2, fear:0.6 },
  naughty: { label:'вредный',   freq:1.25, mis:2.0, love:0.6, fear:0.5 },
  shy:     { label:'пугливый',  freq:0.85, mis:0.3, love:0.8, fear:2.2 },
  clingy:  { label:'ласковый',  freq:1.15, mis:0.5, love:2.2, fear:1.0 }
};
var TP_ORDER = ['calm','playful','naughty','shy','clingy'];

var STAGE = {
  pup:   { label:'детёныш',   at:0,    hunger:1.35, energy:1.3,  sleep:1.25, mis:1.6,  freq:1.3 },
  teen:  { label:'подросток', at:72,   hunger:1.15, energy:1.15, sleep:1.0,  mis:1.35, freq:1.2 },
  adult: { label:'взрослый',  at:240,  hunger:1,    energy:1,    sleep:1,    mis:1,    freq:1 },
  old:   { label:'пожилой',   at:1440, hunger:0.8,  energy:0.75, sleep:1.3,  mis:0.5,  freq:0.7 }
};
var SG_ORDER = ['pup','teen','adult','old'];
function stageOf(p){
  var l = (p && p.lived) || 0, r = 'pup', i;
  for (i=0;i<SG_ORDER.length;i++) if (l >= STAGE[SG_ORDER[i]].at) r = SG_ORDER[i];
  return r;
}
function sg(p){ return STAGE[stageOf(p)] || STAGE.adult; }

var STAGE_ACT = {
  pup:  ['путается под ногами и заваливается на бок','пробует на зуб всё, до чего дотянулся','требует, чтобы им занялись прямо сейчас','влезает туда, откуда сам уже не выберется'],
  teen: ['проверяет, что будет, если сделать запрещённое','носится так, что сносит углы','делает вид, что не слышал, хотя слышал'],
  old:  ['долго устраивается на месте, прежде чем лечь','смотрит и не встаёт, хотя раньше бы уже бежал','вздыхает и остаётся лежать, где лежал']
};
var DAY_ACT = {
  morning: ['потягивается спросонья и трясёт головой','бродит кругами, пока все не проснутся','требует, чтобы день начался с него'],
  evening: ['крутится под ногами, чуя, что скоро на покой','устраивается поближе и не хочет оставаться один'],
  night:   ['возится в темноте, не давая уснуть','тихо ходит по комнате и замирает у постели']
};
var MOOD_ACT = {
  hurt: ['отворачивается и не идёт на зов','смотрит из угла и не подходит','ложится спиной и делает вид, что спит'],
  jeal: ['вклинивается ровно между вами','лезет под руку именно сейчас и не уходит','тычется настойчиво, требуя внимания себе'],
  joy:  ['не может усидеть на месте и заглядывает в глаза','крутится рядом, задевая всё подряд']
};
function partOfDay(t){
  var h = new Date(t || now()).getHours();
  return h < 5 ? 'night' : (h < 11 ? 'morning' : (h < 17 ? 'day' : (h < 23 ? 'evening' : 'night')));
}
var DAY_WORD = { morning:'утро', day:'день', evening:'вечер', night:'ночь' };

var SCENE_TRIGGERS = [
  { id:'thunder', words:['гром','молни','гроза','раскат','буря','ураган'], reaction:'scared',
    phrases:['вздрагивает от раската и прижимается к ногам','забивается в угол при звуке грозы','дрожит и жмётся к хозяину'] },
  { id:'food', words:['еду','обед','ужин','завтрак','перекус','готови','кухн','запах еды','стол накры'], reaction:'hungry',
    phrases:['вскидывается и бежит на запах еды','крутится у стола, надеясь на кусок','не сводит глаз с того, что на столе'] },
  { id:'door', words:['дверь','стук в дверь','звонок','вернул'], reaction:'bored',
    phrases:['срывается к двери проверять, кто пришёл','настораживает уши и смотрит на дверь','бежит к порогу раньше всех'] },
  { id:'fight', words:['удар','драк','ругань','ссор','замахну'], reaction:'scared',
    phrases:['забивается под мебель и не высовывается','вжимается в угол и дрожит','скулит и пятится от шума'] },
  { id:'affection', words:['поцелу','обним','прижал','нежно','близос','интим'], reaction:'jeal',
    phrases:['вклинивается между ними и требует внимания','лезет под руку ровно в этот момент','тычется настойчиво, не давая забыть о себе'] },
  { id:'sleep_scene', words:['спать','постель','кроват','ложись','засыпа','спокойной'], reaction:'sleepy',
    phrases:['зевает и устраивается рядом','тянется к тёплому месту и укладывается','сворачивается калачиком, готовясь ко сну'] },
  { id:'play_scene', words:['мяч ','игра ','играть','бегать','прыга','догонялк'], reaction:'happy',
    phrases:['оживляется и рвётся к делу','срывается с места, предвкушая игру','начинает носиться кругами от возбуждения'] }
];
function checkScene(p, text){
  if (!p || !text || sleeping(p) || p.sick) return false;
  text = text.toLowerCase().replace(/ё/g,'е');
  var tp = TEMPER[p.temper] || TEMPER.calm;
  for (var i=0;i<SCENE_TRIGGERS.length;i++){
    var tr = SCENE_TRIGGERS[i];
    if (p.cd && p.cd['sc_'+tr.id] && (now()-p.cd['sc_'+tr.id]) < 15*MIN) continue;
    for (var j=0;j<tr.words.length;j++){
      if (text.indexOf(tr.words[j].replace(/ё/g,'е')) !== -1){
        if (tr.reaction === 'scared' && Math.random() > tp.fear*0.5) continue;
        if (tr.reaction === 'jeal' && Math.random() > 0.6) continue;
        var phrase = pick(tr.phrases);
        p.now = { text:phrase, kind:tr.reaction, ts:now(), by:'scene' };
        p.cd = p.cd || {}; p.cd['sc_'+tr.id] = now();
        logAdd(p, '🎭 ' + phrase);
        queue(p, p.name + ' ' + phrase);
        if (tr.reaction === 'scared') p.mo.hurt = Math.min(30, p.mo.hurt+3);
        if (tr.reaction === 'jeal') p.mo.jeal = Math.min(30, p.mo.jeal+6);
        if (tr.reaction === 'happy') p.mo.joy = Math.min(30, p.mo.joy+5);
        memoAdd(p, phrase);
        touch(p);
        return true;
      }
    }
  }
  return false;
}

var OWNER = {
  me:   { label:'мой',       subj:'хозяин', head:function(d){ return 'с хозяином ' + d + ' дн.'; } },
  char: { label:'персонажа', subj:'гость',  head:function(d){ return 'питомец персонажа, тебя знает ' + d + ' дн.'; } },
  both: { label:'общий',     subj:'хозяин', head:function(d){ return 'общий питомец, ' + d + ' дн. в доме'; } }
};
var OW_ORDER = ['me','char','both'];
function owner(p){ return OWNER[(p && p.owner)] || OWNER.me; }

var TOGETHER = [
  { id:'new',   label:'только взяли', days:0,    bond:12 },
  { id:'weeks', label:'пара месяцев', days:60,   bond:28 },
  { id:'year',  label:'около года',   days:365,  bond:48 },
  { id:'long',  label:'много лет',    days:1460, bond:68 }
];
function togetherOf(id){
  for (var i=0;i<TOGETHER.length;i++) if (TOGETHER[i].id === id) return TOGETHER[i];
  return TOGETHER[0];
}
function togetherBucket(days){
  var r = TOGETHER[0];
  for (var i=0;i<TOGETHER.length;i++) if (days >= TOGETHER[i].days) r = TOGETHER[i];
  return r.id;
}

var BONDS = [
  { at:0,  label:'чужой' }, { at:20, label:'привык' }, { at:45, label:'друг' },
  { at:70, label:'предан' }, { at:90, label:'неразлучны' }
];
function bondLabel(v){ var r = BONDS[0]; for (var i=0;i<BONDS.length;i++) if (v >= BONDS[i].at) r = BONDS[i]; return r.label; }

var ICONS = ['🐕','🐈','🐇','🦜','🐹','🐢','🐍','🦊','🐺','🐻','🐼','🦝','🐿️','🦔','🦇','🐉','🦎','🦅','🦉','🐴','🐐','🦌','🐒','🦥','🐧','🐙','🦈','🐝','🕷️','🦂','🐲','👾'];

var DB_KEY = 'pusya_pet_v1', NICK_KEY = 'pusya_pet_nick';
var DB = null, CK = 'default', ckReady = false, loaded = false, saveT = null;

function defSkin(){ return { c1:'#8fbf7a', c2:'#e8dccd', c3:'#1d1317', alpha:96, blur:0 }; }
var SKINS = [
  { id:'coal',  name:'уголь',  c1:'#8fbf7a', c2:'#e8dccd', c3:'#1d1317', alpha:96, blur:0 },
  { id:'sand',  name:'песок',  c1:'#d0a95e', c2:'#f0e0c6', c3:'#1f1811', alpha:96, blur:0 },
  { id:'moss',  name:'мох',    c1:'#7fb08a', c2:'#dae8d6', c3:'#131a15', alpha:92, blur:7 },
  { id:'lilac', name:'сирень', c1:'#a892d4', c2:'#e4dcf0', c3:'#181422', alpha:92, blur:7 },
  { id:'ash',   name:'пепел',  c1:'#9aa7ad', c2:'#dee6ea', c3:'#14181a', alpha:88, blur:10 },
  { id:'wine',  name:'вино',   c1:'#c07a86', c2:'#f0d8dc', c3:'#1c1114', alpha:95, blur:4 },
  { id:'ink',   name:'чернила',c1:'#6f8fd0', c2:'#d8e2f2', c3:'#0f1420', alpha:94, blur:6 },
  { id:'amber', name:'янтарь', c1:'#e0913f', c2:'#f6dfc0', c3:'#241505', alpha:97, blur:0 }
];
function skin(){
  var s = cfg().skin;
  if (!s || !s.c1) s = cfg().skin = defSkin();
  return s;
}

function blankCfg(){
  return { speed:'normal', strict:true, pause:false, ring:true, face:'paw', glow:true, pos:null,
           mode:'full', ppos:null, skin: defSkin(),
           model:{ ep:'', model:'', key:'' }, sync:{ url:'', nick:'' } };
}
function blankDB(){ return { v:2, rev:0, pets:{}, cfg: blankCfg() }; }
function cfg(){ return DB.cfg; }

function host(){
  var c = ((ctx().extensionSettings || {}).pusya_pet) || {};
  return {
    inject: c.inject !== false,
    watcher: c.watcher !== false,
    every: Math.max(1, parseInt(c.every, 10) || 5)
  };
}

var OLD_SP = { dog:['собака','dog'], cat:['кошка','cat'], rabbit:['кролик','herb'], parrot:['попугай','bird'],
               hamster:['хомяк','rodent'], turtle:['черепаха','slow'], snake:['змея','reptile'] };
function upgrade(p, key){
  if (!p) return p;
  if (!p.ck && key) p.ck = key;
  if (p.del) return p;
  if (!p.arch) {
    var o = OLD_SP[p.sp] || ['питомец','other'];
    p.kind = p.kind || o[0];
    p.arch = o[1];
    p.archAuto = true;
  }
  if (!p.kind) p.kind = arch(p).label;
  if (!p.icon) p.icon = '🐾';
  if (p.night === undefined) p.night = null;
  if (typeof p.lived !== 'number') {
    p.lived = Math.max(0, (now() - (p.born || now())) / HOUR);
  }
  if (!OWNER[p.owner]) p.owner = 'me';
  if (p.known === undefined) p.known = false;
  if (!p.mo) p.mo = { joy:0, hurt:0, jeal:0 };
  if (!p.hab) p.hab = { spot:'', food:'', feeds:0 };
  if (!p.seen) p.seen = p.ts || now();
  if (!p.mts) p.mts = p.ts || now();
  if (!p.st) p.st = { hunger:80, energy:75, mood:70, clean:90, bond:12 };
  return p;
}
function upgradeAll(){
  if (!DB || !DB.pets) return;
  for (var k in DB.pets) if (DB.pets.hasOwnProperty(k)) upgrade(DB.pets[k], k);
}

function loadDB(cb){
  var local = null;
  try { local = JSON.parse(lsGet(DB_KEY) || 'null'); } catch(e){}
  DB = local || blankDB();
  if (!DB.pets) DB.pets = {};
  if (!DB.cfg) DB.cfg = blankCfg();
  var d = blankCfg(), k;
  for (k in d) if (DB.cfg[k] === undefined) DB.cfg[k] = d[k];
  if (!DB.cfg.model) DB.cfg.model = { ep:'', model:'', key:'' };
  if (!DB.cfg.sync)  DB.cfg.sync  = { url:'', nick:'' };
  if (!DB.cfg.skin || !DB.cfg.skin.c1) DB.cfg.skin = defSkin();
  upgradeAll();
  prune();
  if (!syncOn()) {
    var savedNick = lsGet(NICK_KEY) || '';
    if (savedNick) { sync().nick = savedNick; persist(); }
  }
  loaded = true;
  if (cb) cb();
}

function save(){
  if (!loaded) return;
  if (saveT) clearTimeout(saveT);
  saveT = setTimeout(saveNow, 700);
}
function saveNow(){
  if (!loaded) return;
  if (saveT) { clearTimeout(saveT); saveT = null; }
  DB.rev = (DB.rev || 0) + 1;
  DB.ts = now();
  persist();
  cloudLater();
}
function saveSoft(){
  if (!loaded) return;
  persist();
}
function persist(){
  var s = '';
  try { s = JSON.stringify(DB); } catch(e){ return; }
  lsSet(DB_KEY, s);
  var nick = String((DB.cfg && DB.cfg.sync && DB.cfg.sync.nick) || '').trim();
  if (nick) lsSet(NICK_KEY, nick);
}

function fullModel(m){ return !!(m && m.ep && m.model && m.key); }
function mergeCfg(win, lose){
  if (!win) return lose || blankCfg();
  if (!lose) return win;
  for (var k in lose) {
    if (!lose.hasOwnProperty(k)) continue;
    if (win[k] === undefined || win[k] === null || win[k] === '') win[k] = lose[k];
  }
  if (!fullModel(win.model) && fullModel(lose.model)) win.model = lose.model;
  if ((!win.sync || !win.sync.nick) && lose.sync && lose.sync.nick) win.sync = lose.sync;
  if ((!win.skin || !win.skin.c1) && lose.skin && lose.skin.c1) win.skin = lose.skin;
  return win;
}
function touch(p){ if (p) p.mts = now(); }

function prune(){
  if (!DB || !DB.pets) return;
  var t = now(), k, p, id;
  for (k in DB.pets) {
    if (!DB.pets.hasOwnProperty(k)) continue;
    p = DB.pets[k];
    if (!p) { delete DB.pets[k]; continue; }
    if (p.del && (t - (p.ts||0)) > 30*DAY) { delete DB.pets[k]; continue; }
    if (p.cd) for (id in p.cd) if (p.cd.hasOwnProperty(id) && (t - p.cd[id]) > DAY) delete p.cd[id];
    if (p.log && p.log.length > 40) p.log.length = 40;
  }
}

function petAt(id){
  var p = (DB && DB.pets) ? DB.pets[id] : null;
  return (p && !p.del) ? p : null;
}
function petsOf(ck){
  var out = [], k, p;
  ck = ck || CK;
  if (!DB || !DB.pets) return out;
  for (k in DB.pets) {
    if (!DB.pets.hasOwnProperty(k)) continue;
    p = DB.pets[k];
    if (!p || p.del) continue;
    if ((p.ck || k) === ck) { p._id = k; out.push(p); }
  }
  out.sort(function(a,b){ return (a.born||0) - (b.born||0); });
  return out;
}
function petCountOf(ck){ return petsOf(ck).length; }
function actKey(){ var a = cfg().act || (cfg().act = {}); return a; }
function petOf(){
  var list = petsOf(CK);
  if (!list.length) return null;
  var want = actKey()[CK], i;
  for (i=0;i<list.length;i++) if (list[i]._id === want) return list[i];
  return list[0];
}
function setAct(id){ actKey()[CK] = id; }
function newId(name){
  if (!DB.pets[CK]) return CK;
  var base = CK + '~' + djb2(String(name||'') + now() + Math.random());
  while (DB.pets[base]) base += 'x';
  return base;
}

var CLOUD = { state:'off', err:'', pulled:false, dirty:false, dirtyAt:0, busy:false, last:0, taken:false, nick:'' };
var pushT = null, retryT = null;
var HOME_URL = 'https://pussyagerl.duckdns.org';

function sync(){ return cfg().sync || (cfg().sync = { url:'', nick:'' }); }
function syncHost(){ return String(sync().url || '').trim() || HOME_URL; }
function syncOn(){ return !!String(sync().nick||'').trim(); }
function syncUrl(extra){
  var u = syncHost().replace(/\/+$/,'');
  if (!/\/api\/pet$/.test(u)) u += '/api/pet';
  return u + '?nick=' + encodeURIComponent(String(sync().nick||'').trim()) + '&plugin=pets' + (extra || '');
}

// ── HEARTBEAT ──
(function startHeartbeat(){
  function sendHB(){
    try {
      var nick = String(sync().nick||'').trim();
      if (!nick) return;
      fetch(HOME_URL + '/api/heartbeat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ plugin:'pets', nick:nick, version:'1.0.0', data:{} })
      }).catch(function(){});
    } catch(e){}
  }
  sendHB();
  setInterval(sendHB, 5*60*1000);
})();

function snapshot(){
  var c = {}, k;
  for (k in DB.cfg) if (DB.cfg.hasOwnProperty(k) && k !== 'sync' && k !== 'pos' && k !== 'ppos' && k !== 'model') c[k] = DB.cfg[k];
  return { v:2, rev: DB.rev || 0, ts: now(), pets: DB.pets, cfg: c };
}
function petCount(o){ try { return o && o.pets ? Object.keys(o.pets).length : 0; } catch(e){ return 0; } }
function mts(p){ return (p && (p.mts || p.ts)) || 0; }

function mergePets(mine, theirs){
  var out = {}, k;
  for (k in theirs) if (theirs.hasOwnProperty(k)) out[k] = theirs[k];
  for (k in mine) {
    if (!mine.hasOwnProperty(k)) continue;
    if (!out[k] || mts(mine[k]) >= mts(out[k])) out[k] = mine[k];
  }
  return out;
}

function adopt(data, force){
  if (!data || !data.pets) return false;
  DB.pets = force ? data.pets : mergePets(DB.pets || {}, data.pets);
  if (data.cfg) {
    var keepSync = DB.cfg.sync, keepPos = DB.cfg.pos, keepPP = DB.cfg.ppos, keepModel = DB.cfg.model, k;
    for (k in data.cfg) if (data.cfg.hasOwnProperty(k)) DB.cfg[k] = data.cfg[k];
    DB.cfg.sync = keepSync; DB.cfg.pos = keepPos; DB.cfg.ppos = keepPP; DB.cfg.model = keepModel;
  }
  DB.rev = data.rev || 0;
  upgradeAll();
  persist();
  return true;
}

function cloudFetch(url, opts, cb){
  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var tid = ctrl ? setTimeout(function(){ ctrl.abort(); }, 20000) : null;
  opts = opts || {};
  if (ctrl) opts.signal = ctrl.signal;
  fetch(url, opts).then(function(r){
    return r.text().then(function(t){
      if (tid) clearTimeout(tid);
      var j = null; try { j = JSON.parse(t); } catch(e){}
      if (!j) { cb(new Error('сервер ответил не JSON — проверь адрес'), null, r.status); return; }
      cb(null, j, r.status);
    });
  }).catch(function(e){
    if (tid) clearTimeout(tid);
    cb(new Error((e && e.name === 'AbortError') ? 'таймаут: сервер молчит' : ((e && e.message) || 'сеть недоступна')), null, 0);
  });
}

function cloudPull(cb, force){
  if (!syncOn()) { if (cb) cb(false); return; }
  CLOUD.busy = true; CLOUD.err = ''; render();
  cloudFetch(syncUrl(), { method:'GET' }, function(err, j){
    CLOUD.busy = false;
    if (err || !j || !j.ok) {
      CLOUD.state = 'err'; CLOUD.err = err ? err.message : ((j && j.error) || 'сервер отказал');
      render(); if (cb) cb(false); return;
    }
    CLOUD.state = 'ok'; CLOUD.err = ''; CLOUD.last = now(); CLOUD.nick = String(sync().nick||'').trim();
    var cloudRev = j.rev || 0, mine = DB.rev || 0;
    if (j.data && (force || cloudRev > mine || (petCount(j.data) > petCount(DB) && cloudRev >= mine))) adopt(j.data, force);
    CLOUD.pulled = true;
    render();
    if (CLOUD.dirty) cloudPush();
    if (cb) cb(true);
  });
}

function cloudPush(){
  if (!syncOn()) return;
  if (!CLOUD.pulled) { CLOUD.dirty = true; CLOUD.dirtyAt = CLOUD.dirtyAt || now(); return; }
  if (CLOUD.busy) { CLOUD.dirty = true; CLOUD.dirtyAt = CLOUD.dirtyAt || now(); return; }
  CLOUD.busy = true;
  var body = JSON.stringify(snapshot());
  cloudFetch(syncUrl(), { method:'POST', headers:{ 'Content-Type':'application/json' }, body: body }, function(err, j, code){
    CLOUD.busy = false;
    if (!err && j && j.ok) {
      CLOUD.dirty = false; CLOUD.dirtyAt = 0; CLOUD.state = 'ok'; CLOUD.err = ''; CLOUD.last = now();
      render(); return;
    }
    if (code === 409 && j && j.data) {
      adopt(j.data);
      DB.rev = (j.data.rev || 0) + 1;
      persist();
      CLOUD.dirty = true; CLOUD.dirtyAt = CLOUD.dirtyAt || now(); CLOUD.state = 'ok'; CLOUD.err = '';
      render(); cloudRetry(4000); return;
    }
    CLOUD.dirty = true; CLOUD.dirtyAt = CLOUD.dirtyAt || now(); CLOUD.state = 'err';
    CLOUD.err = err ? err.message : ((j && j.error) || 'сервер отказал');
    render(); cloudRetry(30000);
  });
}
function cloudRetry(ms){
  if (retryT) clearTimeout(retryT);
  retryT = setTimeout(function(){ retryT = null; if (alive() && CLOUD.dirty) cloudPush(); }, ms || 30000);
}
function cloudLater(){
  if (!syncOn()) return;
  CLOUD.dirty = true; CLOUD.dirtyAt = CLOUD.dirtyAt || now();
  if (pushT) clearTimeout(pushT);
  pushT = setTimeout(function(){ pushT = null; cloudPush(); }, 4000);
}
function cloudBeacon(){
  if (!syncOn() || !CLOUD.pulled || !CLOUD.dirty) return;
  try {
    var b = new Blob([JSON.stringify(snapshot())], { type:'application/json' });
    if (navigator && navigator.sendBeacon) navigator.sendBeacon(syncUrl(), b);
  } catch(e){}
}

function cloudCheck(nick, cb){
  var s = sync(), keep = s.nick;
  s.nick = nick;
  var url = syncUrl('&op=check');
  s.nick = keep;
  cloudFetch(url, { method:'GET' }, function(err, j){ cb(err, j); });
}
function cloudClaim(nick, cb){
  var s = sync(), keep = s.nick;
  s.nick = nick;
  CLOUD.busy = true; render();
  cloudFetch(syncUrl('&claim=1'), { method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(snapshot()) }, function(err, j, code){
    CLOUD.busy = false;
    if (!err && j && j.ok) {
      CLOUD.state = 'ok'; CLOUD.err = ''; CLOUD.pulled = true; CLOUD.dirty = false;
      CLOUD.last = now(); CLOUD.taken = false; CLOUD.dirtyAt = 0; CLOUD.nick = String(nick||'').trim();
      saveNow(); render(); cb(null); return;
    }
    s.nick = keep;
    CLOUD.taken = !!(j && j.taken) || code === 409;
    CLOUD.state = 'err';
    CLOUD.err = err ? err.message : ((j && j.error) || 'не вышло занять ник');
    render(); cb(new Error(CLOUD.err));
  });
}

function newPet(o){
  var t = now(), a = o.arch || guessArch(o.kind);
  var start = STAGE[o.stage] ? o.stage : 'adult';
  var tg = togetherOf(o.together);
  return {
    known: !!o.known,
    owner: OWNER[o.owner] ? o.owner : 'me',
    name: o.name || 'Питомец',
    kind: o.kind || ARCH[a].label,
    arch: a,
    archAuto: o.archAuto !== false,
    temper: o.temper || 'playful',
    breed: o.breed || '', age: o.age || '', desc: o.desc || '',
    icon: o.icon || '🐾',
    night: (o.night === undefined) ? null : o.night,
    born: t - tg.days*DAY, ts: t, mts: t, seen: t, lastCare: t,
    lived: STAGE[start].at,
    sick: false, sickSince: 0,
    st: { hunger: 80, energy: 75, mood: 70, clean: 90, bond: tg.bond },
    mo: { joy: 0, hurt: 0, jeal: 0 },
    hab: { spot:'', food:'', feeds:0 },
    cd: {},
    bondDay: dayKey(t), bondGain: 0,
    now: null,
    pend: [],
    log: [],
    slept: false
  };
}

function speedMul(){ var s = cfg().speed; return s === 'slow' ? 0.5 : (s === 'fast' ? 2 : 1); }

function nocturnal(p){
  if (p && p.night !== null && p.night !== undefined) return !!p.night;
  return !!arch(p).night;
}
function sleepHour(t, night){
  var h = new Date(t || now()).getHours();
  return night ? (h >= 8 && h < 18) : (h >= 23 || h < 7);
}
function sleeping(p, t){
  if (!p) return false;
  t = t || now();
  if (p.wake && t < p.wake) return false;
  var e = p.st.energy, s = sg(p).sleep;
  if (e < Math.min(97, (p.slept ? 45 : 18) * s)) return true;
  return sleepHour(t, nocturnal(p)) && e < Math.min(97, (p.slept ? 92 : 85) * s);
}
function baseMood(p){
  var s = p.st, m = p.mo || { joy:0, hurt:0, jeal:0 };
  var v = s.hunger*0.34 + s.energy*0.2 + s.clean*0.16 + s.bond*0.3;
  v += m.joy*0.8 - m.hurt*1.0 - m.jeal*0.6;
  if (p.sick) v -= 35;
  return clamp(v);
}

function step(p, dtH, atTs){
  var a = arch(p), k = speedMul(), g = sg(p);
  var sl = sleeping(p, atTs);
  p.slept = sl;
  p.lived += dtH * k;
  p.st.hunger = clamp(p.st.hunger - a.hunger*dtH*k*g.hunger*(sl ? 0.45 : 1));
  p.st.energy = clamp(p.st.energy + (sl ? 13*dtH*k : -a.energy*dtH*k*g.energy));
  p.st.clean  = clamp(p.st.clean  - a.clean*dtH*k*0.55);
  var m = p.mo;
  m.joy  *= Math.pow(0.5, dtH/6);
  m.hurt *= Math.pow(0.5, dtH/10);
  m.jeal *= Math.pow(0.5, dtH/3);
  if (m.joy  < 0.05) m.joy  = 0;
  if (m.hurt < 0.05) m.hurt = 0;
  if (m.jeal < 0.05) m.jeal = 0;
  var idleH = (atTs - (p.lastCare||atTs)) / 3600000;
  if (idleH > 14) {
    p.st.bond = clamp(p.st.bond - 0.5*dtH*k);
    m.hurt = Math.min(30, m.hurt + 0.6*dtH*k);
  }
  var target = baseMood(p);
  p.st.mood = clamp(p.st.mood + (target - p.st.mood) * Math.min(1, dtH*0.4*k));
}

function tick(){
  var list = petsOf(CK), ev = false, i;
  for (i=0;i<list.length;i++) if (tickOne(list[i])) ev = true;
  return ev;
}
function tickOne(p){
  if (!p) return false;
  var t = now();
  if (cfg().pause) { p.ts = t; return false; }
  var from = p.ts || t;
  if (t - from <= 1500) { p.ts = t; return false; }
  var CAP = 96*HOUR;
  if (t - from > CAP) from = t - CAP;
  var wasSleeping = p.slept, wasStage = stageOf(p), event = false;
  var STEP = 30*60000, cur = from;
  while (cur < t) {
    var nxt = Math.min(cur + STEP, t);
    step(p, (nxt - cur)/3600000, nxt);
    cur = nxt;
  }
  var sl = p.slept;
  var idleH = (t - (p.lastCare||t)) / 3600000;
  if (cfg().strict && !p.sick) {
    if ((p.st.hunger < 6 || p.st.clean < 6) && idleH > 20) {
      p.sick = true; p.sickSince = t;
      p.mo.hurt = Math.min(30, p.mo.hurt + 6);
      logAdd(p, '🤒 ' + p.name + ' заболел', true);
      queue(p, p.name + ' заболел: вялый, отказывается от еды');
      touch(p); event = true;
    }
  }
  if (p.sick) {
    var healed = false;
    if (p.treated && (t - p.treated) > 3*HOUR && p.st.hunger > 40 && p.st.clean > 40) healed = true;
    else if (p.st.hunger > 60 && p.st.clean > 60 && (t - p.sickSince) > 10*HOUR) healed = true;
    if (healed) {
      p.sick = false; p.treated = 0;
      logAdd(p, '✨ ' + p.name + ' пошёл на поправку', true);
      touch(p); event = true;
    }
  }
  var nowStage = stageOf(p);
  if (nowStage !== wasStage) {
    logAdd(p, '🌱 ' + p.name + ' теперь ' + STAGE[nowStage].label, true);
    queue(p, p.name + ' заметно повзрослел: теперь это ' + STAGE[nowStage].label);
    p.now = { text: pick(STAGE_ACT[nowStage] || arch(p).act.happy), kind:'grow', ts: t };
    touch(p); event = true;
  }
  if (!p.hab.spot && p.lived > 48) { p.hab.spot = pick(arch(p).spot); touch(p); }
  if (wasSleeping && !sl) { noteWake(p); event = true; }
  var awayH = (t - (p.seen || t)) / 3600000;
  if (awayH > 6) {
    if (sl) { p.greetDue = awayH; }
    else { greet(p, awayH); event = true; }
    p.seen = t;
  }
  p.ts = t;
  if (p.now && (t - p.now.ts) > 25*MIN) p.now = null;
  return event;
}

function noteWake(p){
  if (p.greetDue) { var a = p.greetDue; p.greetDue = 0; greet(p, a, true); return; }
  var pod = partOfDay();
  var pool = (pod === 'morning' && DAY_ACT.morning.length) ? DAY_ACT.morning : arch(p).act.happy;
  p.now = { text: 'просыпается и ' + pick(pool), kind: 'wake', ts: now() };
  logAdd(p, '🐾 проснулся');
  touch(p);
}
function greet(p, awayH, woke){
  var g = arch(p).greet;
  var text = p.sick ? pick(arch(p).act.sick) : pick(awayH > 30 ? g.long : g.short);
  p.now = { text: (woke ? 'просыпается и ' : '') + text, kind: 'greet', ts: now() };
  queue(p, p.name + (p.sick
    ? ' с трудом поднимает голову навстречу вернувшемуся хозяину'
    : ' встречает хозяина после долгого отсутствия'));
  logAdd(p, '🐾 встретил после ' + Math.round(awayH) + ' ч');
  if (!p.sick) p.mo.joy = Math.min(30, p.mo.joy + 10);
  p.mo.hurt = Math.max(0, p.mo.hurt - 3);
  touch(p);
}
function logAdd(p, text, keep, care, w){
  p.log = p.log || [];
  p.log.unshift({ t: now(), s: text, k: keep ? 1 : 0, c: care ? 1 : 0, w: w || '' });
  if (p.log.length > 40) p.log.length = 40;
}
function queue(p, text){
  p.pend = p.pend || [];
  p.pend.push({ text: text, ts: now() });
  if (p.pend.length > 4) p.pend.shift();
}
function lastCare(p){
  var l = (p && p.log) || [];
  for (var i=0;i<l.length;i++) if (l[i].c) return l[i];
  return null;
}

function topNeed(p){
  if (p.sick) return 'sick';
  if (sleeping(p)) return 'sleepy';
  var s = p.st, m = p.mo, tp = TEMPER[p.temper] || TEMPER.calm, g = sg(p);
  var w = [
    ['hungry',   (100 - s.hunger) * 1.15],
    ['bored',    (100 - s.mood) * 0.75 + s.energy*0.35],
    ['love',     (s.bond*0.5 + (100-s.mood)*0.3) * tp.love],
    ['mischief', (s.energy*0.5 + (100-s.mood)*0.2) * tp.mis * g.mis],
    ['scared',   ((100 - s.mood) * 0.35) * tp.fear]
  ];
  if (s.clean < 25) w.push(['mischief', (100 - s.clean)*0.8]);
  if (m.hurt > 8)   w.push(['hurt', m.hurt*2.6]);
  if (m.jeal > 8)   w.push(['jeal', m.jeal*2.8]);
  if (m.joy  > 10)  w.push(['joy',  m.joy*1.8]);
  w.sort(function(a,b){ return b[1]-a[1]; });
  return (Math.random() < 0.72 || !w[1]) ? w[0][0] : w[1][0];
}
function phraseFor(p, need){
  if (MOOD_ACT[need]) return pick(MOOD_ACT[need]);
  var a = arch(p), stg = stageOf(p), pod = partOfDay();
  if (STAGE_ACT[stg] && Math.random() < 0.28) return pick(STAGE_ACT[stg]);
  if (DAY_ACT[pod] && Math.random() < 0.2) return pick(DAY_ACT[pod]);
  return pick(a.act[need] || a.act.bored);
}

function pickActor(){
  var list = petsOf(CK), best = null, bs = 1e9, i, s;
  for (i=0;i<list.length;i++) {
    if (sleeping(list[i])) continue;
    s = Math.min(list[i].st.hunger, list[i].st.mood);
    if (s < bs) { bs = s; best = list[i]; }
  }
  return best;
}
function actSelf(force, only){
  var p = only || pickActor();
  if (!p) return false;
  if (sleeping(p)) return false;
  var tp = TEMPER[p.temper] || TEMPER.calm, s = p.st;
  var urge = (100 - Math.min(s.hunger, s.mood)) / 100;
  var chance = (0.14 + urge*0.42) * tp.freq * sg(p).freq;
  if (p.sick) chance += 0.15;
  if (!force && Math.random() > chance) return false;
  var need = topNeed(p);
  var text = phraseFor(p, need);
  if (!text) return false;
  p.now = { text: text, kind: need, ts: now() };
  logAdd(p, '🐾 ' + text);
  if (need === 'mischief') p.st.clean = clamp(p.st.clean - 4);
  if (need === 'bored')    p.st.mood  = clamp(p.st.mood - 2);
  touch(p); save();
  return true;
}

var PET_INTERACT = [
  '{name} обнюхивает {other} и отходит',
  '{name} тычется носом в {other}',
  '{name} ложится рядом с {other}',
  '{name} пытается затеять возню с {other}',
  '{name} смотрит на {other} и не двигается',
  '{name} подходит к {other} и трётся боком',
  '{name} задирает {other}, но тут же отступает',
  '{name} крадётся к {other} и замирает',
  '{name} перешагивает через {other} и идёт дальше',
  '{name} устраивается спиной к {other}',
  '{name} отпихивает {other} от миски',
  '{name} пристально следит за {other} издалека'
];
function interactPets(){
  var list = petsOf(CK).filter(function(p){ return !sleeping(p) && !p.sick; });
  if (list.length < 2) return false;
  if (Math.random() > 0.25) return false;
  var ai = ri(list.length), bi;
  do { bi = ri(list.length); } while (bi === ai);
  var a = list[ai], b = list[bi];
  if (a.cd && a.cd['interact'] && (now()-a.cd['interact']) < 20*MIN) return false;
  var phrase = pick(PET_INTERACT).replace(/\{name\}/g, a.name).replace(/\{other\}/g, b.name);
  a.now = { text:phrase, kind:'interact', ts:now() };
  a.cd = a.cd || {}; a.cd['interact'] = now();
  logAdd(a, '🐾 ' + phrase);
  queue(a, phrase);
  b.mo.jeal = Math.min(30, b.mo.jeal + 2);
  memoAdd(a, phrase);
  touch(a);
  return true;
}

var W = { busy:false, err:'', last:0, ok:0 };
var GEN_TIMEOUT = 60000;

function cleanAscii(s){ return String(s||'').replace(/[​-‍﻿ ]/g,'').trim(); }
function modelCfg(){ var m = (cfg() && cfg().model) || {}; return { ep:cleanAscii(m.ep), model:cleanAscii(m.model), key:cleanAscii(m.key) }; }
function modelReady(){ var c = modelCfg(); return !!(c.ep && c.model && c.key); }
function canWatch(){ return true; }
function modelEndpoint(ep){ ep = cleanAscii(ep).replace(/\/+$/,''); if (!/\/chat\/completions$/.test(ep)) ep += '/chat/completions'; return ep; }
function stripReasoning(t){ return String(t||'').replace(/<think[\s\S]*?<\/think>/gi,'').replace(/<\/?reasoning>/gi,'').trim(); }

function modelAsk(prompt, sys){
  var c = modelCfg();
  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var tid = ctrl ? setTimeout(function(){ ctrl.abort(); }, GEN_TIMEOUT) : null;
  var opts = { method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + c.key },
    body: JSON.stringify({ model:c.model, messages:[{role:'system',content:sys},{role:'user',content:prompt}],
                           temperature:0.6, max_tokens:220 }) };
  if (ctrl) opts.signal = ctrl.signal;
  return fetch(modelEndpoint(c.ep), opts).then(function(r){
    return r.text().then(function(t){
      if (tid) clearTimeout(tid);
      if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + t.replace(/\s+/g,' ').slice(0,120));
      if (/^\s*<|<html|doctype/i.test(t)) throw new Error('эндпоинт вернул страницу — проверь адрес (обычно …/v1)');
      var j; try { j = JSON.parse(t); } catch(e){ throw new Error('ответ не-JSON — проверь адрес и ключ'); }
      var ch0 = j && j.choices && j.choices[0], m0 = ch0 && ch0.message;
      var out = m0 && m0.content;
      if (!out && m0 && (m0.reasoning_content || m0.reasoning)) throw new Error('модель ушла в рассуждения — возьми не-thinking модель');
      if (!out) throw new Error('пустой ответ модели');
      return String(out).trim();
    });
  }).catch(function(e){
    if (tid) clearTimeout(tid);
    if (e && e.name === 'AbortError') throw new Error('таймаут: модель молчала ' + Math.round(GEN_TIMEOUT/1000) + 'с');
    throw e;
  });
}
function genText(prompt, sys){
  if (modelReady()) return modelAsk(prompt, sys).then(stripReasoning);
  var c = ctx();
  if (typeof c.generateRaw !== 'function') return Promise.reject(new Error('обнови SillyTavern или настрой свою модель'));
  return c.generateRaw(prompt, null, false, false, sys, true).then(function(r){
    var t = stripReasoning(String(r || ''));
    if (!t) throw new Error('модель не вернула ответ');
    return t;
  });
}

function recent(n){
  try {
    var chat = ctx().chat;
    if (!chat || !chat.length) return Promise.resolve([]);
    var tail = chat.slice(-n);
    var result = tail.map(function(m, i){
      var mine = m.is_user;
      var txt = plain(m.mes || '');
      if (!txt) return '';
      var lim = (i >= tail.length - 2) ? 900 : 220;
      return (mine ? 'Хозяин' : (m.name || 'Персонаж')) + ': ' + txt.slice(0, lim);
    }).filter(Boolean);
    return Promise.resolve(result);
  } catch(e){ return Promise.resolve([]); }
}

var ECHO_RE = /(мы должны|я должен|должна ответить|нужно ответить|следует ответить|отвечу|как (?:ассистент|модель|ии)|одним (?:коротким )?предложением|третье лицо|третьем лице|настоящем времени|без кавычек|без уменьшительных|без пояснений|без реплик|инструкц|промпт|prompt|system|assistant)/i;
function watchReject(t){
  if (!t) return 'модель вернула пустоту';
  if (t.length < 8) return 'ответ слишком короткий';
  if (t.length > 260) return 'ответ слишком длинный';
  if (t.length < 40 && !/[.!?…]$/.test(t)) return 'модель оборвала фразу';
  if (ECHO_RE.test(t)) return 'модель пересказала инструкцию, а не показала животное';
  if (/^[^.!?]{0,24}:\s/.test(t)) return 'это реплика человека, а не действие';
  if ((t.match(/[.!?](\s|$)/g) || []).length > 2) return 'ответ длиннее одного предложения';
  return '';
}

var WATCH_SYS = 'Ты ведёшь домашнее животное в ролевой сцене. Отвечай ОДНИМ законченным предложением на русском: что животное делает прямо сейчас. Настоящее время, третье лицо, без имени животного в начале, без кавычек, без уменьшительных, без пояснений и без реплик людей. Действие должно продолжать последнюю реплику сцены и не противоречить ей: если животное было в другой комнате, покажи, как оно приходит, а не переноси его молча. Не выдумывай предметов и людей, которых в сцене нет. Животное действует само и разрешения не спрашивает. Учитывай указанные повадки и характер животного — они определяют его поведение.';

function watchNow(who){
  var p = who || petOf();
  if (!p || W.busy || !canWatch()) return Promise.resolve(false);
  if (sleeping(p)) return Promise.resolve(false);
  W.busy = true; W.err = ''; render();
  var s = p.st;
  var others = [];
  (function(){ var l = petsOf(CK), i;
    for (i=0;i<l.length;i++) if (l[i] !== p) others.push(l[i].name + ' (' + l[i].kind + ')');
  })();
  return recent(8).then(function(lines){
    var card = p.name + ' — ' + p.kind + (p.breed ? ' (' + p.breed + ')' : '') + (p.age ? ', ' + p.age : '') +
               ', ' + STAGE[stageOf(p)].label +
               ', характер ' + (TEMPER[p.temper]||TEMPER.calm).label +
               (p.desc ? '. Повадки и характер: ' + p.desc : '') +
               (p.owner === 'char' ? '. Это питомец персонажа, не игрока' : '') +
               '. Привязанность к тому, кто за ним ходит: ' + bondLabel(s.bond) + '.';
    var st = 'Состояние: ' + stateWord(p) + '. Голод ' + Math.round(s.hunger) + '/100, энергия ' + Math.round(s.energy) +
             '/100, настроение ' + Math.round(s.mood) + '/100, чистота ' + Math.round(s.clean) + '/100.' +
             (p.sick ? (p.treated ? ' Болеет, лекарство дано.' : ' Болеет.') : '');
    var mood = moodWord(p);
    var need = { hungry:'просит еды', bored:'скучает', love:'хочет внимания', mischief:'ищет, что натворить',
                 scared:'напуган', sick:'болеет', sleepy:'хочет спать', hurt:'обижен и не идёт на контакт',
                 jeal:'ревнует, что внимание не ему', joy:'переполнен восторгом' }[topNeed(p)] || 'просто рядом';
    var pr = card + '\n' + st + (mood ? '\nНастроен: ' + mood + '.' : '') +
             '\nСейчас ' + DAY_WORD[partOfDay()] + '.' +
             (p.hab.spot ? '\nЛюбимое место: ' + p.hab.spot + '.' : '') +
             '\nСильнее всего сейчас: ' + need + '.' +
             (p.now && p.now.text ? '\nПеред этим делал: ' + p.now.text : '') +
             (buildMemo(p) ? '\nЗа сеанс было: ' + buildMemo(p) + '.' : '') +
             (others.length ? '\nРядом же: ' + others.join('; ') + '.' : '') +
             '\n\n' +
             (lines.length ? 'Сцена, последняя реплика — самая свежая:\n' + lines.join('\n') + '\n\n' : '') +
             'Что животное делает прямо сейчас, продолжая эту сцену? Одно законченное предложение.';
    return genText(pr, WATCH_SYS);
  }).then(function(t){
    W.busy = false; W.last = now();
    t = String(t||'').replace(/\s*\n+\s*/g, ' ').replace(/^["'«»\s-]+/,'').replace(/["'«»\s]+$/,'').trim();
    var why = watchReject(t);
    if (why) {
      W.err = why;
      actSelf(true);
      render();
      return false;
    }
    W.ok++;
    if (t.length > 220) t = t.slice(0, 220).replace(/\s+\S*$/,'') + '…';
    var pp = petAt(p._id) || petOf(); if (!pp) return false;
    pp.now = { text: t, kind: topNeed(pp), ts: now(), by: 'model' };
    logAdd(pp, '👁 ' + t);
    memoAdd(pp, t);
    touch(pp); save(); render();
    return true;
  }).catch(function(e){
    W.busy = false;
    W.err = (e && e.message) ? e.message : 'ошибка модели';
    actSelf(true, p);
    render();
    return false;
  });
}

var ACTIONS = [
  { id:'feed',  icon:'🍖', label:'покормить', cd: 2.5*HOUR,
    deny: function(p){ return p.st.hunger > 88 ? 'сыт' : ''; },
    eff: { hunger:+46, mood:+6, clean:-7, bond:+2 }, joy:4, hint:'+еда', past:'покормили',
    say:'насыпал еды и покормил' },
  { id:'treat', icon:'🦴', label:'лакомство', cd: 45*MIN,
    deny: function(p){ return p.st.hunger > 96 ? 'не лезет' : ''; },
    eff: { hunger:+9, mood:+14, bond:+3 }, joy:8, hint:'+радость', past:'дали лакомство',
    say:'дал лакомство с руки' },
  { id:'play',  icon:'🎾', label:'играть', cd: 35*MIN,
    deny: function(p){ return p.st.energy < 18 ? 'вымотан' : (p.sick ? 'болеет' : ''); },
    eff: { energy:-16, mood:+22, hunger:-7, clean:-5, bond:+4 }, joy:14, hint:'−силы', past:'поиграли',
    say:'затеял с ним возню' },
  { id:'pet',   icon:'🤲', label:'гладить', cd: 9*MIN,
    deny: function(){ return ''; },
    eff: { mood:+9, bond:+2, energy:+2 }, joy:5, hint:'+связь', past:'погладили',
    say:'гладит его' },
  { id:'walk',  icon:'🚪', label:'гулять', cd: 3*HOUR,
    deny: function(p){ return p.st.energy < 22 ? 'вымотан' : ''; },
    eff: { energy:-11, mood:+19, hunger:-9, clean:-9, bond:+3 }, joy:10, hint:'−силы', past:'выпустили',
    say:'вывел его наружу' },
  { id:'clean', icon:'🧼', label:'прибрать', cd: 50*MIN,
    deny: function(p){ return p.st.clean > 92 ? 'чисто' : ''; },
    eff: { clean:+58, mood:+5, bond:+1 }, joy:2, hint:'+чистота', past:'прибрали',
    say:'прибрался за ним' },
  { id:'heal',  icon:'💊', label:'лечить', cd: 6*HOUR, sickOnly: true,
    deny: function(p){ return p.sick ? (p.treated ? 'лечится' : '') : 'здоров'; },
    eff: { mood:+8, energy:+10 }, joy:6, hint:'лечит', past:'дали лекарство',
    say:'дал ему лекарство' }
];
function actionById(id){ for (var i=0;i<ACTIONS.length;i++) if (ACTIONS[i].id === id) return ACTIONS[i]; return null; }
function cdLeft(p, a){ var t = (p.cd && p.cd[a.id]) || 0; var l = t + a.cd - now(); return l > 0 ? l : 0; }
function cdText(ms){
  var m = Math.ceil(ms/60000);
  return m < 60 ? (m + ' мин') : (Math.round(m/60*10)/10 + ' ч');
}

function doAction(id){
  var p = petOf(); if (!p) return;
  var a = actionById(id); if (!a) return;
  var left = cdLeft(p, a);
  if (left > 0) { flash(a.label + ' — рано, через ' + cdText(left)); return; }
  var deny = a.deny(p);
  if (deny) { flash(p.name + ': ' + deny); return; }
  var woke = false;
  if (sleeping(p) && id !== 'clean') {
    p.wake = now() + 40*MIN;
    p.slept = false;
    p.st.mood = clamp(p.st.mood - 6);
    p.mo.hurt = Math.min(30, p.mo.hurt + 8);
    woke = true;
  }
  var bondAdd = 0;
  if (a.eff.bond) {
    if (p.bondDay !== dayKey()) { p.bondDay = dayKey(); p.bondGain = 0; }
    bondAdd = Math.min(a.eff.bond, Math.max(0, 12 - p.bondGain));
    p.bondGain += bondAdd;
  }
  var k;
  for (k in a.eff) {
    if (!a.eff.hasOwnProperty(k)) continue;
    p.st[k] = clamp(p.st[k] + (k === 'bond' ? bondAdd : a.eff[k]));
  }
  p.mo.joy  = Math.min(30, p.mo.joy + (a.joy || 0));
  p.mo.hurt = Math.max(0, p.mo.hurt - (a.joy || 0) * 0.8);
  p.mo.jeal = 0;
  if (id === 'heal') { p.treated = now(); }
  if (id === 'feed') {
    p.hab.feeds = (p.hab.feeds || 0) + 1;
    if (!p.hab.food && p.hab.feeds >= 3) p.hab.food = pick(arch(p).food);
  }
  p.cd = p.cd || {}; p.cd[id] = now();
  p.lastCare = now(); p.seen = now();
  logAdd(p, a.icon + ' ' + (a.past || a.label), false, true, a.past || a.label);
  queue(p, (woke ? 'разбудил его — ' : '') + owner(p).subj + ' ' + a.say);
  memoAdd(p, a.past || a.label);
  var kind = (id === 'play' || id === 'feed') ? 'happy' : ((id === 'pet' || id === 'treat') ? 'love' : 'bored');
  if (p.st.mood > 35 && !p.sick) p.now = { text: phraseFor(p, kind), kind: kind, ts: now() };
  touch(p); save(); render();
}

var msgSince = 0;

var SESSION_MEMO = {};
function memoAdd(p, text){
  if (!p || !p._id) return;
  var id = p._id;
  if (!SESSION_MEMO[id]) SESSION_MEMO[id] = [];
  if (SESSION_MEMO[id].length && SESSION_MEMO[id][SESSION_MEMO[id].length-1] === text) return;
  SESSION_MEMO[id].push(text);
  if (SESSION_MEMO[id].length > 8) SESSION_MEMO[id].shift();
}
function buildMemo(p){
  if (!p || !p._id) return '';
  var m = SESSION_MEMO[p._id];
  return (m && m.length) ? m.join('; ') : '';
}

function stateKey(p){
  if (!p) return 'none';
  if (p.sick) return 'sick';
  if (sleeping(p)) return 'sleep';
  if (p.st.hunger < 30) return 'hungry';
  if (p.st.clean < 22) return 'dirty';
  if (p.mo.hurt > 12) return 'hurt';
  if (p.mo.jeal > 12) return 'jeal';
  if (p.st.mood < 25) return 'hide';
  if (p.now && p.now.kind === 'happy') return 'play';
  if (p.now) return 'ask';
  return 'ok';
}
var STATE_WORD = { sick:'болеет', sleep:'спит', hungry:'голоден', dirty:'грязный', hurt:'обижен',
                   jeal:'ревнует', hide:'прячется', play:'играет', ask:'просится', ok:'бодр', none:'' };
function stateWord(p){ return STATE_WORD[stateKey(p)] || 'бодр'; }
function moodWord(p){
  if (!p || !p.mo) return '';
  var m = p.mo;
  if (m.hurt > 10 && m.hurt >= m.joy) return 'обижен';
  if (m.jeal > 12) return 'ревнует к тому, кто занял хозяина';
  if (m.joy > 12) return 'в восторге';
  return '';
}
function moodEmoji(p){
  if (p.sick) return '🤒';
  if (sleeping(p)) return '😴';
  if (p.st.hunger < 30) return '🍖';
  if (p.mo.hurt > 12) return '🙄';
  if (p.mo.jeal > 12) return '😾';
  if (p.st.mood < 25) return '😨';
  if (p.now && p.now.kind === 'mischief') return '😤';
  if (p.now && (p.now.kind === 'happy' || p.now.kind === 'joy')) return '🎾';
  return p.st.mood > 55 ? '😊' : '😐';
}
function daysWith(p){ return Math.max(1, Math.round((now() - p.born)/DAY)); }
function freshNow(p){ return !!(p && p.now && (now() - p.now.ts) < 25*MIN); }
function freshPend(p){ return ((p && p.pend) || []).filter(function(x){ return (now()-x.ts) < 30*MIN; }); }

function petLines(p, many){
  var s = p.st, out = [], pad = many ? '  ' : '';
  out.push((many ? '• ' : '') + p.name + ' · ' + p.kind + (p.breed ? ' (' + p.breed + ')' : '') + (p.age ? ' · ' + p.age : '') +
    ' · ' + STAGE[stageOf(p)].label + ' · характер: ' + (TEMPER[p.temper]||TEMPER.calm).label +
    (p.desc ? ' · повадки: ' + p.desc : '') +
    ' · ' + owner(p).head(daysWith(p)) + ' · связь: ' + bondLabel(s.bond));
  out.push(pad + 'состояние: ' + stateWord(p) + ' ' + moodEmoji(p) +
    ' · голод ' + Math.round(s.hunger) + '/100 · энергия ' + Math.round(s.energy) +
    '/100 · настроение ' + Math.round(s.mood) + '/100 · чистота ' + Math.round(s.clean) + '/100');
  var mood = moodWord(p);
  if (mood) out.push(pad + 'настроен: ' + mood);
  var hab = [];
  if (p.hab.spot) hab.push('отлёживается тут: ' + p.hab.spot);
  if (p.hab.food) hab.push('любимая еда — ' + p.hab.food);
  if (hab.length) out.push(pad + 'привычки: ' + hab.join(' · '));
  var lc = lastCare(p);
  if (lc) out.push(pad + 'помнит: ' + lc.s.replace(/^\S+\s/, '') + ' — ' + since(lc.t));
  var memo = buildMemo(p); if (memo) out.push(pad + 'за сеанс: ' + memo);
  if (freshNow(p)) out.push(pad + 'сейчас: ' + p.now.text);
  return out;
}

function buildCtx(){
  var list = petsOf(CK); if (!list.length) return '';
  var many = list.length > 1, i, j;
  var out = ['[PET — ' + (many ? 'питомцы в сцене, ведёшь их ты' : 'питомец в сцене, ведёшь его ты') + ']'];
  out.push('сейчас ' + DAY_WORD[partOfDay()]);
  for (i=0;i<list.length;i++) out = out.concat(petLines(list[i], many));
  var known = [];
  for (i=0;i<list.length;i++) if (list[i].known) known.push(list[i].name);
  if (known.length) out.push(known.join(' и ') + (known.length > 1
    ? ' уже есть в сцене и в описании персонажа: веди именно этих животных, не заводи новых и не знакомь заново.'
    : ' уже есть в сцене и в описании персонажа: веди именно это животное, не заводи второе и не знакомь заново.'));
  var pend = [];
  for (i=0;i<list.length;i++) {
    var fp = freshPend(list[i]);
    for (j=0;j<fp.length;j++) pend.push(fp[j].text);
  }
  if (pend.length) {
    out.push('хозяин только что: ' + pend.join('; '));
    out.push('Это уже произошло в сцене на глазах у всех — покажи это и дай персонажу отреагировать.');
  }
  out.push('Правила: ' + (many ? 'питомцы действуют' : 'питомец действует') + ' сам' + (many ? 'и' : '') +
    ' и разрешения не спрашива' + (many ? 'ют' : 'ет') + '. ' +
    'Могут прервать близость, создать неловкость или сблизить. Без уменьшительных. ' +
    'Не больше одного-двух предложений про них за ответ — вплетай в сцену, не отдельным блоком. ' +
    'Если по сцене животное сейчас в другом месте — сначала покажи, как оно пришло, а не подменяй молча.');
  out.push('[/PET]');
  return out.join('\n');
}

function statsHash(p){
  if (!p) return '';
  var s = p.st;
  return p.name + '(' + p.kind + ',' + STAGE[stageOf(p)].label + '):' +
    'гол' + Math.round(s.hunger) + '/сил' + Math.round(s.energy) + '/дух' + Math.round(s.mood) +
    '/чис' + Math.round(s.clean) + '/свз' + Math.round(s.bond) + '|' + stateWord(p);
}
function buildShortCtx(){
  var list = petsOf(CK); if (!list.length) return '';
  var out = '[PET·';
  for (var i=0;i<list.length;i++){
    if (i) out += ';';
    out += statsHash(list[i]);
  }
  return out + ']';
}
function lightLine(p){
  if (!p) return '';
  var sk = stateKey(p);
  if (sk === 'sleep') return p.name + ' спит';
  if (sk === 'sick')  return p.name + ' болеет';
  if (sk === 'hungry') return p.name + ' хочет есть';
  if (sk === 'dirty') return p.name + ' грязный';
  if (sk === 'hurt')  return p.name + ' обижен';
  if (sk === 'jeal')  return p.name + ' ревнует';
  if (freshNow(p)) return p.name + ': ' + p.now.text;
  return p.name + ' рядом, ' + stateWord(p);
}
function buildLightCtx(){
  var list = petsOf(CK); if (!list.length) return '';
  var lines = [];
  for (var i=0;i<list.length;i++) lines.push(lightLine(list[i]));
  return '[PET·' + lines.join('; ') + ']';
}
function fabBadge(){
  var count = 0, list = petsOf(CK), i;
  for (i=0;i<list.length;i++){
    if (list[i].st.hunger < 30) count++;
    if (list[i].st.clean < 25) count++;
    if (list[i].sick) count++;
    if (freshNow(list[i]) && !list[i].now.sent) count++;
  }
  return count > 0 ? String(Math.min(count, 9)) : '';
}

function pushCtx(){
  if (!alive()) return;
  var p = petOf(), h = host();
  var on = !!p && h.inject;
  if (on) {
    var list = petsOf(CK), news = false, i;
    for (i=0;i<list.length;i++)
      if ((freshNow(list[i]) && !list[i].now.sent) || freshPend(list[i]).length) { news = true; break; }
    if (!news && (msgSince % h.every) !== 0) on = false;
  }
  var ctxText = on ? buildCtx() : (!!p && h.inject ? buildLightCtx() : '');
  ctx().setExtensionPrompt('pusya_pet', ctxText, 1, 4);
}

var ROOT_ID = 'pusya-pet-root';
var root = null;

var flashT = null;
function flash(msg){
  var old = document.querySelector('.pp-flash'); if (old && old.parentNode) old.parentNode.removeChild(old);
  var d = document.createElement('div'); d.className = 'pp-flash'; d.textContent = msg;
  copyVars(d);
  document.body.appendChild(d);
  if (flashT) clearTimeout(flashT);
  flashT = setTimeout(function(){ if (d.parentNode) d.parentNode.removeChild(d); }, 2400);
}

var STATE_COLOR = { sick:'203,90,74', sleep:'116,132,172', hungry:'219,140,74', dirty:'166,134,92',
                    hurt:'150,130,150', jeal:'186,124,140', hide:'124,144,178', play:'226,178,112',
                    ask:'226,178,112', ok:'143,191,122', none:'176,148,120' };
function stateColor(p){ return STATE_COLOR[stateKey(p)] || STATE_COLOR.none; }

var VARS = ['--pc','--c1','--c2','--b1','--b2','--al','--bl'];
function hexRgb(h){
  h = String(h||'').replace('#','').trim();
  if (h.length === 3) h = h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);
  var n = parseInt(h, 16);
  if (h.length !== 6 || isNaN(n)) return '140,140,140';
  return ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255);
}
function shade(h, k){
  h = String(h||'').replace('#','').trim();
  if (h.length === 3) h = h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);
  var n = parseInt(h, 16);
  if (h.length !== 6 || isNaN(n)) return '12,10,11';
  return Math.round(((n>>16)&255)*k) + ',' + Math.round(((n>>8)&255)*k) + ',' + Math.round((n&255)*k);
}
function applySkin(p){
  if (!root) return;
  var s = skin();
  root.style.setProperty('--pc', cfg().glow === false ? hexRgb(s.c1) : stateColor(p));
  root.style.setProperty('--c1', hexRgb(s.c1));
  root.style.setProperty('--c2', hexRgb(s.c2));
  root.style.setProperty('--b1', hexRgb(s.c3));
  root.style.setProperty('--b2', shade(s.c3, 0.5));
  root.style.setProperty('--al', Math.max(30, Math.min(100, parseInt(s.alpha,10) || 96))/100);
  root.style.setProperty('--bl', (Math.max(0, Math.min(24, parseInt(s.blur,10) || 0))) + 'px');
}
function copyVars(el){
  if (!root) return;
  for (var i=0;i<VARS.length;i++) el.style.setProperty(VARS[i], root.style.getPropertyValue(VARS[i]));
}
function barColor(v){
  if (v > 60) return 'linear-gradient(90deg,#8fbf7a,#b8d99f)';
  if (v > 30) return 'linear-gradient(90deg,#d0a95e,#e6c785)';
  return 'linear-gradient(90deg,#c05a4a,#e08070)';
}

var open = false, view = 'home', tab = 'life', draft = null;
var moreOpen = false;
var adding = false;
var emoOpen = false, advOpen = false;
var armed = { id:'', at:0 };
function isArmed(id){ return armed.id === id && (now() - armed.at) < 10000; }
function arm(id){ armed = { id:id, at:now() }; render(); }
function disarm(){ armed = { id:'', at:0 }; }
var srvOpen = false;

function formOpen(){ return open && (view === 'new' || view === 'edit' ||
  (view === 'cfg' && (tab === 'model' || tab === 'skin'))); }
function renderBg(){ if (!formOpen()) render(); else pushCtx(); }

function snapScroll(){
  try { var b = root.querySelector('.pp-body'); return b ? b.scrollTop : 0; } catch(e){ return 0; }
}
function restScroll(v){
  if (!v) return;
  try { var b = root.querySelector('.pp-body'); if (b) b.scrollTop = v; } catch(e){}
}
function snapFocus(){
  try {
    var a = document.activeElement;
    if (!a || !a.id || a.id.indexOf('pp-') !== 0) return null;
    var o = { id: a.id, s: null, e: null };
    try { o.s = a.selectionStart; o.e = a.selectionEnd; } catch(e){}
    return o;
  } catch(e){ return null; }
}
function restFocus(f){
  if (!f) return;
  try {
    var el = document.getElementById(f.id);
    if (!el) return;
    el.focus();
    if (f.s != null && el.setSelectionRange) { try { el.setSelectionRange(f.s, f.e); } catch(e){} }
  } catch(e){}
}

var fabEl = null, panelBox = null, wasOpen = false;
function ensureShell(){
  if (!root) return;
  if (fabEl && fabEl.parentNode === root) return;
  root.innerHTML = '';
  fabEl = document.createElement('div');
  fabEl.className = 'pp-fab'; fabEl.id = 'pp-fab';
  fabEl.setAttribute('role', 'button');
  fabEl.setAttribute('tabindex', '0');
  root.appendChild(fabEl);
  panelBox = document.createElement('div');
  root.appendChild(panelBox);
  dragger(fabEl, fabEl, toggle, 'pos');
  fabEl.onkeydown = function(ev){
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') { ev.preventDefault(); toggle(); }
  };
}
function setAttr(el, k, v){ if (el.getAttribute(k) !== v) el.setAttribute(k, v); }
function paintFab(p){
  var face = (!p || cfg().face === 'paw') ? '🐾' : (p.icon || '🐾');
  var badge = fabBadge();
  var tag = W.busy ? '<i class="pp-tag">👁</i>' : (badge ? '<i class="pp-tag pp-badge">' + badge + '</i>' : (p && freshNow(p) ? '<i class="pp-tag">!</i>' : ''));
  var html = '<span>' + esc(face) + '</span>' + tag + syncDot();
  setAttr(fabEl, 'data-s', stateKey(p));
  setAttr(fabEl, 'data-urgent', (p && (freshNow(p) || p.sick || p.st.hunger < 25)) ? '1' : '0');
  setAttr(fabEl, 'data-ring', cfg().ring === false ? '0' : '1');
  setAttr(fabEl, 'data-glow', cfg().glow === false ? '0' : '1');
  setAttr(fabEl, 'aria-label', p ? (p.name + ', ' + stateWord(p)) : 'PUSYA PET — завести питомца');
  if (fabEl.innerHTML !== html) fabEl.innerHTML = html;
}

function render(){
  if (!alive() || !loaded || !root) return;
  var p = petOf(), f = snapFocus(), sc = snapScroll();
  applySkin(p);
  ensureShell();
  paintFab(p);
  panelBox.innerHTML = open ? panelHTML(p, !wasOpen) : '';
  wasOpen = open;
  placeFab();
  if (open) placePanel();
  bind();
  restFocus(f);
  restScroll(sc);
  pushCtx();
}

function syncDot(){ return ''; }

function panelHTML(p, fresh){
  var body, head;
  if (view === 'cfg') { head = topPlain('настройки'); body = viewCfg(p); }
  else if (!p || view === 'new') { head = topPlain(adding ? 'ещё один питомец' : 'новый питомец'); body = viewNew(); }
  else if (view === 'edit') { head = topPlain('карточка'); body = viewEdit(p); }
  else if (view === 'log')  { head = topPlain('журнал'); body = viewLog(p); }
  else { head = topPet(p); body = viewHome(p); }
  return '<div class="pp-panel' + (fresh ? ' pp-in' : '') + '" id="pp-panel" role="dialog" aria-label="PUSYA PET">' +
         head + '<div class="pp-body">' + body + '</div></div>';
}
function topPet(p){
  return '<div class="pp-top" id="pp-drag">' +
    '<div class="pp-ava" data-s="' + stateKey(p) + '"><span>' + esc(p.icon) + '</span></div>' +
    '<div class="pp-hd"><div class="pp-nm"><b>' + esc(p.name) + '</b><span class="pp-chip">' + esc(stateWord(p)) + '</span></div>' +
    '<div class="pp-sub">' + esc(p.kind) + ' · ' + STAGE[stageOf(p)].label + ' · ' + (p.age || (daysWith(p) + ' дн')) + ' · ' + bondLabel(p.st.bond) + '</div></div>' +
    '<div style="font-size:19px">' + moodEmoji(p) + '</div>' +
    '<button class="pp-x" id="pp-close" aria-label="закрыть">✕</button></div>';
}
function topPlain(title){
  return '<div class="pp-top" id="pp-drag"><div class="pp-hd"><div class="pp-nm"><b>' + esc(title) + '</b></div></div>' +
    (view !== 'new' ? '<button class="pp-x" data-go="home" aria-label="назад">↩</button>' : '') +
    '<button class="pp-x" id="pp-close" aria-label="закрыть">✕</button></div>';
}

function petTabs(p){
  var list = petsOf(CK);
  if (list.length < 2) return '';
  var h = '<div class="pp-who">', i, q;
  for (i=0;i<list.length;i++){
    q = list[i];
    h += '<button class="pp-w" data-pet="' + esc(q._id) + '" data-on="' + (q === p ? '1' : '0') +
         '" title="' + esc(q.name) + '" style="--wc:' + stateColor(q) + '"><u>' + esc(q.icon) + '</u><b>' + esc(q.name) + '</b>' +
         (freshNow(q) ? '<i></i>' : '') + '</button>';
  }
  return h + '</div>';
}

function viewHome(p){
  var s = p.st, h = petTabs(p), short = cfg().mode === 'short';
  if (W.busy) h += '<div class="pp-now"><div><span class="pp-eye"></span>модель смотрит сцену…</div></div>';
  else if (freshNow(p)) h += '<div class="pp-now"><div>' + (p.now.by === 'model' ? '👁 ' : '🐾 ') + esc(p.now.text) +
    '<em>' + (p.now.by === 'model' ? 'наблюдатель · ' : 'сам · ') + since(p.now.ts) +
    (p.now.sent ? ' · уже в сцене' : ' · уйдёт в промпт') + '</em></div></div>';
  else if (p.sick) h += '<div class="pp-now"><div>🤒 ' + (p.treated ? 'лечится — лекарство дано, нужны еда и чистота' : 'болеет — нужны лекарство, еда и чистота') + '</div></div>';
  else if (sleeping(p)) h += '<div class="pp-now"><div>💤 спит — разбудишь, настроение просядет</div></div>';
  else {
    var mw = moodWord(p);
    if (mw) h += '<div class="pp-now"><div>· ' + esc(mw) + '</div></div>';
  }
  h += short ? statsShort(p) : statsFull(p);
  h += short ? actsShort(p) : actsFull(p);
  h += '<div class="pp-foot">' +
    '<button class="pp-l" data-poke="1">' + (canWatch() ? '👁 спросить' : '🐾 расшевелить') + '</button>' +
    '<button class="pp-l" data-go="log">📜 журнал</button>' +
    '<button class="pp-l" data-go="cfg">⚙️ настройки</button></div>';
  return h;
}

var STATS = [ ['🍖','голод','hunger'], ['⚡','силы','energy'], ['😊','настроение','mood'],
              ['🧼','чистота','clean'], ['💛','связь','bond'] ];
function statsFull(p){
  var h = '', i, v;
  for (i=0;i<STATS.length;i++){
    v = p.st[STATS[i][2]];
    h += '<div class="pp-s"><em>' + STATS[i][0] + '</em><span>' + STATS[i][1] + '</span>' +
         '<div class="pp-track"><i style="width:' + Math.round(v) + '%;background:' + barColor(v) + '"></i></div>' +
         '<b>' + Math.round(v) + '</b></div>';
  }
  return h;
}
var STAT_WORD = {
  hunger:['голоден','поел','сыт'], energy:['вымотан','бодр','полон сил'],
  mood:['мрачен','ровно','доволен'], clean:['грязный','чистый','вылизан'],
  bond:['чужой','привык','предан']
};
function statsShort(p){
  var h = '<div class="pp-seglb">', i, v, w;
  for (i=0;i<STATS.length;i++){
    v = p.st[STATS[i][2]];
    w = STAT_WORD[STATS[i][2]][v > 60 ? 2 : (v > 30 ? 1 : 0)];
    h += '<span>' + w + '</span>';
  }
  h += '</div><div class="pp-seg">';
  for (i=0;i<STATS.length;i++){
    v = p.st[STATS[i][2]];
    h += '<i><u style="width:' + Math.round(v) + '%;background:' + barColor(v) + '"></u></i>';
  }
  return h + '</div>';
}

function actsFull(p){
  var h = '<div class="pp-acts">', j, a, left, deny, cap;
  for (j=0;j<ACTIONS.length;j++){
    a = ACTIONS[j];
    if (a.sickOnly && !p.sick) continue;
    left = cdLeft(p, a); deny = a.deny(p);
    cap = left > 0 ? ('через ' + cdText(left)) : (deny || a.hint || '');
    h += '<button class="pp-a" data-act="' + a.id + '"' + ((left > 0 || deny) ? ' disabled' : '') + '>' +
         '<u>' + a.icon + '</u><b>' + esc(a.id === 'walk' ? arch(p).walk.split(' ')[0] : a.label) + '</b>' +
         '<i>' + esc(cap) + '</i></button>';
  }
  return h + '</div>';
}
var MAIN_ACTS = ['feed','play','pet'];
function actsShort(p){
  var list = [], j, a, left, deny;
  for (j=0;j<ACTIONS.length;j++){
    a = ACTIONS[j];
    if (a.sickOnly && !p.sick) continue;
    if (moreOpen || MAIN_ACTS.indexOf(a.id) !== -1 || (p.sick && a.id === 'heal')) list.push(a);
  }
  var h = '<div class="pp-round">';
  for (j=0;j<list.length;j++){
    a = list[j];
    left = cdLeft(p, a); deny = a.deny(p);
    h += '<button class="pp-r" data-act="' + a.id + '"' + ((left > 0 || deny) ? ' disabled' : '') + '>' +
         '<u>' + a.icon + '</u><b>' + esc(left > 0 ? cdText(left) : (deny || (a.id === 'walk' ? arch(p).walk.split(' ')[0] : a.label))) + '</b></button>';
  }
  if (!moreOpen) h += '<button class="pp-r" data-more="1"><u>⋯</u><b>ещё</b></button>';
  return h + '</div>';
}

function viewLog(p){
  var list = petsOf(CK), all = [], i, j, e, pet;
  for (i=0;i<list.length;i++){
    pet = list[i];
    var l = (pet.log || []).slice();
    for (j=0;j<l.length;j++) all.push({ e: l[j], who: pet.icon || '🐾', name: pet.name });
  }
  all.sort(function(a,b){ return b.e.t - a.e.t; });
  if (!all.length) return '<div class="pp-note">Пусто. Сюда падает всё, что питомец делал и что делали с ним.</div>';
  var rows = [], run;
  for (i=0;i<all.length;i++){
    e = all[i].e;
    if (e.c && e.w) {
      run = [e.w];
      while (i+1 < all.length && all[i+1].e.c && all[i+1].e.w
             && all[i+1].name === all[i].name
             && (e.t - all[i+1].e.t) < 20*MIN) { i++; run.push(all[i].e.w); }
      rows.push({ t: e.t, care: 1, who: all[i].who, name: all[i].name,
        txt: run.length > 1 ? ('🤲 ухаживали: ' + run.join(', ')) : e.s });
    } else {
      rows.push({ t: e.t, care: 0, who: all[i].who, name: all[i].name, txt: e.s, keep: e.k });
    }
  }
  var many = list.length > 1;
  var h = '', bucket = '', b;
  for (i=0;i<rows.length;i++){
    b = bucketOf(rows[i].t);
    if (b !== bucket) { bucket = b; h += '<div class="pp-day">' + b + '</div>'; }
    var tag = '<b class="pp-lw">' + esc(rows[i].who) + '</b>';
    h += '<div class="pp-le"><time>' + clockOf(rows[i].t) + '</time>' +
         tag + '<p class="' + (rows[i].care ? '' : 'pp-self') + '">' + esc(rows[i].txt) + '</p></div>';
  }
  return h;
}
function bucketOf(t){
  var d = now() - t;
  if (d < 15*MIN) return 'только что';
  if (d < HOUR) return 'в этот час';
  var a = new Date(t), b = new Date();
  if (a.toDateString() === b.toDateString()) return 'сегодня';
  b.setDate(b.getDate() - 1);
  if (a.toDateString() === b.toDateString()) return 'вчера';
  return 'раньше';
}
function clockOf(t){
  if (now() - t < 15*MIN) return '—';
  var d = new Date(t), m = d.getMinutes();
  return d.getHours() + ':' + (m < 10 ? '0' : '') + m;
}

function viewCfg(p){
  var tabs = [['life','жизнь'],['look','вид'],['skin','тема'],['model','модель']];
  var h = '<div class="pp-tabs">';
  for (var i=0;i<tabs.length;i++)
    h += '<button class="pp-tab" data-tab="' + tabs[i][0] + '" data-on="' + (tab===tabs[i][0]?'1':'0') + '">' + tabs[i][1] + '</button>';
  h += '</div>';
  if (tab === 'model') return h + cfgModel();
  if (tab === 'look')  return h + cfgLook();
  if (tab === 'skin')  return h + cfgSkin();
  return h + cfgLife(p);
}
function cfgCloud(){
  var s = sync(), on = syncOn();
  var h = '<div class="pp-sec">хранение</div>';
  h += '<div class="pp-note">Питомцы лежат на этом устройстве и теряются при чистке кеша. Придумай ник — и они переживут её и переедут на телефон.</div>';
  h += '<div class="pp-f" style="margin-top:11px"><label>твой ник</label><input class="pp-i" id="pp-snick" value="' + esc(s.nick) + '" placeholder="как тебя звать" spellcheck="false" maxlength="40"></div>';
  if (CLOUD.busy) h += '<div class="pp-note"><span class="pp-eye"></span>говорю с сервером…</div>';
  else if (on && CLOUD.state === 'ok') h += '<div class="pp-ok">✓ сохраняется' + (CLOUD.last ? ' · ' + since(CLOUD.last) : '') + (CLOUD.dirty ? ' · есть несохранённое' : '') + '</div>';
  else if (CLOUD.err) h += '<div class="pp-err">' + esc(CLOUD.err) + '</div>';
  if (CLOUD.taken)
    h += '<div class="pp-err">Ник занят. Если это твой — забери данные кнопкой ниже, они заменят здешних питомцев.</div>';
  h += '<button class="pp-b" data-claim="1">' + (on && CLOUD.state === 'ok' ? '☁ сохранить сейчас' : '☁ сохранять в облаке') + '</button>';
  h += '<button class="pp-b pp-ghost" data-attach="1">' + (isArmed('attach') ? '⬇ заменить здешних питомцев?' : '⬇ уже заводила ник на другом устройстве') + '</button>';
  h += '<div class="pp-note">Ник заменяет пароль: кто его знает, тот увидит твоих питомцев и сможет записать своё. Возьми такой, который не угадают.</div>';
  if (!srvOpen) h += '<button class="pp-tiny" data-srv="1">свой сервер</button>';
  else {
    h += '<div class="pp-f" style="margin-top:12px"><label>адрес сервера</label>' +
         '<input class="pp-i" id="pp-surl" value="' + esc(s.url) + '" placeholder="' + esc(HOME_URL) + '" spellcheck="false"></div>';
    h += '<div class="pp-note">Пусто — работает наш: ' + esc(HOME_URL) + '</div>';
  }
  return h;
}
function sw(key, label){
  return '<div class="pp-row"><div>' + label + '</div>' +
    '<button class="pp-sw" data-sw="' + key + '" data-on="' + (cfg()[key] === false ? '0' : '1') + '" aria-label="' + esc(label) + '"><i></i></button></div>';
}
function cfgLife(p){
  var speeds = [['slow','медленно'],['normal','обычно'],['fast','быстро']];
  var h = '<div class="pp-sec">скорость жизни</div><div class="pp-pickers">';
  for (var i=0;i<speeds.length;i++)
    h += '<button class="pp-pk" data-speed="' + speeds[i][0] + '" data-on="' + (cfg().speed===speeds[i][0]?'1':'0') + '">' + speeds[i][1] + '</button>';
  h += '</div><div class="pp-note">Как быстро уходят голод, энергия и чистота — и как быстро питомец взрослеет.</div>';
  h += '<div class="pp-sec">здоровье</div>' + sw('strict', 'Может заболеть');
  h += '<div class="pp-note">Слегает, если долго не кормить и не убирать. Лечится лекарством, не умирает.</div>';
  h += sw('pause', 'Пауза');
  h += '<div class="pp-note">' + (cfg().pause
      ? 'Время остановлено — питомец не голодает, не устаёт и не пачкается, пока ты не играешь.'
      : 'Выключено — жизнь идёт по реальному времени, даже когда чат закрыт.') + '</div>';
  if (p) {
    h += '<div class="pp-sec">питомец</div>';
    h += '<div class="pp-note" style="margin:0 0 8px">' + esc(p.name) + ' · ' + esc(p.kind) + ' · ' + STAGE[stageOf(p)].label +
         ' · ' + (p.age || (daysWith(p) + ' дн с хозяином')) + '</div>';
    h += '<button class="pp-b pp-ghost" data-go="edit">✏️ карточка</button>';
    h += '<button class="pp-b pp-ghost" data-add="1">➕ завести ещё одного</button>';
    h += '<button class="pp-b pp-ghost" data-del="1">' + (isArmed('del') ? '🗑 точно отдать?' : '🗑 отдать ' + esc(p.name)) + '</button>';
    var n = petsOf(CK).length;
    if (n > 1) h += '<div class="pp-note">В этом чате их ' + n + '. Все живут и лезут в сцену, в промпт уходят вместе.</div>';
  }
  h += '<div class="pp-note">Частота наблюдений и общий выключатель — в настройках расширения (Extensions).</div>';
  return h;
}
function cfgModel(){
  var m = modelCfg(), hs = host();
  var h = '<div class="pp-sec">своя модель · для питомца</div>';
  h += '<div class="pp-note">Раз в ' + hs.every + ' сообщ. модель читает сцену и решает, что животное делает. Интервал и общий выключатель — в настройках расширения.</div>';
  h += '<div class="pp-f" style="margin-top:10px"><input class="pp-i" id="pp-mep" value="' + esc(m.ep) + '" placeholder="эндпоинт (…/v1 или …/chat/completions)" spellcheck="false"></div>';
  h += '<div class="pp-f"><input class="pp-i" id="pp-mmodel" value="' + esc(m.model) + '" placeholder="модель (напр. deepseek-chat)" spellcheck="false"></div>';
  h += '<div class="pp-f"><input class="pp-i" id="pp-mkey" type="password" value="' + esc(m.key) + '" placeholder="api-ключ" spellcheck="false"></div>';
  h += '<div class="pp-note">В эту модель уходят карточка питомца, его статы и шесть последних реплик сцены. Ключ хранится на этом устройстве, в облако по нику он не отправляется.</div>';
  h += '<div style="display:flex;gap:6px">' +
       '<button class="pp-b" data-test="1" style="flex:1">' + (W.busy ? 'смотрит…' : 'проверить связь') + '</button>' +
       '<button class="pp-b pp-ghost" data-mclr="1" style="flex:0 0 ' + (isArmed('mclr') ? '86px' : '44px') + '" title="очистить">' + (isArmed('mclr') ? 'точно?' : '✕') + '</button></div>';
  if (W.err) h += '<div class="pp-err">' + esc(W.err) + '</div>';
  else if (W.ok) h += '<div class="pp-note">Наблюдений за сессию: ' + W.ok + (W.last ? ' · последнее ' + since(W.last) : '') + '</div>';
  if (!modelReady()) h += '<div class="pp-note">Пока заполнены не все три поля, питомца ведёт основная модель чата. Отдельная дешевле: ей уходит только карточка и пара реплик.</div>';
  if (!hs.watcher) h += '<div class="pp-err">Наблюдатель выключен в настройках расширения.</div>';
  return h;
}
function cfgLook(){
  var modes = [['full','подробно'],['short','коротко']];
  var h = '<div class="pp-sec">панель</div><div class="pp-pickers">';
  for (var m=0;m<modes.length;m++)
    h += '<button class="pp-pk" data-mode="' + modes[m][0] + '" data-on="' + ((cfg().mode||'full')===modes[m][0]?'1':'0') + '">' + modes[m][1] + '</button>';
  h += '</div><div class="pp-note">' + ((cfg().mode||'full') === 'short'
      ? 'Одна полоса вместо пяти, состояние словами, четыре главных дела крупно. Панель ниже и не закрывает сцену.'
      : 'Каждая полоска подписана, у кнопки видно, что она даёт и почему недоступна.') + '</div>';
  var faces = [['paw','🐾 лапка'],['pet','значок питомца']];
  h += '<div class="pp-sec">значок</div><div class="pp-pickers">';
  for (var i=0;i<faces.length;i++)
    h += '<button class="pp-pk" data-face="' + faces[i][0] + '" data-on="' + ((cfg().face||'paw')===faces[i][0]?'1':'0') + '">' + faces[i][1] + '</button>';
  h += '</div><div class="pp-note">Значок самого питомца выбирается в его карточке.</div>';
  h += '<div class="pp-sec">кружок</div>' + sw('ring', 'Круг под значком') + sw('glow', 'Цвет по состоянию');
  h += '<div class="pp-note">' + (cfg().glow === false
      ? 'Выключено — панель держит цвет темы и не мигает.'
      : 'Зелёный — всё хорошо, оранжевый — голоден, синий — спит, красный — болеет.') + '</div>';
  h += '<button class="pp-b pp-ghost" data-respos="1">↖ вернуть лапку на место</button>';
  return h;
}

function cfgSkin(){
  var s = skin();
  var h = '<div class="pp-sec">готовые темы</div><div class="pp-skins">';
  for (var i=0;i<SKINS.length;i++){
    var k = SKINS[i], on = (k.c1 === s.c1 && k.c2 === s.c2 && k.c3 === s.c3) ? '1' : '0';
    h += '<button class="pp-sk" data-skin="' + k.id + '" data-on="' + on + '">' +
         '<u><i style="background:' + k.c1 + '"></i><i style="background:' + k.c2 + '"></i><i style="background:' + k.c3 + ';box-shadow:0 0 0 1px rgba(255,255,255,.15)"></i></u>' +
         '<b>' + k.name + '</b></button>';
  }
  h += '</div>';
  h += '<div class="pp-sec">свои цвета</div>';
  h += '<div class="pp-cr"><span>акцент</span><input type="color" id="pp-c1" value="' + esc(s.c1) + '"></div>';
  h += '<div class="pp-cr"><span>текст</span><input type="color" id="pp-c2" value="' + esc(s.c2) + '"></div>';
  h += '<div class="pp-cr"><span>подложка</span><input type="color" id="pp-c3" value="' + esc(s.c3) + '"></div>';
  h += '<div class="pp-cr"><span>плотность</span><input type="range" id="pp-al" min="30" max="100" value="' + (parseInt(s.alpha,10)||96) + '"><b>' + (parseInt(s.alpha,10)||96) + '</b></div>';
  h += '<div class="pp-cr"><span>размытие</span><input type="range" id="pp-bl" min="0" max="24" value="' + (parseInt(s.blur,10)||0) + '"><b>' + (parseInt(s.blur,10)||0) + '</b></div>';
  h += '<div class="pp-note">Плотность ниже сотни делает панель полупрозрачной, размытие смазывает под ней сцену. Цвет по состоянию, если включён, перебивает акцент.</div>';
  h += '<button class="pp-b pp-ghost" data-skinreset="1">вернуть как было</button>';
  return h;
}

function fieldsHTML(d, compact){
  var a = d.archAuto ? guessArch(d.kind) : d.arch;
  if (!ARCH[a]) a = 'other';
  var h = '<div class="pp-f"><label>кличка</label><input class="pp-i" id="pp-name" value="' + esc(d.name) + '" placeholder="Рекс" maxlength="24"></div>';

  h += '<div class="pp-f"><label>кто это</label><input class="pp-i" id="pp-kind" value="' + esc(d.kind) + '" placeholder="собака, дракон, хорёк…" maxlength="30"></div>';

  h += '<div class="pp-f"><label>повадки</label><div class="pp-pickers">';
  h += '<button class="pp-pk" data-arch="auto" data-on="' + (d.archAuto?'1':'0') + '">авто' +
       (d.archAuto ? ' · ' + ARCH[a].label : '') + '</button>';
  for (var i=0;i<AR_ORDER.length;i++)
    h += '<button class="pp-pk" data-arch="' + AR_ORDER[i] + '" data-on="' + ((!d.archAuto && d.arch===AR_ORDER[i])?'1':'0') + '">' + ARCH[AR_ORDER[i]].label + '</button>';
  h += '</div><div class="pp-note">Повадки задают темп жизни и то, что питомец выкидывает сам. ' +
       esc(ARCH[a].label) + ' — это ' + esc(ARCH[a].hint) + '.</div></div>';

  h += '<div class="pp-f"><label>значок</label><button class="pp-em-pick" data-emo-toggle="1">' + esc(d.icon || '🐾') + '</button>';
  if (emoOpen) {
    h += '<div class="pp-emo">';
    for (var e=0;e<ICONS.length;e++)
      h += '<button class="pp-em" data-icon="' + esc(ICONS[e]) + '" data-on="' + (d.icon===ICONS[e]?'1':'0') + '">' + ICONS[e] + '</button>';
    h += '</div><input class="pp-i" id="pp-icon" value="' + esc(d.icon) + '" placeholder="свой эмоджи" maxlength="4" style="width:100px">';
  }
  h += '</div>';

  h += '<div class="pp-f"><label>характер</label><div class="pp-pickers">';
  for (var j=0;j<TP_ORDER.length;j++)
    h += '<button class="pp-pk" data-tp="' + TP_ORDER[j] + '" data-on="' + (d.temper===TP_ORDER[j]?'1':'0') + '">' + TEMPER[TP_ORDER[j]].label + '</button>';
  h += '</div></div>';

  h += '<div class="pp-f"><label>свои повадки</label><textarea class="pp-i" id="pp-desc" rows="2" placeholder="трусливый, ворует еду, спит на коленях, боится грозы…" maxlength="200" style="resize:vertical;min-height:38px">' + esc(d.desc || '') + '</textarea>';
  h += '<div class="pp-note">Опиши характер и привычки своими словами — модель будет вести питомца именно так.</div></div>';

  if (compact) {
    h += '<div class="pp-f" style="margin-top:6px"><label>твой ник</label><input class="pp-i" id="pp-snick" value="' + esc(String(sync().nick||'')) + '" placeholder="для сохранения между устройствами" spellcheck="false" maxlength="40"></div>';
    h += '<div class="pp-note">Ник — как пароль: по нему питомцы переезжают на другое устройство. Не угадываемый.</div>';
  }

  if (compact && !advOpen) {
    h += '<button class="pp-b pp-ghost" data-adv-toggle="1" style="margin-top:4px">▾ ещё</button>';
    return h;
  }
  if (compact && advOpen) {
    h += '<button class="pp-b pp-ghost" data-adv-toggle="1" style="margin-top:4px">▴ свернуть</button>';
  }

  if (d.newborn) {
    h += '<div class="pp-f"><label>сейчас это</label><div class="pp-pickers">';
    for (var g=0;g<SG_ORDER.length;g++)
      h += '<button class="pp-pk" data-stage="' + SG_ORDER[g] + '" data-on="' + (d.stage===SG_ORDER[g]?'1':'0') + '">' + STAGE[SG_ORDER[g]].label + '</button>';
    h += '</div><div class="pp-note">Дальше вырастет сам: детёныш становится подростком за трое суток жизни, взрослым — за десять.</div></div>';
  }

  h += '<div class="pp-f"><label>чей он</label><div class="pp-pickers">';
  for (var o=0;o<OW_ORDER.length;o++)
    h += '<button class="pp-pk" data-owner="' + OW_ORDER[o] + '" data-on="' + (d.owner===OW_ORDER[o]?'1':'0') + '">' + OWNER[OW_ORDER[o]].label + '</button>';
  h += '</div><div class="pp-note">' + (d.owner === 'char'
      ? 'Питомец персонажа. В промпте так и будет сказано, а твой уход за ним описывается как уход гостя.'
      : 'От этого зависит, как в промпте назван тот, кто его кормит и гладит.') + '</div></div>';

  h += '<div class="pp-f"><label>давно вместе</label><div class="pp-pickers">';
  for (var w=0;w<TOGETHER.length;w++)
    h += '<button class="pp-pk" data-together="' + TOGETHER[w].id + '" data-on="' + (d.together===TOGETHER[w].id?'1':'0') + '">' + TOGETHER[w].label + '</button>';
  h += '</div><div class="pp-note">Сдвигает дату появления назад' + (d.newborn ? ' и задаёт стартовую привязанность' : '') +
       '. Нужно, когда питомец уже жил в сцене до плагина.</div></div>';

  h += '<div class="pp-row" style="padding-top:4px"><div>Уже есть в сцене или в карточке</div>' +
       '<button class="pp-sw" data-known="1" data-on="' + (d.known?'1':'0') + '" aria-label="уже есть в сцене"><i></i></button></div>';
  h += '<div class="pp-note">Включи, если животное уже описано в карточке персонажа или его отыгрывали до установки. Тогда модели скажут вести именно его, а не заводить второго.</div>';

  h += '<div class="pp-f"><label>когда спит</label><div class="pp-pickers">';
  var nights = [['auto','как у повадок'],['day','днём'],['night','ночью']];
  var cur = d.night === null || d.night === undefined ? 'auto' : (d.night ? 'day' : 'night');
  for (var n=0;n<nights.length;n++)
    h += '<button class="pp-pk" data-night="' + nights[n][0] + '" data-on="' + (cur===nights[n][0]?'1':'0') + '">' + nights[n][1] + '</button>';
  h += '</div></div>';

  h += '<div class="pp-f"><label>порода</label><input class="pp-i" id="pp-breed" value="' + esc(d.breed) + '" placeholder="дворняга" maxlength="40"></div>';
  h += '<div class="pp-f"><label>возраст словами</label><input class="pp-i" id="pp-age" value="' + esc(d.age) + '" placeholder="3 года" maxlength="24"></div>';
  return h;
}
function viewNew(){
  if (!draft) draft = { name:'', kind:'', arch:'other', archAuto:true, temper:'playful',
                        breed:'', age:'', desc:'', icon:'🐾', night:null, stage:'adult',
                        owner:'me', together:'new', known:false, newborn:true };
  return '<div class="pp-note" style="margin-bottom:10px">У каждого чата свой питомец. Жить начнёт сразу.</div>' +
    fieldsHTML(draft, true) + '<button class="pp-b" id="pp-create">🐾 завести</button>' +
    '<div class="pp-note" style="margin-top:8px">Добавь свою модель в настройках (⚙️ → модель), чтобы питомец реагировал на сцену.</div>';
}
function viewEdit(p){
  if (!draft) draft = { name:p.name, kind:p.kind, arch:p.arch, archAuto:p.archAuto !== false, temper:p.temper,
                        breed:p.breed, age:p.age, desc:p.desc||'', icon:p.icon, night:p.night, stage:stageOf(p),
                        owner:p.owner || 'me', together:togetherBucket(daysWith(p)), known:!!p.known,
                        newborn:false };
  return fieldsHTML(draft, false) + '<button class="pp-b" id="pp-save">сохранить</button>' +
    '<div class="pp-note">Смена повадок меняет темп жизни и то, что питомец делает сам. Статы, возраст и привычки остаются.</div>';
}

function vpW(){ return window.innerWidth || 360; }
function vpH(){ return window.innerHeight || 640; }
function placeFab(){
  var el = document.getElementById('pp-fab'); if (!el) return;
  var pos = cfg().pos, w = 44, h = 44;
  var x = pos ? pos.x : 12, y = pos ? pos.y : (vpH() - h - 104);
  el.style.left = Math.max(6, Math.min(x, vpW() - w - 6)) + 'px';
  el.style.top  = Math.max(6, Math.min(y, vpH() - h - 6)) + 'px';
}
function placePanel(){
  var el = document.getElementById('pp-panel'); if (!el) return;
  var w = el.offsetWidth || 340, h = el.offsetHeight || 380;
  var pp = cfg().ppos;
  if (pp) {
    el.style.left = Math.max(4, Math.min(pp.x, vpW() - w - 4)) + 'px';
    el.style.top  = Math.max(4, Math.min(pp.y, vpH() - h - 4)) + 'px';
    return;
  }
  var fab = document.getElementById('pp-fab');
  var x = 10, y = Math.max(8, vpH() - h - 100);
  if (fab) {
    var r = fab.getBoundingClientRect();
    x = r.left + r.width/2 - w/2;
    y = r.top - h - 8;
    if (y < 8) {
      y = Math.min(r.bottom + 8, vpH() - h - 8);
      if (y + h > r.top && y < r.bottom) x = (r.left > vpW()/2) ? 8 : (vpW() - w - 8);
    }
  }
  el.style.left = Math.max(8, Math.min(x, vpW() - w - 8)) + 'px';
  el.style.top  = Math.max(8, Math.min(y, vpH() - h - 8)) + 'px';
}

function each(sel, fn){ if (!root) return; var l = root.querySelectorAll(sel); for (var i=0;i<l.length;i++) fn(l[i]); }
function fld(id){ var e = document.getElementById(id); return e ? e.value : null; }
function grab(){
  if (!draft) return;
  var v;
  if ((v = fld('pp-name'))  !== null) draft.name = v;
  if ((v = fld('pp-kind'))  !== null) draft.kind = v;
  if ((v = fld('pp-breed')) !== null) draft.breed = v;
  if ((v = fld('pp-age'))   !== null) draft.age = v;
  if ((v = fld('pp-icon'))  !== null) draft.icon = v;
  if ((v = fld('pp-desc'))  !== null) draft.desc = v;
  if (draft.archAuto) draft.arch = guessArch(draft.kind);
}
function grabModel(){
  var m = cfg().model || (cfg().model = { ep:'', model:'', key:'' }), v;
  if ((v = fld('pp-mep'))    !== null) m.ep = v;
  if ((v = fld('pp-mmodel')) !== null) m.model = v;
  if ((v = fld('pp-mkey'))   !== null) m.key = v;
}
function grabSync(){
  var s = sync(), v;
  if ((v = fld('pp-surl'))  !== null) s.url = v.trim();
  if ((v = fld('pp-snick')) !== null) s.nick = v.trim();
}

function bind(){
  dragger(document.getElementById('pp-drag'), document.getElementById('pp-panel'), null, 'ppos');
  var close = document.getElementById('pp-close');
  if (close) close.onclick = function(){ open = false; draft = null; adding = false; render(); };

  each('[data-go]', function(el){ el.onclick = function(){ view = el.getAttribute('data-go'); draft = null; adding = false; render(); }; });
  each('[data-tab]', function(el){ el.onclick = function(){
    if (tab === 'model') grabModel();
    tab = el.getAttribute('data-tab'); save(); render();
  }; });
  each('[data-act]', function(el){ el.onclick = function(){ if (!el.hasAttribute('disabled')) doAction(el.getAttribute('data-act')); }; });
  each('[data-sw]', function(el){ el.onclick = function(){ var k = el.getAttribute('data-sw'); cfg()[k] = (cfg()[k] === false); save(); render(); }; });
  each('[data-speed]', function(el){ el.onclick = function(){ cfg().speed = el.getAttribute('data-speed'); save(); render(); }; });
  each('[data-face]', function(el){ el.onclick = function(){ cfg().face = el.getAttribute('data-face'); save(); render(); }; });
  each('[data-mode]', function(el){ el.onclick = function(){ cfg().mode = el.getAttribute('data-mode'); moreOpen = false; save(); render(); }; });
  each('[data-more]', function(el){ el.onclick = function(){ moreOpen = true; render(); }; });
  each('[data-pet]', function(el){ el.onclick = function(){ setAct(el.getAttribute('data-pet')); save(); render(); }; });
  each('[data-add]', function(el){ el.onclick = function(){ adding = true; view = 'new'; draft = null; render(); }; });

  each('[data-skin]', function(el){ el.onclick = function(){
    var id = el.getAttribute('data-skin'), i;
    for (i=0;i<SKINS.length;i++) if (SKINS[i].id === id) {
      cfg().skin = { c1:SKINS[i].c1, c2:SKINS[i].c2, c3:SKINS[i].c3, alpha:SKINS[i].alpha, blur:SKINS[i].blur };
      break;
    }
    save(); render();
  }; });
  each('[data-skinreset]', function(el){ el.onclick = function(){ cfg().skin = defSkin(); save(); render(); flash('тема как была'); }; });

  ['pp-c1','pp-c2','pp-c3','pp-al','pp-bl'].forEach(function(id){
    var e = document.getElementById(id);
    if (!e) return;
    e.oninput = function(){
      var s = skin();
      if (id === 'pp-c1') s.c1 = e.value;
      else if (id === 'pp-c2') s.c2 = e.value;
      else if (id === 'pp-c3') s.c3 = e.value;
      else if (id === 'pp-al') s.alpha = parseInt(e.value,10);
      else s.blur = parseInt(e.value,10);
      var num = e.parentNode ? e.parentNode.querySelector('b') : null;
      if (num) num.textContent = e.value;
      applySkin(petOf());
      save();
    };
  });
  each('[data-respos]', function(el){ el.onclick = function(){ cfg().pos = null; cfg().ppos = null; save(); render(); flash('лапка и панель на месте'); }; });

  each('[data-emo-toggle]', function(el){ el.onclick = function(){ grab(); emoOpen = !emoOpen; render(); }; });
  each('[data-adv-toggle]', function(el){ el.onclick = function(){ grab(); advOpen = !advOpen; render(); }; });

  each('[data-arch]', function(el){ el.onclick = function(){
    grab();
    var v = el.getAttribute('data-arch');
    if (v === 'auto') { draft.archAuto = true; draft.arch = guessArch(draft.kind); }
    else { draft.archAuto = false; draft.arch = v; }
    render();
  }; });
  each('[data-tp]', function(el){ el.onclick = function(){ grab(); draft.temper = el.getAttribute('data-tp'); render(); }; });
  each('[data-stage]', function(el){ el.onclick = function(){ grab(); draft.stage = el.getAttribute('data-stage'); render(); }; });
  each('[data-icon]', function(el){ el.onclick = function(){ grab(); draft.icon = el.getAttribute('data-icon'); render(); }; });
  each('[data-owner]', function(el){ el.onclick = function(){ grab(); draft.owner = el.getAttribute('data-owner'); render(); }; });
  each('[data-together]', function(el){ el.onclick = function(){ grab(); draft.together = el.getAttribute('data-together'); render(); }; });
  each('[data-known]', function(el){ el.onclick = function(){ grab(); draft.known = !draft.known; render(); }; });
  each('[data-night]', function(el){ el.onclick = function(){
    grab();
    var v = el.getAttribute('data-night');
    draft.night = v === 'auto' ? null : (v === 'day');
    render();
  }; });

  var kindEl = document.getElementById('pp-kind');
  if (kindEl) kindEl.oninput = function(){ if (draft) { draft.kind = kindEl.value; if (draft.archAuto) draft.arch = guessArch(draft.kind); } };

  each('[data-poke]', function(el){
    el.onclick = function(){
      var p = petOf(); if (!p) return;
      if (sleeping(p)) { flash(p.name + ' спит'); return; }
      if (canWatch() && host().watcher) { watchNow(p); return; }
      if (!actSelf(true, p)) flash('питомцу нечего сказать');
      render();
    };
  });
  each('[data-test]', function(el){
    el.onclick = function(){
      grabModel(); save();
      if (!canWatch()) { flash('заполни эндпоинт, модель и ключ'); return; }
      watchNow().then(function(ok){ flash(ok ? 'наблюдатель ответил' : (W.err || 'не вышло')); });
    };
  });
  each('[data-del]', function(el){
    el.onclick = function(){
      if (!petOf()) return;
      if (isArmed('del')) {
        var gone = petOf(), gid = gone && gone._id;
        if (!gid) return;
        DB.pets[gid] = { del: true, ts: now(), mts: now(), ck: CK, name: gone.name || '' };
        if (actKey()[CK] === gid) delete actKey()[CK];
        disarm(); saveNow(); view = 'home'; draft = null; render(); flash('питомца больше нет');
      } else arm('del');
    };
  });

  ['pp-mep','pp-mmodel','pp-mkey'].forEach(function(id){
    var e = document.getElementById(id);
    if (e) e.oninput = function(){ grabModel(); save(); };
  });
  each('[data-mclr]', function(el){
    el.onclick = function(){
      if (!isArmed('mclr')) { arm('mclr'); return; }
      cfg().model = { ep:'', model:'', key:'' };
      W.err = ''; disarm(); saveNow(); render(); flash('модель очищена');
    };
  });
  var create = document.getElementById('pp-create');
  if (create) create.onclick = function(){
    grab();
    if (!draft.name.trim()) { flash('нужна кличка'); return; }
    if (!ckReady) { flash('секунду, ищу чат'); return; }
    var nickVal = fld('pp-snick');
    if (nickVal !== null) { sync().nick = nickVal.trim(); persist(); }
    draft.name = draft.name.trim();
    draft.kind = draft.kind.trim() || ARCH[draft.arch].label;
    draft.icon = draft.icon.trim() || '🐾';
    var id = newId(draft.name);
    DB.pets[id] = newPet(draft);
    DB.pets[id].ck = CK;
    logAdd(DB.pets[id], draft.known ? '🐾 взят под присмотр' : '🐾 появился в доме', true);
    setAct(id);
    draft = null; view = 'home'; adding = false; saveNow(); render();
  };
  var savebtn = document.getElementById('pp-save');
  if (savebtn) savebtn.onclick = function(){
    var p = petOf(); if (!p) return;
    grab();
    if (!draft.name.trim()) { flash('нужна кличка'); return; }
    p.name = draft.name.trim();
    p.kind = draft.kind.trim() || ARCH[draft.arch].label;
    p.arch = draft.arch; p.archAuto = draft.archAuto;
    p.temper = draft.temper; p.night = draft.night;
    p.breed = draft.breed.trim(); p.age = draft.age.trim(); p.desc = (draft.desc||'').trim();
    p.icon = draft.icon.trim() || '🐾';
    p.owner = OWNER[draft.owner] ? draft.owner : 'me';
    p.known = !!draft.known;
    var tg = togetherOf(draft.together);
    if (togetherBucket(daysWith(p)) !== draft.together) p.born = now() - tg.days*DAY;
    draft = null; view = 'home'; touch(p); saveNow(); render();
  };
}

function toggle(){
  open = !open;
  if (open) { view = petOf() ? 'home' : 'new'; draft = null; adding = false; markSeen(); }
  render();
}

var HAS_PTR = !!(window.PointerEvent);

function dragger(handle, box, onTap, posKey){
  if (!handle || !box) return;
  var sx=0, sy=0, ox=0, oy=0, moved=false, on=false, lastTouch=0, pid=null;

  function pt(e){ return (e.touches && e.touches.length) ? e.touches[0] : e; }
  function skip(e){
    if (e.type === 'mousedown' && (now() - lastTouch) < 900) return true;
    if (e.target && e.target.className && String(e.target.className).indexOf('pp-x') !== -1) return true;
    return false;
  }
  function start(e){
    if (on || skip(e)) return;
    if (e.type === 'touchstart' || e.pointerType === 'touch') lastTouch = now();
    var t = pt(e);
    on = true; moved = false; sx = t.clientX; sy = t.clientY;
    var r = box.getBoundingClientRect(); ox = r.left; oy = r.top;
    if (HAS_PTR && e.pointerId != null) {
      pid = e.pointerId;
      try { handle.setPointerCapture(pid); } catch(err){}
      document.addEventListener('pointermove', move, true);
      document.addEventListener('pointerup', end, true);
      document.addEventListener('pointercancel', end, true);
    } else {
      document.addEventListener('mousemove', move, true);
      document.addEventListener('touchmove', move, { passive:false, capture:true });
      document.addEventListener('mouseup', end, true);
      document.addEventListener('touchend', end, true);
    }
  }
  function move(e){
    if (!on) return;
    if (HAS_PTR && pid != null && e.pointerId != null && e.pointerId !== pid) return;
    var t = pt(e), dx = t.clientX - sx, dy = t.clientY - sy;
    if (!moved && (Math.abs(dx) + Math.abs(dy)) < 7) return;
    moved = true;
    if (e.cancelable) e.preventDefault();
    var r = box.getBoundingClientRect();
    var w = r.width || 44, h = r.height || 44;
    var x = Math.max(4, Math.min(ox + dx, vpW() - w - 4));
    var y = Math.max(4, Math.min(oy + dy, vpH() - h - 4));
    box.style.left = x + 'px'; box.style.top = y + 'px';
    if (posKey) cfg()[posKey] = { x:x, y:y };
  }
  function end(e){
    if (e && (e.type === 'touchend' || e.pointerType === 'touch')) lastTouch = now();
    if (HAS_PTR) {
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerup', end, true);
      document.removeEventListener('pointercancel', end, true);
      if (pid != null) { try { handle.releasePointerCapture(pid); } catch(err){} pid = null; }
    } else {
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('touchmove', move, true);
      document.removeEventListener('mouseup', end, true);
      document.removeEventListener('touchend', end, true);
    }
    if (!on) return;
    on = false;
    if (moved) { save(); if (box === fabEl) placePanel(); return; }
    if (onTap) onTap();
  }

  if (HAS_PTR) handle.addEventListener('pointerdown', start);
  else {
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive:true });
  }
}

function markSeen(){ var l = petsOf(CK), i; for (i=0;i<l.length;i++) l[i].seen = now(); }

function setCK(key){
  ckReady = true;
  if (key === CK) return;
  CK = key; draft = null; msgSince = 0;
  if (view === 'edit' || view === 'log') view = 'home';
  if (loaded) { tick(); render(); }
}
function resolveCK(){
  var chatId = null;
  try {
    var c = ctx();
    chatId = (typeof c.getCurrentChatId === 'function' ? c.getCurrentChatId() : null) || c.chatId;
  } catch(e){}
  setCK(chatId ? ('c' + chatId) : 'default');
}

function onMsg(){
  if (!alive() || !loaded) return;
  var p = petOf(); if (!p) { pushCtx(); return; }
  msgSince++;
  var event = tick();
  var h = host();

  var chat = ctx().chat;
  if (chat && chat.length) {
    var lastText = plain(chat[chat.length-1].mes || '');
    if (lastText) {
      var fired = false, list = petsOf(CK);
      for (var si=0; si<list.length; si++){
        if (checkScene(list[si], lastText)) { fired = true; event = true; }
      }
      if (!fired) { if (interactPets()) event = true; }
    }
  }

  var pre = h.every > 1 ? (h.every - 1) : 0;
  if ((msgSince % h.every) === pre) {
    var actor = pickActor();
    if (h.watcher && canWatch() && actor) watchNow(actor);
    else if (actSelf(true)) event = true;
  }
  markSeen();
  if (event) save(); else saveSoft();
  renderBg();
}

function mountSettings(){
  if ($('#pusya_pet_settings').length) return;
  var target = $('#extensions_settings2').length ? '#extensions_settings2' : '#extensions_settings';
  if (!$(target).length) return;

  var settingsHtml = '<div id="pusya_pet_settings">' +
    '<div class="inline-drawer">' +
    '<div class="inline-drawer-toggle inline-drawer-header">' +
    '<b>🐾 PUSYA PET</b>' +
    '<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>' +
    '<div class="inline-drawer-content">' +
    '<label><input type="checkbox" id="pp_st_inject"> Вставлять питомца в промпт</label>' +
    '<label><input type="checkbox" id="pp_st_watcher"> Наблюдатель (модель смотрит сцену)</label>' +
    '<label>Частота <select id="pp_st_every">' +
    '<option value="1">каждое сообщ.</option><option value="3">каждое 3-е</option>' +
    '<option value="5">каждое 5-е</option><option value="8">каждое 8-е</option>' +
    '</select></label></div></div></div>';

  $(target).append(settingsHtml);

  var es = ctx().extensionSettings;
  if (!es.pusya_pet) es.pusya_pet = {};
  var s = es.pusya_pet;
  if (s.inject === undefined) s.inject = true;
  if (s.watcher === undefined) s.watcher = true;
  if (s.every === undefined) s.every = 5;

  $('#pp_st_inject').prop('checked', s.inject).on('change', function(){
    s.inject = $(this).is(':checked');
    ctx().saveSettingsDebounced();
  });
  $('#pp_st_watcher').prop('checked', s.watcher).on('change', function(){
    s.watcher = $(this).is(':checked');
    ctx().saveSettingsDebounced();
  });
  $('#pp_st_every').val(String(s.every)).on('change', function(){
    s.every = parseInt($(this).val(), 10) || 5;
    ctx().saveSettingsDebounced();
  });
}

function boot(){
  mountSettings();

  root = document.createElement('div');
  root.id = ROOT_ID;
  document.body.appendChild(root);

  loadDB(function(){
    if (!alive()) return;
    resolveCK();
    tick();
    render();
    if (syncOn()) { cloudPull(); return; }
    var savedNick = lsGet(NICK_KEY) || '';
    if (savedNick && !syncOn()) {
      sync().nick = savedNick; persist();
      cloudPull(function(ok){ if (ok) { tick(); render(); } });
    }
  });

  var ev = ctx().eventSource, et = ctx().event_types;

  ev.on(et.CHAT_CHANGED, function(){
    if (alive() && loaded) resolveCK();
  });
  ev.on(et.MESSAGE_SENT, function(){
    if (alive() && loaded) onMsg();
  });
  ev.on(et.CHARACTER_MESSAGE_RENDERED, function(){
    if (alive() && loaded) onMsg();
  });
  ev.on(et.GENERATION_STARTED, function(){
    if (!alive() || !loaded) return;
    var list = petsOf(CK), i;
    for (i=0;i<list.length;i++) {
      list[i].pend = [];
      if (list[i].now) list[i].now.sent = true;
    }
    pushCtx();
    save();
  });

  setInterval(function(){
    if (!alive() || !loaded) return;
    var p = petOf(); if (!p) return;
    var event = tick();
    if (Math.random() < 0.09) { if (actSelf(false)) event = true; }
    if (event) save(); else saveSoft();
    renderBg();
  }, 60000);

  window.addEventListener('pagehide', function(){ saveNow(); cloudBeacon(); });
  window.addEventListener('beforeunload', function(){ saveNow(); cloudBeacon(); });
  window.addEventListener('resize', function(){ if (alive()) { placeFab(); if (open) placePanel(); } });
}

jQuery(function(){
  try { boot(); console.log('[PUSYA PET] v1.0 loaded'); }
  catch(e){ console.error('[PUSYA PET] init failed', e); }
});

})();
