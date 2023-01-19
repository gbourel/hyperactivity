import marked from "marked";
import markedKatex from "marked-katex-extension";
import { classy } from "./js/classy.mjs";

marked.use(markedKatex({ throwOnError: false }));
marked.use(classy());

const _context = {
  currentQuestion: 0, // current question index (0 based)
};

window.onpopstate = (evt) => {
  stopAudio();
  _context.currentQuestion = evt.state ? evt.state.question : 0;
  displayQuestion();
}
window.onload = () => {
  let m = location.hash.match(/#q(\d+)/);
  if(m){
    _context.currentQuestion = parseInt(m[1])-1;
  }
  displayQuestion();
}

/**
 * Passe à la question suivant la question courante.
 */
function nextQuestion() {
  stopAudio();
  _context.currentQuestion++;
  history.pushState({ 'question': _context.currentQuestion }, '', `#q${_context.currentQuestion+1}`);
  displayQuestion();
}


let audioState = {
  playing: false,
  audio: null
}
function playAudio(filename) {
  console.info('play', filename);
  if (audioState.playing) {
    stopAudio();
  } else {
    audioState.playing = true;
    if(!audioState.audio) {
      let url = `https://filedn.com/lodBnQeoCYyQxKkBA3pJTFb/audio/${filename}`;
      audioState.audio = new Audio(url);
      audioState.audio.addEventListener("canplaythrough", (event) => {
        audioState.audio.play();
      });
    } else {
      audioState.audio.currentTime = 0;
      audioState.audio.play();
    }
  }
}

function stopAudio() {
  if(audioState.audio) {
    audioState.audio.pause();
    audioState.playing = false;
  }
}

let title = "Mouvements et vitesses"

/**
 * Affichage de la question à l'index `currentQuestion`.
 */
function displayQuestion() {
  const q = questions[_context.currentQuestion];
  const mainQuestion = document.querySelector("main .question");
  const template = document.querySelector("#question");
  const clone = template.content.cloneNode(true);

  audioState.playing = false;
  audioState.audio = null;
  while (mainQuestion.lastChild) {
    mainQuestion.removeChild(mainQuestion.lastChild);
  }

  clone.querySelector(".q-title").innerHTML = title || `Question ${_context.currentQuestion + 1} / ${questions.length}`;
  clone.querySelector(".q-instruction").innerHTML = marked.parse(q.instruction);
  if(q.audio) {
    let img = document.createElement('img');
    img.classList.add('audio');
    img.src = new URL('./img/audio.svg', import.meta.url);
    img.addEventListener('click', () => { playAudio(q.audio); });
    clone.querySelector(".q-instruction").appendChild(img);
  }

  if(q.type === 'QCU') {
    const answersElt = document.createElement("ul");
    for (let p of parseQCUProposals(q.proposals)) {
      if (p && p.length > 0) {
        const a = document.createElement("li");
        a.classList.add("answer");
        a.textContent = p;
        a.onclick = nextQuestion;
        answersElt.appendChild(a);
      }
    }
    clone.querySelector(".q-answers").appendChild(answersElt);
    clone.querySelector(".q-footer").classList.add('hidden');
  } else if(q.type === 'QROC' || q.type === 'QROCM') {
    const answersElt = clone.querySelector(".q-answers");
    for (let p of parseQROCProposals(q.proposals)) {
      if (p && p.length > 0) {
        const answer = document.createElement("div");
        answer.classList.add("qroc-answer");
        const label = document.createElement("span");
        label.innerHTML = marked.parseInline(p);
        answer.appendChild(label);
        const input = document.createElement("input");
        answer.appendChild(input);
        answersElt.appendChild(answer);
      }
    }
    clone.querySelector(".q-footer").classList.remove('hidden');
  }
  clone.querySelector(".q-footer button.valid").onclick = nextQuestion;

  mainQuestion.replaceChildren(clone);
}

function parseQCUProposals(proposals) {
  let list = proposals.split("\n");
  return list.map((val) => {
    if (!val || !val.length) {
      return null;
    }
    val = val.trim();
    if (val && val.startsWith("- ")) {
      val = val.substring(2);
    }
    return val;
  });
}

function parseQROCProposals(proposals) {
  let list = proposals.split("\n");
  return list.map((val) => {
    if (!val || !val.length) {
      return null;
    }
    val = val.trim();
    if (val && val.startsWith("- ")) {
      val = val.substring(2);
    }
    console.info(val);
    return val;
  });
}

const questions = [
  {
    instruction:
      "### Le mouvement\n\n" +
      "L'animation ci-dessous représente un avion piloté par un singe qui a l'air très content.\n\n" +
      "Mais l'avion affiché dans cette animation est-il en **mouvement** ?\n\n" +
      '<div class="drawer"><animation-drawer type="plane"></animation-drawer></div>\n',
    audio: 'q1.opus',
    proposals: "- Oui\n- Non\n- On ne sait pas\n",
    solution: "3",
    type: "QCU",
  },
  {
    instruction:
      "### Mouvement encore\n\n" +
      "Voici à nouveau le même avion toujours piloté par le même singe, cette fois peut-on dire que l'avion est en **mouvement** ?\n\n" +
      '<div class="drawer"><animation-drawer type="plane_moving"></animation-drawer></div>\n',
    audio: 'q2.opus',
    proposals: "- Oui\n- Non\n- On ne sait pas\n",
    solution: "1",
    type: "QCU",
  },
  {
    instruction:
      "### La vitesse\n\n" +
      "Un solide est en mouvement par rapport à un **repère de référence**. Ainsi, ici par exemple, nous voyons que l'avion se déplace par rapport aux nuages.\n\n" +
      "Cet avion mesure 7,04 m de longueur.\n\n" +
      "Puisque l'avion est en mouvement, peut-on déterminer **sa vitesse** ? (en mètre par seconde)\n\n" +
      '<div class="drawer"><animation-drawer type="plane_moving"></animation-drawer></div>\n',
    audio: 'q3.opus',
    proposals: "- Oui\n- Non\n- On ne sait pas\n",
    solution: "2",
    type: "QCU",
  },
  {
    instruction:
      "### Représentation du temps\n\n" +
      "En mécanique le temps est considéré comme absolu et uniforme. Chaque fragment de temps est identique au suivant. On le schématise par une droite orientée de gauche à droite, du passé vers le futur. Si une origine est nécessaire elle sera nommée : t<sub>0</sub> pour t = 0\n\n" +
      "La représentation graphique de l'évolution temporelle d'une valeur est appelée **chronogramme**.\n\n" +
      "![](https://filedn.com/lodBnQeoCYyQxKkBA3pJTFb/img/planeur.jpg){width=128px .pull-right}\n\n" +
      "Le **chronogramme** ci-dessous représente l'altitude d'un planeur léger lancé à la main.\n\n" +
      "Une fois lancé le planeur prends de l'altitude grâce à **l'énergie cinétique** obtenue lors du lancé, plane un moment puis retombe au sol.\n\n" +
      "Par lecture graphique, déterminer à quel **instant t** le planeur touche le sol dans cet exemple ?" +
      '<div class="drawer"><animation-drawer type="time_plot"></animation-drawer></div>\n\n',
    audio: 'q4.opus',
    proposals: "- 0s\n- 1,2s\n- 2,5s\n- 5,2s\n- 10,8s\n- 11,2s\n-14s\n- 15s",
    solution: "5",
    type: "QCU",
  },
  {
    instruction:
      "### Vitesse moyenne\n\n" +
      "Un mouvement particulier est le mouvement de **translation rectiligne**. Ce mouvement correspond à un solide qui se déplace en ligne droite. Pour ce type de mouvement il est possible de calculer simplement une **vitesse moyenne**.\n\n" +
      "\n\n" +
      "La **vitesse moyenne** est calculée avec : $$v_{moy} = \\dfrac{\\Delta x}{\\Delta t}$$\n\n" +
      "Avec:\n" +
      " * $\\Delta x$ : la différence de position entre le début et la fin (en mètres)\n" +
      " * $\\Delta t$ : la différence de temps entre le début et la fin (en secondes)\n\n" +
      // "![](https://filedn.com/lodBnQeoCYyQxKkBA3pJTFb/img/planeur.jpg){width=128px .pull-right}\n\n" +
      // "Le **chronogramme** ci-dessous représente l'altitude d'un planeur léger lancé à la main.\n\n" +
      // "Une fois lancé le planeur prends de l'altitude grâce à **l'énergie cinétique** obtenue lors du lancé, plane un moment puis retombe au sol.\n\n" +
      // "Par lecture graphique, déterminer à quel **instant t** le planeur touche le sol dans cet exemple ?" +
      '<div class="drawer"><animation-drawer type="plane_linear"></animation-drawer></div>\n\n'
      ,
    audio: 'q5.opus',
    proposals: "Temps de vol : $\\Delta t$ =\n" +
      "Distance parcourue : $\\Delta x$ =",
    solution: "3000 50",
    type: "QROCM",
  },
  {
    instruction:
      "![](https://filedn.com/lodBnQeoCYyQxKkBA3pJTFb/img/car_road.jpg){.pull-right width=160px}\n\n" +
      "### Calcul d'une vitesse\n\n" +
      "Sur un tronçon d’autoroute parfaitement rectiligne, un véhicule parcourt 5 km en 3 minutes et 20 secondes.\n\n" +
      "Quelle est-la vitesse moyenne du véhicule  :\n",
    proposals:
      "- 30 km/h\n- 60 km/h\n- 90 km/h\n- 100 km/h\n- 110 km/h\n- 120 km/h\n- 150 km/h\n- On ne sait pas",
    type: "QCU",
    solution: "3",
    t1Status: false,
    t2Status: false,
    t3Status: false,
    embedHeight: 550,
    format: "mots",
    autoReply: false,
    status: "validé",
    difficulty: 2,
    enabled: false,
    skillId: "d62090ac-a701-4eba-8699-d0fd19ed2737",
    embedUrl: null,
    python: false,
    tests: "",
    amc: null,
    competenceId: "8bb4916b-e41f-4848-9d9b-57a9798e6fdd",
    locales: ["fr", "fr-fr"],
    focusable: false,
  },
];

