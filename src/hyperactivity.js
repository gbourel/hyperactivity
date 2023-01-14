import { Drawer, Slider } from "./js/drawer.js";
import { draw_plane, draw_movingPlane } from "./js/plane.js";

// new Drawer(document.getElementById("plane_drawer"), draw_plane);
// new Drawer(document.getElementById("question"), draw_movingPlane);

const _context = {
  currentQuestion: 0   // current question index (0 based)
};

function displayQuestion() {
  const q = questions[_context.currentQuestion];
  const mainQuestion = document.querySelector("main .question");
  const template = document.querySelector("#question");
  const clone = template.content.cloneNode(true);

  // clone.querySelector('.q-title').textContent = 'Pourquoi ?';
  clone.querySelector(".q-instruction").innerHTML = marked.parse(q.instruction);
  const answersElt = document.createElement("ul");
  for (let p of parseProposals(q.proposals)) {
    if (p && p.length > 0) {
      const a = document.createElement("li");
      a.classList.add("answer");
      a.textContent = p;
      answersElt.appendChild(a);
    }
  }
  clone.querySelector(".q-answers").appendChild(answersElt);
  clone.querySelector('.q-footer button.valid').onclick = () => {
    _context.currentQuestion++;
    displayQuestion();
  }

  mainQuestion.replaceChildren(clone);
}

function parseProposals(proposals) {
  let list = proposals.split("\n");
  return list.map(val => {
    if(!val || !val.length) { return null; }
    val = val.trim()
    if (val && val.startsWith('- ')) {
      val = val.substring(2);
    }
    return val;
  });
}

const questions = [
  {
    instruction: "L'avion dessiné ci-dessous est-il en mouvement ?",
    proposals:
      "- Oui\n- Non\n- On ne sait pas\n",
    type: "QCU",
    solution: "6",
  },
  {
    id: "b6272676-6a3f-40b6-97d0-e958da228bac",
    instruction: "Pour encoder un nombre en **complément à deux** il faut :",
    proposals:
      "- Convertir la valeur absolue multipliée par 2 et inverser bit à bit\n- Remplacer le premier chiffre binaire par 1\n- Ajouter 2\n- Convertir la valeur absolue et inverser le résultat bit à bit\n- Diviser par 2 jusqu'à obtenir 1 et noter la suite de chiffres obtenue\n- Convertir la valeur absolue, inverser le résultat bit à bit et ajouter 1",
    type: "QCU",
    solution: "6",
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

displayQuestion(0);

