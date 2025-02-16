let questions = []; 
let currentQuestionIndex = 0; 
let userAnswers = []; 
let score = 0; 
let timerInterval; 

async function submission(event) {
    event.preventDefault();
    const amount = document.querySelector("#amount").value;
    if (amount === "") {
        alert("You did not specify the number of questions for the quiz.");
        return;
    }

    const category = document.querySelector("#category").value;
    const difficulty = document.querySelector("#difficulty").value;
    const type = document.querySelector("#type").value;

    let APIurl = `https://opentdb.com/api.php?amount=${amount}`;
    if (category !== "0") APIurl += `&category=${category}`;
    if (difficulty !== "0") APIurl += `&difficulty=${difficulty}`;
    if (type !== "0") APIurl += `&type=${type}`;

    try {
        const response = await fetch(APIurl);
        const data = await response.json();
        if (data.response_code === 1) {
            alert("No results found. Please adjust your filters and try again.");
            return;
        }

        questions = data.results; // Store the questions
        const page1 = document.querySelector("#page1");
        const page2 = document.querySelector("#page2");
        page1.classList.replace("page-active", "page-nonactive");
        page2.classList.replace("page-nonactive", "page-active");

        three_second_timer(); // Start the 3-second timer
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        alert("An error occurred while fetching the quiz. Please try again.");
    }
}

function three_second_timer() {
    const timer = document.querySelector("#timer_first");
    let currentNumber = 5;
    const intervalId = setInterval(() => {
        timer.innerHTML = `Your quiz starts in: ${currentNumber}`;
        currentNumber--;

        if (currentNumber < 0) {
            clearInterval(intervalId);
            startQuiz(); // Start the quiz after the timer ends
        }
    }, 1000);
}

function startQuiz() {
    const page2 = document.querySelector("#page2");
    const page3 = document.querySelector("#page3");
    page2.classList.replace("page-active", "page-nonactive");
    page3.classList.replace("page-nonactive", "page-active");

    renderAllQuestions(); // Render all questions (initially hidden)
    showCurrentQuestion(); // Show the first question
}

function renderAllQuestions() {
    const page3 = document.querySelector("#page3");
    page3.innerHTML = `
        <div id="score-display">Score: </div> <!-- Score display at the top -->
    `; // Clear previous content and add score display

    questions.forEach((question, index) => {
        const questionContainer = document.createElement("div");
        questionContainer.classList.add("question-container");
        questionContainer.style.display = "none"; // Initially hidden

        const questionText = document.createElement("div");
        questionText.classList.add("question-text");
        questionText.innerHTML = `Question ${index + 1}: ${question.question}`;
        questionContainer.appendChild(questionText);

        const optionsContainer = document.createElement("div");
        const allAnswers = shuffleArray([...question.incorrect_answers, question.correct_answer]);
        allAnswers.forEach(answer => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `question-${index}`; // Group radio buttons by question
            radio.value = answer;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(answer));
            optionsContainer.appendChild(label);
        });
        questionContainer.appendChild(optionsContainer);

        const nextButton = document.createElement("button");
        nextButton.classList.add("nextButton");
        nextButton.textContent = "Next";
        nextButton.addEventListener("click", () => moveToNextQuestion());
        questionContainer.appendChild(nextButton);

        const timerDisplay = document.createElement("div");
        timerDisplay.id = `timer-${index}`;
        timerDisplay.textContent = "Time left: 20 seconds";
        questionContainer.appendChild(timerDisplay);

        page3.appendChild(questionContainer);
    });
}

function showCurrentQuestion() {
    const questionContainers = document.querySelectorAll(".question-container");
    questionContainers.forEach((container, index) => {
        if (index === (currentQuestionIndex - 1)){
            container.classList.add("blur");
        }
        if (index === currentQuestionIndex) {
            container.style.display = "block"; // Show the current question
            startTimer(20, index); // Start the timer for the current question
            container.scrollIntoView({ behavior: "smooth" }); // Scroll to the current question
        }
    });
}

function startTimer(seconds, questionIndex) {
    const timerDisplay = document.querySelector(`#timer-${questionIndex}`);
    let timeLeft = seconds;

    timerInterval = setInterval(() => {
        timerDisplay.textContent = `Time left: ${timeLeft} seconds`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            moveToNextQuestion(); // move to the next question
        }
    }, 1000);
}

function moveToNextQuestion() {
    clearInterval(timerInterval); // stop the timer

    
    const selectedAnswer = document.querySelector(`input[name="question-${currentQuestionIndex}"]:checked`);
    if (selectedAnswer) {
        userAnswers[currentQuestionIndex] = selectedAnswer.value; 
        if (selectedAnswer.value === questions[currentQuestionIndex].correct_answer) {
            score++; // Increment score if the answer is correct
        }
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showCurrentQuestion(); // Show the next question
    } else {
        endQuiz(); // End the quiz if all questions are answered
    }
}

function endQuiz() {
    const scoreDisplay = document.querySelector("#score-display");
    scoreDisplay.textContent = `Score: ${score} out of ${questions.length}`; // Update score display

    // Scroll to the top to show the score
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Helper function to shuffle an array (for randomizing answers)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}