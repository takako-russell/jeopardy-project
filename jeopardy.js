// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let newClueArray = [];
let storage = {};

const NUM_CATEGORIES = 5;
const CLUE_MAX = 5;

const headData = document.querySelector("#table-head");
const bodyData = document.querySelector("#table-body");
const startBtn = document.querySelector("button");

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
function getCategoryIds(length) {
  let ids = [];
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    let done = false;
    while (!done) {
      let num = Math.floor(Math.random() * length);
      if (!ids.includes(num)) {
        ids.push(num);
        done = true;
      }
    }
  }
  return ids;
}

async function listCategories() {
  const res = await axios.get("https://jservice.io/api/categories", {
    params: {
      count: 100,
    },
  });

  let filterCat = res.data.filter((x) => {
    return x.clues_count >= CLUE_MAX;
  });

  return filterCat;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(idNum) {
  const res = await axios.get("https://jservice.io/api/category", {
    params: {
      id: idNum,
    },
  });

  let singleCategory = {
    title: "",
    clues: [],
  };

  let storage = {};
  singleCategory.title = res.data.title;

  const clueArr = res.data.clues.slice(0, 5);
  clueArr.forEach((obj) => {
    storage.answer = obj.answer;
    storage.question = obj.question;
    storage.showing = null;
    singleCategory.clues.push(storage);
    storage = {};
  });

  return singleCategory;
}
/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(categories) {
  const newTr = document.createElement("tr");

  for (let i = 0; i < categories.length; i++) {
    const topRow = document.createElement("td");
    topRow.innerText = categories[i].title;

    newTr.appendChild(topRow);
    headData.appendChild(newTr);
  }

  for (let y = 0; y <= CLUE_MAX; y++) {
    const mainRow = document.createElement("tr");

    for (let x = 0; x < NUM_CATEGORIES; x++) {
      const mainData = document.createElement("td");
      mainData.setAttribute("id", `${y}-${x}`);
      mainData.innerHTML = "?";

      mainData.addEventListener("click", function (e) {
        handleClick(e.target);
      });
      mainRow.appendChild(mainData);
    }
    bodyData.appendChild(mainRow);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

// async function fillTable(e) {
//   if (e.target.showing === null) {
//     e.target.showing = question;
//   }
// }

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(val) {
  const idArr = val.id.split("-");
  [y, x] = [idArr[0], idArr[1]];
  //   console.log(categories);
  //   console.log(categories[x].clues[y].showing);
  //   console.log(categories[x].clues[y].question);
  const clickedClue = categories[x].clues[y];
  if (clickedClue.showing === null) {
    val.innerHTML = clickedClue.question;
    clickedClue.showing = "question";
  } else if (clickedClue.showing === "question") {
    val.innerHTML = clickedClue.answer;
  } else {
    return;
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  startBtn.style.display = "none";
  document.getElementById("load").classList.add("loading");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  document.getElementById("load").classList.remove("loading");
  startBtn.style.display = "";
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let allCategories = await listCategories();
  showLoadingView();
  let indexes = getCategoryIds(allCategories.length);
  let ids = [];

  for (let indx of indexes) {
    //getCategory(allCategories[id].id);
    ids.push(allCategories[indx].id);
  }
  for (let id of ids) {
    categories.push(await getCategory(id));
  }
  console.log(categories);
  //   console.log(categories);
  fillTable(categories);
  hideLoadingView();
}
/** On click of start / restart button, set up game. */

/** On page load, add event handler for clicking clues */

startBtn.addEventListener("click", function () {
  setupAndStart();
  startBtn.innerHTML = "restart game";
});
