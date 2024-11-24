function inti() {
   const re = window.SpeechRecognition || window.webkitSpeechRecognition;
   if (!re) {
       alert("Speech recognition not supported!");
       return;
   }

   reco = new webkitSpeechRecognition();
   reco.continuous = true;
   reco.lang = 'en-US';
   reco.interimResults = false;

   const box = document.querySelector(".box");
   let flag = false;
   let space = 0;
   const maxspace = box.offsetWidth;

   let currentrow = createrow(flag);
   box.appendChild(currentrow);

   const playerList = JSON.parse(sessionStorage.getItem("playerNames")) || ["Player1", "Player2", "Player3"];
   let len = playerList.length;
   let playerIndex = 0;

   let memory = [];
   let countword = 0;
   let wordIndex = 0;
   let isAddingNewWord = true; // Track if the player is adding a new word
   reco.start();

   function nextPlayer() {
       if (len === 1) {
           alert(`Game Over! Winner: ${playerList[0]}`);
           return;
       }

       const currentPlayer = playerList[playerIndex];
       highlightplayer(playerIndex);
       

       reco.onresult = function (event) {

           if (isAddingNewWord) {
            const word = event.results[event.results.length - 1][0].transcript.trim();
               // Add the new word to the memory array
               const newboxWidth = 120 + 40; // New box + gap
               if (newboxWidth + space > maxspace - 40) {
                   flag = !flag;
                   currentrow = createrow(flag);
                   box.appendChild(currentrow);
                   space = 0;
               }
               space += newboxWidth;
               addnewbox(word, currentrow);
               memory[countword] = word;
               countword++;
               isAddingNewWord = false; // Reset the flag
               playerIndex = (playerIndex + 1) % len;
               wordIndex=0;
               nextPlayer(); // Move to the next player
               return;
           }

           if (wordIndex >= memory.length) {
               // Player completed all matches, now prompt for a new word
               isAddingNewWord = true;
               alert(`${currentPlayer}, say a new word to add to the sequence!`);
           } else {
            const word = event.results[event.results.length - 1][0].transcript.trim();
               const expected = memory[wordIndex].toLowerCase();
               if (word.toLowerCase() === expected) {
                   wordIndex++;
               } else {
                   // Player is eliminated
                   alert(`${currentPlayer} failed!`);
                   playerList.splice(playerIndex, 1);
                   
                   len--;
                   wordIndex = 0;
                   if(playerIndex>=len){
                     playerIndex=0;
                   }
                   removeHighlight();
                   highlightplayer(playerIndex);
                   nextPlayer();
                   return;
               }
           }

           // If all words matched, move to the next player (handled above)
       };

       reco.onerror = function (event) {
           alert(`Speech recognition error: ${event.error}`);
       };
   }

   nextPlayer();
}

function highlightplayer(index) {
   const playerBoxes = document.querySelectorAll('.name-box');
   playerBoxes.forEach((box, i) => {
       if (i === index) {
           box.classList.add('highlight');
       } else {
           box.classList.remove('highlight');
       }
   });
}

function removeHighlight() {
   const playerBoxes = document.querySelectorAll('.name-box');
   playerBoxes.forEach((box) => {
       box.classList.remove('highlight');
   });
}

function createrow(flag) {
   const r = document.createElement("div");
   r.className = "row";
   r.style.flexDirection = flag ? "row-reverse" : "row";
   return r;
}

function addnewbox(word, currentrow) {
   const newbox = document.createElement("div");
   newbox.className = "new-box";
   newbox.textContent = word;
   currentrow.appendChild(newbox);
}

document.addEventListener("DOMContentLoaded", () => {
   inti();
});
