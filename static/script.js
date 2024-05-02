const numLetters = 5; // The number of letters in the word
let guessableWords; // An array to store the guessable words
let answerWords; // An array to store the answer words
let randomAnswer; // The randomly chosen answer word
let numGuesses = 6; // The number of guesses the player has
let username = ""; // The username of the player
let currGuess = 0; // The current guess the player is on
let finalSubmit = false; // A variable to check when the player has submitted their last guess

// Read the guessable words from a text file
fetch('../static/guessable_words.txt')
    .then(response => response.text())
    .then(data => {
        guessableWords = data.split('\n').map(word => word.trim());
        console.log('Guessable words:', guessableWords);
    })
    .catch(error => {
        console.error('Error reading guessable words:', error);
    });

// Read the answer words from a text file
fetch('../static/answer_words.txt')
    .then(response => response.text())
    .then(data => {
        answerWords = data.split('\n').map(word => word.trim());
        console.log('Answer words:', answerWords);
        // Choose a random answer
        let randomIndex = Math.floor(Math.random() * answerWords.length);
        randomAnswer = answerWords[randomIndex];
        console.log('Chosen Answer:', randomAnswer);
    })
    .catch(error => {
        console.error('Error reading answer words:', error);
    });

$(document).ready(function () {

    // Dark mode switch
    $('#darkModeSwitch').on('change', function() {
        if ($(this).is(':checked')) {
            $('html').attr('data-bs-theme', 'dark');
            if ($('.modal-symbol').hasClass('btn-light')) {
                $('.modal-symbol').removeClass('btn-light').addClass('btn-dark');
            }
            letterBoxes = document.getElementsByClassName("square-input");
            for (let i = 0; i < letterBoxes.length; i++) {
                if (letterBoxes[i].classList.contains("bg-light")) {
                    letterBoxes[i].classList.remove("bg-light");
                    letterBoxes[i].classList.add("bg-dark");
                }
            }
        } else {
            $('html').attr('data-bs-theme', 'light');
            if ($('.modal-symbol').hasClass('btn-dark')) {
                $('.modal-symbol').removeClass('btn-dark').addClass('btn-light');
            }
            letterBoxes = document.getElementsByClassName("square-input");
            for (let i = 0; i < letterBoxes.length; i++) {
                if (letterBoxes[i].classList.contains("bg-dark")) {
                    letterBoxes[i].classList.remove("bg-dark");
                    letterBoxes[i].classList.add("bg-light");
                }
            }
        }
    });

    $('#levelModal').modal('show');

    // dont let close modal until username is entered, show alert
    $('#levelModal').on('hide.bs.modal', function (e) {
        if ($('#floatingInput').val() === "") {
            e.preventDefault();
        }
    });

    // When the modal is hidden, set isModalOpen to false
    $('#levelModal').on('hidden.bs.modal', function () {
        $('#questionModal').modal('show');
    });

    
    $('#leaderboardModal').on('show.bs.modal', function () {
        $.ajax({
            url: '/get_leaderboard',
            type: 'GET',
            success: function (data) {
                // Create HTML for the leaderboard
                var leaderboardHtml = '<table style="width: 100%; text-align: center; margin: 0 auto;">';
                for (var i = 0; i < data.length; i++) {
                    leaderboardHtml += '<tr><td>#' + (i + 1) + '</td><td>' + data[i][0] + '</td><td>' + data[i][1] + '</td></tr>';
                    if (i < data.length - 1) {
                        leaderboardHtml += '<tr><td colspan="3"><hr></td></tr>';
                    }
                }
                leaderboardHtml += '</table>';

                // Update the HTML of the leaderboardData element with the leaderboard data
                $('#leaderboardData').html(leaderboardHtml);
            }
        });
    });
    

    // get level modal input and save username and level
    $('#playButton').click(function () {
        username = $('#floatingInput').val();
        if (username === "") {
            alert("Please enter a username.");
            return;
        }
        else if (username.length > 20) {
            alert("Username must be less than 20 characters.");
            return;
        }

        let level = $('input[name="btnradio"]:checked').next().text();
        if (level === "Easy") {
            numGuesses = 6;
        } else if (level === "Medium") {
            numGuesses = 5;
        } else if (level === "Hard") {
            numGuesses = 4;
        } else if (level === "Impossible") {
            numGuesses = 3;
        }

        // save username to leaderboard db if it doesn't exist and save level
        $.ajax({
            type: "POST",
            url: "/save_username",
            data: {
                'username': username,
            },
            success: function (response) {
                console.log(response);
            }
        });

        console.log("Username:", username);
        console.log("Level:", level);
        $('#levelModal').modal('hide');
        $('#questionModal .modal-body h5').text(`Guess the Wordle in ${numGuesses} tries.`);

        // Generate the HTML for the board
        let html = '';
        for (let i = 0; i < numGuesses; i++) {
            html += `
        <div class="d-flex justify-content-center">
            <form action="">
                <div class="row" id="row${i}">
                    <div class="col p-1">
                        <input type="text" maxlength="1"
                            class="form-control shadow-none text-uppercase text-center bg-dark square-input" placeholder="" disabled readonly>
                    </div>
                    <div class="col p-1">
                        <input type="text" maxlength="1"
                            class="form-control shadow-none text-uppercase text-center bg-dark square-input" placeholder="" disabled readonly>
                    </div>
                    <div class="col p-1">
                        <input type="text" maxlength="1"
                            class="form-control shadow-none text-uppercase text-center bg-dark square-input" placeholder="" disabled readonly>
                    </div>
                    <div class="col p-1">
                        <input type="text" maxlength=""
                            class="form-control shadow-none text-uppercase text-center bg-dark square-input" placeholder="" disabled readonly>
                    </div>
                    <div class="col p-1">
                        <input type="text" maxlength="1"
                            class="form-control shadow-none text-uppercase text-center bg-dark square-input" placeholder="" disabled readonly>
                    </div>
                </div>
            </form>
        </div>
        `;
        }

        // Replace the contents of the form with the new HTML
        $('#board').html(html);
    });
});

let guesses = [];
for (let i = 0; i < numGuesses; i++) {
    guesses.push("");
}

function keyboardHandler(input) {
    // Check if the key is "Enter" or "Backspace"
    // If any modal is open, ignore the key press
    if ($('#levelModal').hasClass('show') || $('#questionModal').hasClass('show') || $('#leaderboardModal').hasClass('show') || $('#settingsModal').hasClass('show')) {
        return;
    } else {
        if (input.key === "Enter") {
            if (currGuess < numGuesses) {
                if (guesses[currGuess].length === numLetters && guessableWords.includes(guesses[currGuess])) {
                    if (guesses[currGuess].toLowerCase() == randomAnswer.toLowerCase()) {
                        for (let i = 0; i < numLetters; i++) {
                            let letterBoxes = document.getElementsByClassName("square-input");
                            letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                            letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                            letterBoxes[currGuess * numLetters + i].classList.add("bg-success");
                            letterBoxes[currGuess * numLetters + i].classList.add("border-success");

                            // change keyboard letter color
                            let letterButtons = document.getElementsByClassName("letter-button");
                            for (let j = 0; j < letterButtons.length; j++) {
                                if (letterButtons[j].textContent.toLowerCase() === guesses[currGuess][i]) {
                                    // remove all possible colors
                                    letterButtons[j].classList.remove("btn-secondary");
                                    letterButtons[j].classList.remove("btn-warning");
                                    letterButtons[j].classList.remove("btn-danger");
                                    letterButtons[j].classList.add("btn-success");
                                }
                            }
                        }

                        let alert = $('<div class="alert alert-success fade show text-center" role="alert">')
                            .text('Congratulations!');

                        // Add the alert to the DOM
                        $('body').prepend(alert);
                        setTimeout(function () {
                            alert.alert('close');
                        }, 1500);
                        finalSubmit = true;

                        // update leaderboard
                        $.ajax({
                            type: "POST",
                            url: "/update_leaderboard",
                            data: {
                                'username': username,
                            },
                            success: function (response) {
                                console.log(response);
                                // send leaderboard to the API specified in the project description
                                $.ajax({
                                    type: "POST",
                                    url: "/send_leaderboard",
                                    success: function (response) {
                                        console.log(response);
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.error(textStatus, errorThrown);
                                    }
                                });
                            }
                        });

                        setTimeout(function () {
                            location.reload();
                        }, 3000);

                    } else {
                        // go through each letter input and match with the answer and change input box colors
                        let answer = randomAnswer.toLowerCase();
                        let guess = guesses[currGuess].toLowerCase();
                        let letterBoxes = document.getElementsByClassName("square-input");

                        let answerCopy = [...answer];

                        for (let i = 0; i < numLetters; i++) {
                            if (guess[i] === answer[i]) {
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                                letterBoxes[currGuess * numLetters + i].classList.add("bg-success");
                                letterBoxes[currGuess * numLetters + i].classList.add("border-success");

                                // change keyboard letter color
                                let letterButtons = document.getElementsByClassName("letter-button");
                                for (let j = 0; j < letterButtons.length; j++) {
                                    if (letterButtons[j].textContent.toLowerCase() === guess[i]) {
                                        // remove all possible colors
                                        letterButtons[j].classList.remove("btn-secondary");
                                        letterButtons[j].classList.remove("btn-warning");
                                        letterButtons[j].classList.remove("btn-danger");
                                        letterButtons[j].classList.add("btn-success");
                                    }
                                }

                                // Remove the matched letter from the answer copy
                                answerCopy[i] = null;
                            }
                        }

                        for (let i = 0; i < numLetters; i++) {
                            if (guess[i] !== answer[i] && answerCopy.includes(guess[i])) {
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                                letterBoxes[currGuess * numLetters + i].classList.add("bg-warning");
                                letterBoxes[currGuess * numLetters + i].classList.add("border-warning");

                                // change keyboard letter color
                                let letterButtons = document.getElementsByClassName("letter-button");

                                for (let j = 0; j < letterButtons.length; j++) {
                                    if (letterButtons[j].textContent.toLowerCase() === guess[i]) {
                                        // if in answer but not in correct spot, change to yellow
                                        if (!letterButtons[j].classList.contains("btn-success")) {
                                            letterButtons[j].classList.remove("btn-secondary");
                                            letterButtons[j].classList.add("btn-warning");
                                        }
                                    }
                                }

                                // Remove the matched letter from the answer copy
                                answerCopy[answerCopy.indexOf(guess[i])] = null;
                            } else if (guess[i] !== answer[i]) {
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                                letterBoxes[currGuess * numLetters + i].classList.add("bg-danger");
                                letterBoxes[currGuess * numLetters + i].classList.add("border-danger");

                                // change keyboard letter color
                                let letterButtons = document.getElementsByClassName("letter-button");

                                for (let j = 0; j < letterButtons.length; j++) {
                                    if (letterButtons[j].textContent.toLowerCase() === guess[i]) {
                                        if (!letterButtons[j].classList.contains("btn-success") && !letterButtons[j].classList.contains("btn-warning")) {
                                            letterButtons[j].classList.remove("btn-secondary");
                                            letterButtons[j].classList.add("btn-danger");
                                        }
                                    }
                                }
                            }
                        }
                        currGuess++;
                        if (currGuess === numGuesses) {
                            finalSubmit = true;
                            // alert user of correct answer
                            let alert = $('<div class="alert alert-light fade show text-center" role="alert">')
                                .text(randomAnswer);

                            $('body').prepend(alert);
                            setTimeout(function () {
                                alert.alert('close');
                            }, 3000);

                            setTimeout(function () {
                                location.reload();
                            }, 3000);
                        }
                    }
                }
                else {
                    if (guesses[currGuess].length < numLetters) {
                        let alert = $('<div class="alert alert-light fade show text-center" role="alert">')
                            .text('Not enough letters.');

                        // Add the alert to the DOM
                        $('body').prepend(alert);
                        // Remove the alert after 3 seconds
                        setTimeout(function () {
                            alert.alert('close');
                        }, 1500);
                    }
                    else if (!guessableWords.includes(guesses[currGuess])) {
                        let alert = $('<div class="alert alert-light fade show text-center" role="alert">')
                            .text('Not in word list.');

                        $('body').prepend(alert);
                        setTimeout(function () {
                            alert.alert('close');
                        }, 1500);
                    }
                }
            }
        } else if (input.key === "Backspace") {
            if (currGuess < numGuesses - 1 || !finalSubmit) { // Checks if the player has submitted their last guess
                guesses[currGuess] = guesses[currGuess].slice(0, -1); // If not, remove the last letter from the current guess
            }
            updateLetters();
        } else {
            // Check if the key is a letter from A to Z
            if (!input.key.match(/^[a-z]$/i)) {
                // It's not a letter, ignore it
                return;
            }
            inputLetter(input.key.toLowerCase());
        }
    }
}

function buttonHandler(event) {
    let button = event.currentTarget;

    // Check if the button is the "ENTER" button
    if (button.textContent === "ENTER") {
        // Handle the "ENTER" button
        if (currGuess < numGuesses) {
            if (guesses[currGuess].length === numLetters && guessableWords.includes(guesses[currGuess])) {
                if (guesses[currGuess].toLowerCase() == randomAnswer.toLowerCase()) {
                    for (let i = 0; i < numLetters; i++) {
                            let letterBoxes = document.getElementsByClassName("square-input");
                            letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                            letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                            letterBoxes[currGuess * numLetters + i].classList.add("bg-success");
                            letterBoxes[currGuess * numLetters + i].classList.add("border-success");

                        // change keyboard letter color
                        let letterButtons = document.getElementsByClassName("letter-button");
                        for (let j = 0; j < letterButtons.length; j++) {
                            if (letterButtons[j].textContent.toLowerCase() === guesses[currGuess][i]) {
                                // remove all possible colors
                                letterButtons[j].classList.remove("btn-secondary");
                                letterButtons[j].classList.remove("btn-warning");
                                letterButtons[j].classList.remove("btn-danger");
                                letterButtons[j].classList.add("btn-success");
                            }
                        }
                    }

                    let alert = $('<div class="alert alert-success fade show text-center" role="alert">')
                        .text('Congratulations!');

                    // Add the alert to the DOM
                    $('body').prepend(alert);
                    setTimeout(function () {
                        alert.alert('close');
                    }, 1500);
                    finalSubmit = true;
                }
                else {
                    // go through each letter input and match with the answer and change input box colors
                    let answer = randomAnswer.toLowerCase();
                    let guess = guesses[currGuess].toLowerCase();
                    let letterBoxes = document.getElementsByClassName("square-input");

                    let answerCopy = [...answer];

                        for (let i = 0; i < numLetters; i++) {
                            if (guess[i] === answer[i]) {
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                                letterBoxes[currGuess * numLetters + i].classList.add("bg-success");
                                letterBoxes[currGuess * numLetters + i].classList.add("border-success");

                            // change keyboard letter color
                            let letterButtons = document.getElementsByClassName("letter-button");
                            for (let j = 0; j < letterButtons.length; j++) {
                                if (letterButtons[j].textContent.toLowerCase() === guess[i]) {
                                    // remove all possible colors
                                    letterButtons[j].classList.remove("btn-secondary");
                                    letterButtons[j].classList.remove("btn-warning");
                                    letterButtons[j].classList.remove("btn-danger");
                                    letterButtons[j].classList.add("btn-success");
                                }
                            }

                            // Remove the matched letter from the answer copy
                            answerCopy[i] = null;
                        }
                    }

                        for (let i = 0; i < numLetters; i++) {
                            if (guess[i] !== answer[i] && answerCopy.includes(guess[i])) {
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                                letterBoxes[currGuess * numLetters + i].classList.add("bg-warning");
                                letterBoxes[currGuess * numLetters + i].classList.add("border-warning");

                            // change keyboard letter color
                            let letterButtons = document.getElementsByClassName("letter-button");

                            for (let j = 0; j < letterButtons.length; j++) {
                                if (letterButtons[j].textContent.toLowerCase() === guess[i]) {
                                    // if in answer but not in correct spot, change to yellow
                                    if (!letterButtons[j].classList.contains("btn-success")) {
                                        letterButtons[j].classList.remove("btn-success");
                                        letterButtons[j].classList.add("btn-warning");
                                    }
                                }
                            }

                                // Remove the matched letter from the answer copy
                                answerCopy[answerCopy.indexOf(guess[i])] = null;
                            } 
                            else if (guess[i] !== answer[i]) {
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-dark");
                                letterBoxes[currGuess * numLetters + i].classList.remove("bg-light");
                                letterBoxes[currGuess * numLetters + i].classList.add("bg-danger");
                                letterBoxes[currGuess * numLetters + i].classList.add("border-danger");

                            // change keyboard letter color
                            let letterButtons = document.getElementsByClassName("letter-button");

                            for (let j = 0; j < letterButtons.length; j++) {
                                if (letterButtons[j].textContent.toLowerCase() === guess[i]) {
                                    letterButtons[j].classList.remove("btn-secondary");
                                    letterButtons[j].classList.add("btn-danger");
                                }
                            }
                        }
                    }
                    currGuess++;
                }
            }
            else {
                if (guesses[currGuess].length < numLetters) {
                    let alert = $('<div class="alert alert-light fade show text-center" role="alert">')
                        .text('Not enough letters.');

                    // Add the alert to the DOM
                    $('body').prepend(alert);
                    // Remove the alert after 3 seconds
                    setTimeout(function () {
                        alert.alert('close');
                    }, 1500);
                }
                else if (!guessableWords.includes(guesses[currGuess])) {
                    let alert = $('<div class="alert alert-light fade show text-center" role="alert">')
                        .text('Not in word list.');

                    $('body').prepend(alert);
                    setTimeout(function () {
                        alert.alert('close');
                    }, 1500);
                }
            }
        }
    }
    else if (button.classList.contains("backspace")) {
        // Handle the "BACKSPACE" button
        if (currGuess < numGuesses - 1 || !finalSubmit) {
            guesses[currGuess] = guesses[currGuess].slice(0, -1);
        }
        updateLetters();
    }
    else {
        // Handle other buttons
        inputLetter(button.textContent.toLowerCase());
    }
}

function inputLetter(key) {
    if (guesses[currGuess].length < numLetters) {
        guesses[currGuess] += key;
        updateLetters();
    }
}

function updateLetters() {
    let lettersGuessed = currGuess * numLetters + guesses[currGuess].length;
    let letterBoxes = document.getElementsByClassName("square-input");
    for (let i = 0; i < numGuesses; i++) {
        for (let j = 0; j < numLetters; j++) {
            if (i * numLetters + j < lettersGuessed) {
                letterBoxes[i * numLetters + j].placeholder = guesses[i][j];
            }
            else {
                //There's probably a better way to remove backspaced letters but this works for now
                letterBoxes[i * numLetters + j].placeholder = "";
            }
        }
    }
}

addEventListener("keydown", keyboardHandler);

let letterButtons = document.getElementsByClassName("letter-button");
for (let i = 0; i < letterButtons.length; i++) {
    letterButtons[i].addEventListener("click", buttonHandler);
}