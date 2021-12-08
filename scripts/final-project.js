'use strict';

/* GENERAL REQUIREMENTS
Details for the rules and requirements of each game will be provided on the following pages, but no matter which game you implement:
[x] The game page should be carefully designed and styled with CSS to present a high-quality user experience. Submitting a project with poor or little styling will result in a greatly reduced final mark.
[x] There must be at least 6 images used.
[x] All paths used in HTML, CSS and Javascript files must be relative paths. Do NOT use server root paths that begin with / or client specific paths like C:/
[x] HTML, CSS and Javascript files must be free of serious errors (warnings are ok).
[x] Code must be well tabbed and use descriptive variable names.
[x] Javascript code must include the use of one or more functions authored by you, and one or more Objects authored by you.
[x] Must include at least one Javascript animation (for example, a fade in effect).
[x] jQuery may be used if desired.
[x] CSS should be compiled from SASS. SASS file(s) should demonstrate the use of SASS variables and at least one SASS mixin. Both .css and .scss files should be included with the project submission.
[x] Project must be published to a public repository on Github.com
*/

/* HANGMAN GAME REQUIREMENTS
Create your own version of the standard hangman game.
[x] The hangman game should randomly select a word and hint from a collection of words and helpful hints.
[x] The user must guess the correct word by entering letters into an input box.
[x] If the user guesses a letter that is contained in the selected word than the game should display the correctly guessed letters in the position of the word where they are located.
[x] If the user makes an incorrect guess, then the program should display part of the hangman graphic.
[x] After the user guesses a letter, disable the option so they cannot choose the same letter more than once per game.
[x] If the user makes too many incorrect guesses and the entire hangman graphic is displayed, then the user loses the game. Most hangman games allow 6 incorrect guesses
[x] If the user correctly guesses all the letters in the selected word than the user wins the game.
[x] When the game is over either from making too many incorrect guesses or correctly guessing the word, then the game should display the results (Tell them if they Won or Lost the game) and give the user the option to ‘Play Again’.
[x] When a game is over, ensure the user cannot keep guessing letters, but must choose a ‘Play Again’ option before they can play a new game.
[x] If the user chooses to ‘Play Again’, reset everything (eg enable all buttons), and start a new game.
*/

// Image Path Variables
const imagesPath    = 'images/';
const hangmanPath  = imagesPath + 'hangman-states/';

// Query elements
const $toolTip          = $('#tooltip');
const $btnStartAnim     = $('#start-btn');
const $btnStopAnim      = $('#stop-btn');
const $btnCloseTooltip  = $('#close-tooltip');
const $overlayToolTip   = $('#overlay-tooltip');
const $alphabetButtons  = $('#alphabet-buttons');
const $hangmanWord      = $('#hangman-word');
const $hangmanHint      = $('#hangman-hint');
const $hangmanGuess     = $('#hangman-guesses');
const $hangmanImage     = $('#hangman-img');

// Animation handler
let hangmanImageAngle = 0;
let productAnimation;
let isAnimated = true;
let fps = 30;


// Hangman Data
const wordHintDict = { "dog": "Man's Best Friend",
                       "giraffe": "Long neck",
                       "watermelon": "Green Watery Fruit",
                       "computer": "You are likely using it now!",
                       "webcam": "You need it to see your online friends",
                       "javascript": "Interesting programming language",
                       "fish": "It lives in the water",
                     };


/* Basic Functions */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Rotating Animation
function startHangmanImageAnimation(){
  hangmanImageAngle += 1;
  $hangmanImage.rotate(hangmanImageAngle);

  if (isAnimated === true) {
    setTimeout(function(){ //throttle requestAnimationFrame to fps variable
      productAnimation = requestAnimationFrame(startHangmanImageAnimation);
    }, 1000/fps);
  } else {
    $hangmanImage.rotate({animateTo:0});
    hangmanImageAngle = 0;
  }
};


/* Game Object */
class HangmanGame {
  constructor(wordHintDictionary){
    this.hasFoundTheWord = false;
    this.wordHintDictionary = wordHintDictionary;
    this.alphabetLetters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    this.guessedLetters = [];
    this.guessesLeft = 6;
    this.resetGame();
    this.updateImage();
    this.insertAlphabetLetters();
    this.updateHiddenWord();
  };

  resetGame(){
    this.hasFoundTheWord = false;
    this.word = Object.keys(this.wordHintDictionary)[Math.floor(Math.random() * Object.keys(this.wordHintDictionary).length)]
    this.hint = this.wordHintDictionary[this.word];
    this.guessedLetters = [];
    this.guessesLeft = 6;
    $alphabetButtons.empty();
    this.insertAlphabetLetters();
    this.updateHiddenWord();
    this.updateImage();
    $hangmanHint.text(`Word hint: ${this.hint}`);
    this.updateGuessesLeft();
    isAnimated = true;
  };

  winGame(){
    
    isAnimated = false;
    $hangmanHint.text(`You win! Congratulations! 🎉`);
    this.insertResetButton();
    
  };

  loseGame(){
    isAnimated = false;
    $hangmanHint.text(`You lose! The word was: ${this.word}`);
    this.insertResetButton();
  };

  updateGuessesLeft(){
    $hangmanGuess.html(`You have <b>${this.guessesLeft}</b> guesses left.`);
  };

  updateImage(isWin){
    if (isWin){
      $hangmanImage.attr('src', hangmanPath + "hangman-state-win.gif");
    } else {
      $hangmanImage.attr('src', hangmanPath + "hangman-state-0" + String(this.guessesLeft) + ".gif");
    };
  };


  disableLetterButtons(){
    this.alphabetLetters.forEach((letter)=>{
      if (this.guessedLetters.includes(letter) != true){
        $('#btn_' + letter).addClass('btn-disabled-override-colored'); // Disable unused buttons
      };
    });
  };

  updateHiddenWord(){
    // Update Hidden Word
    let hiddenWord = '';
    Array.from(this.word).forEach((letter)=>{
      if (this.guessedLetters.includes(letter) == true){
        hiddenWord += letter;
      } else {
        hiddenWord += '_';
      };
      hiddenWord += ' ';
    });
    $hangmanWord.text(hiddenWord);

    // Check if the user won
    if (hiddenWord.replace(/ /g, "") == this.word){
      this.hasFoundTheWord = true;
    } 
  };

  guessLetter(letter){ 
    $('#btn_' + letter).addClass('btn-disabled-override'); 
    this.guessedLetters.push(letter);

    if (this.word.includes(letter) == false){
      this.guessesLeft--;
    }
    this.updateCurrentWordStatus()
  };

  updateCurrentWordStatus(){
    // HTML Updates
    this.updateGuessesLeft();
    this.updateHiddenWord();
    this.updateImage(false);

    // Update Hidden Word and Check if the user won
    if (this.hasFoundTheWord) {
      this.disableLetterButtons()
      this.winGame();
      this.updateImage(true);
      return true;
    }

    // Overall Status
    if(this.guessesLeft === 0){
      this.disableLetterButtons()
      this.loseGame();
      return false
    };
  };

  insertAlphabetLetters(){
    $alphabetButtons.empty();
    this.alphabetLetters.forEach((letter)=>{
        $alphabetButtons.append(`<button class="btn-alphabet-letter" id="btn_${letter}" onClick="guess('${letter}')">${letter.toUpperCase()}</button>`);
    });
  };

  insertResetButton(){
    $hangmanGuess.html(`<button class="btn-reset action-button" onClick="resetGame()">Play Again!</button>`);
  };
};


/* Create a game and initialize it */
const hangmanGame = new HangmanGame(wordHintDict);

/* Guess function (Used by the letters) */
function guess(string){
  hangmanGame.guessLetter(string);
};

/* Guess function (Used by the letters) */
function resetGame(){
  hangmanGame.resetGame();
  startHangmanImageAnimation();
};

/* Start animation */
startHangmanImageAnimation();




/*
------------------- Other JavaScript elements, unrelated to assignment requirements -------------------
*/
const modal = document.querySelector('.modal-about');
const overlay = document.querySelector('.overlay');
const btnCloseAbout = document.querySelector('.close-about');
const btnsOpenAbout = document.querySelectorAll('#show-about');

// Open About
const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

// Close About
const closeAbout = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// Add eventListener to about button
btnsOpenAbout[0].addEventListener('click', openModal);

// Close About when clicking outside, on close or pressing escape (Esc)
btnCloseAbout.addEventListener('click', closeAbout);
overlay.addEventListener('click', closeAbout);

document.addEventListener('keydown', function (e) {
  // console.log(e.key);
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeAbout();
  }
});