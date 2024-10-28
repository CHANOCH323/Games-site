let gridSize = 15;
const wordGrid = document.querySelector('.game-board');
let selectedCells = [];
const wordList = document.querySelector('.word-list');
let wordsGrid = []
let savedTables = JSON.parse(localStorage.getItem('savedTables')) || {};

function goHome() {
    window.location.href = '/index/index.html';
}

function getRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters.charAt(Math.floor(Math.random() * letters.length));
}

function getRandomNumber(n) {
    return Math.floor(Math.random() * n);
}

function createGrid() {
    gridSize = parseInt(document.getElementById('grid-size').value);
    let counter = 0;
    wordGrid.innerHTML = '';
    wordGrid.style.display = 'grid'
    wordGrid.style.width = `${gridSize * 40}px`
    wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    wordGrid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const letterCell = document.createElement('div');
            letterCell.id = String(counter);
            counter++;
            letterCell.addEventListener('click', function () {
                handleCellClick(letterCell);
            });
            wordGrid.appendChild(letterCell);
        }
    }
}

function getLetter(row, col) {
    const cell = document.getElementById(String((row * gridSize) + col));
    return cell;
}

function appendStrCol(str, reverse = false) {
    const row = getRandomNumber(gridSize);
    let col = getRandomNumber(gridSize - str.length);
    const strArr = reverse ? str.split('').reverse() : str.split('');
    let strGrid = ''
    for (let i = 0; i < strArr.length; col++, i++) {
        const cell = getLetter(row, col);
        strGrid += cell.textContent
        if (cell.textContent && cell.textContent !== strArr[i]) {
            return false;
        }
    }
    if (strGrid === str) {
        return false
    }

    col -= strArr.length;
    for (let i = 0; i < strArr.length; col++, i++) {
        getLetter(row, col).textContent = strArr[i];
    }
    return true;
}

function appendStrRow(str, reverse = false) {
    let row = getRandomNumber(gridSize - str.length);
    const col = getRandomNumber(gridSize);
    const strArr = reverse ? str.split('').reverse() : str.split('');

    for (let i = 0; i < strArr.length; row++, i++) {
        const cell = getLetter(row, col);
        if (cell.textContent && cell.textContent !== strArr[i]) {
            return false;
        }
    }

    row -= strArr.length;
    for (let i = 0; i < strArr.length; row++, i++) {
        getLetter(row, col).textContent = strArr[i];
    }
    return true;
}

function appendWords(words) {
    let failedWords = [];
    let newWords = [];
    for (let word of words) {
        if (!appendStrCol(word) && !appendStrRow(word) && !appendStrCol(word, true) && !appendStrRow(word, true)) {
            failedWords.push(word);
        } else {
            newWords.push(word)
        }
    }
    if (failedWords.length > 0) {
        alert(`Failed to place the following words: ${failedWords.join(',')}`)
    }
    return newWords
}

function createNewTable() {
    const tableTitle = document.getElementById('table-title').value;
    let wordsInput = document.getElementById('words-input').value.split(',').map(word => word.trim());
    wordsInput = new Set(wordsInput)
    wordsInput = Array.from(wordsInput)
    if (!tableTitle || !wordsInput) {
        document.getElementById('gridError').textContent = 'Please fill in all fields';
        return
    }
    for (let word of wordsInput) {
        if (word.length > gridSize) {
            document.getElementById('gridError').textContent = 'אחת מהמילים גדולה מגודל הטבלה';
            return
        }
    }
    saveTable(tableTitle, wordsInput);
    createTable(tableTitle)
}
function createTable(title) {
    document.getElementById('titleHeader').textContent = title
    let words = savedTables[title].words
    const newTable = document.getElementById('newTable')
    const savedTablesSection = document.getElementById('saved-tables-section')
    const gameTable = document.getElementById('gameTable')
    gameTable.style.display = 'grid'
    newTable.style.display = 'none'
    savedTablesSection.style.display = 'none'
    createGrid();
    startTimer();
    wordsGrid = appendWords(words);
    document.getElementById('total-words').textContent = wordsGrid.length
    fillRemainingCells();
    displayWordList(wordsGrid);
}

function displayWordList(words) {
    wordList.innerHTML = '';
    words.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.id = `word-${word}`;
        wordList.appendChild(li);
    });
}

function fillRemainingCells() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.getElementById(String(i));
        if (!cell.textContent) {
            cell.textContent = getRandomLetter();
        }
    }
}

function handleCellClick(cell) {
    selectedCells.push(cell);
    if (selectedCells.length >= 2) {
        resetSelection();
    } else {
        cell.style.backgroundColor = 'yellow';
    }
}

function winner(select, words) {
    let str = '';
    for (let i of select) {
        str += i.textContent;
    }
    let strReversed = str.split('').reverse().join('');
    for (let i of words) {
        let wordElement = document.getElementById(`word-${i}`);
        if ((i === str || i === strReversed) && !wordElement.classList.contains('found')) {
            wordElement.classList.add('found');
            wordsFound++;
            document.getElementById('words-found').textContent = wordsFound;
            if (wordsFound >= wordsGrid.length) {
                endGame()
            }
            return true;
        }
    }
    return false;
}

function backgroundColorWinner(select) {
    select.forEach(cell => {
        cell.style.backgroundColor = 'green';
        cell.classList.add('winner');
    });
}

function resetSelection() {
    let select = [];
    let cellWinner = 0
    const cellStart = Math.min(Number(selectedCells[0].id), Number(selectedCells[1].id));
    const cellEnd = Math.max(Number(selectedCells[0].id), Number(selectedCells[1].id));

    if (cellStart % gridSize === cellEnd % gridSize) {
        for (let index = Math.floor(cellStart / gridSize); index <= Math.floor(cellEnd / gridSize); index++) {
            let cell = getLetter(index, cellStart % gridSize);
            select.push(cell);
        }
    } else if (Math.floor(cellStart / gridSize) === Math.floor(cellEnd / gridSize)) {
        for (let index = Math.floor(cellStart % gridSize); index <= Math.floor(cellEnd % gridSize); index++) {
            let cell = getLetter(Math.floor(cellStart / gridSize), index);
            select.push(cell);
        }
    } else {
        selectedCells[0].style.backgroundColor = (selectedCells[0].classList.contains('winner')) ? 'green' : 'white';
        failedAttempts++;
        document.getElementById('failed-attempts').textContent = failedAttempts;
        selectedCells = [];
        return;
    }
    for (let i of select) {
        if (i.classList.contains('winner')) {
            cellWinner++
            console.log(cellWinner);

        }
    }
    if (cellWinner !== select.length && winner(select, wordsGrid)) {
        backgroundColorWinner(select);
    } else {
        selectedCells[0].style.backgroundColor = (selectedCells[0].classList.contains('winner')) ? 'green' : 'white';
        failedAttempts++;
        document.getElementById('failed-attempts').textContent = failedAttempts;
    }
    selectedCells = [];
}

function saveTable(title, words) {
    const tableData = {
        words: words,
        gridSize: gridSize,
        games: [],
    };
    savedTables[title] = tableData
    localStorage.setItem('savedTables', JSON.stringify(savedTables));
}

function displaySavedTables() {
    if (savedTables) {
        const savedTablesContainer = document.getElementById('saved-tables');
        savedTablesContainer.innerHTML = '';
        const savedTablesList = Object.keys(savedTables)
        savedTablesList.forEach((table) => {
            const button = document.createElement('button');
            button.textContent = table;
            button.addEventListener('click', () => createTable(table));
            savedTablesContainer.appendChild(button);
        });
    }
}


// טבלת מידע למשתמש
let wordsFound = 0;
let failedAttempts = 0;
let stopAttempts = 0;
let elapsedTime = 0;
let timerInterval;
let startTime;

function startTimer() {
    startTime = Date.now() - (elapsedTime * 1000);
    timerInterval = setInterval(updateTimer, 1000);
}
function updateTimer() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
function stopGame() {
    stopAttempts++
    if (stopAttempts % 2 == 1) {
        clearInterval(timerInterval);
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('stop-attempts').textContent = Math.floor(stopAttempts / 2);
        document.getElementById('stop-game').textContent = 'Resume Game';
        wordGrid.style.display = 'none'
    } else {
        document.getElementById('stop-game').textContent = 'Stop game';
        wordGrid.style.display = 'grid'
        startTimer();
    }
}
function endGame() {
    clearInterval(timerInterval);
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    title = document.getElementById('titleHeader').textContent
    savedTables[title].games.push({ elapsedTime, wordsFound, failedAttempts, stopAttempts })
    localStorage.setItem('savedTables', JSON.stringify(savedTables));
    // document.getElementById('messagesToUser').textContent = "Congratulations, You Won!";
    const overlay = document.getElementById('overlay');
    const message = document.getElementById('game-over-message');
    
    overlay.style.display = 'block';  // מציג את שכבת הכיסוי
    message.style.display = 'block'; 
}
function restartGame(){
    window.location.href = './memory.html';
}


window.onload = function () {
    displaySavedTables();
    const gameTable = document.getElementById('gameTable')
    gameTable.style.display = 'none'
};
