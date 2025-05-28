class GameBoard {
  constructor(size=3) {
    this.board = [];
    for (let i = 0; i < size; i++) {
      this.board[i] = [];
      for (let j = 0; j < size; j++) {
        this.board[i].push(new Cell(i, j));
      }
    }
  }

  get board() { return this._board;}
  set board(newValue) {this._board = newValue};

  setToken(x, y, player) {
    if (isNaN(x) || isNaN(y)) return;
    let cell = this.board[x][y];
    cell.value = player.value;
  };

  setWin(x, y) {
    let cell = this.board[x][y];
    cell.isWin = true;
  };

  isWin(x, y) {
    let cell = this.board[x][y];
    return cell.isWin;
  };

  getToken(x, y) { 
    if (isNaN(x) || isNaN(y)) return 1;
    return this.board[x][y].value;
  }
}

class Cell {
  constructor(x, y) {
    this.value = null;
    this.isWin = false; 
    this.x = x;
    this.y = y; 
  }
}

class Player {
  constructor(value, name) {
    this.score = 0;
    this.name = name;
    this.value = value;
  }
  
  increaseScore() {++this._score;}
  resetScore() {this._score = 0;}
}

class GameParameters {
  constructor(playerX, playerO, boardSize) {
    this.playerX = playerX;
    this.playerO = playerO;
    this.boardSize = boardSize;
  }
}

class GameController {
  constructor(gameParams) {
    this.playerX = new Player("TokenX", gameParams.playerXName);
    this.playerO = new Player("TokenO", gameParams.playerOName);
    this.activePlayer = this.playerX;
    this.board = new GameBoard(gameParams.boardSize);
    this.cellsLeft = this.board.board.length ** 2;
    this.roundResult = "";
    this.roundCounter = 0;
  };
  

  switchPlayerTurn() {
    this.activePlayer = this.activePlayer === this.playerX ? this.playerO : this.playerX;
  };


  findWinLine(x, y) {
    const currentBoard = this.board.board;
    let winLine = [];
    const checkMainDiagonal = () => {
      let startX = x - 2;
      let startY = y - 2;
      const checkCombo = () => (
        currentBoard[startX][startY].value === currentBoard[startX+1][startY+1].value 
        && currentBoard[startX+1][startY+1].value === currentBoard[startX+2][startY+2].value
        && currentBoard[startX][startY].value !== null
      );

      while (startX < 0 || startY < 0) {
        startX++;
        startY++;
      }

      while (startX + 2 < currentBoard.length && startY + 2 < currentBoard.length) {
        if (checkCombo()) {
          winLine = [
            currentBoard[startX][startY],
            currentBoard[startX + 1][startY + 1],
            currentBoard[startX + 2][startY + 2],
          ];
          return true;
        } 
        startX++;
        startY++;
      }
      return false;
    };

    const checkSideDiagonal = () => {
      let startX = x - 2;
      let startY = y + 2;
      const checkCombo = () => (
        currentBoard[startX][startY].value === currentBoard[startX+1][startY-1].value 
        && currentBoard[startX+1][startY-1].value === currentBoard[startX+2][startY-2].value
        && currentBoard[startX][startY].value !== null
      );

      while (startX < 0 || startY >= currentBoard.length) {
        startX++;
        startY--;
      }

      while (startX + 2 < currentBoard.length && startY - 2 >= 0) {
        if (checkCombo()) {
          winLine = [
            currentBoard[startX][startY],
            currentBoard[startX + 1][startY - 1], 
            currentBoard[startX + 2][startY - 2],
          ];
          return true;
        } 
        startX++;
        startY--;
      }
      return false;
    };

    const checkHorizontal = () => {
      let startY = y - 2;
      const checkCombo = () => (
        currentBoard[x][startY].value === currentBoard[x][startY+1].value 
        && currentBoard[x][startY+1].value === currentBoard[x][startY+2].value
        && currentBoard[x][startY].value !== null
      );

      while (startY < 0) {
        startY++;
      }

      while (startY + 2 < currentBoard.length) {
        if (checkCombo()) {
          winLine = [
            currentBoard[x][startY],
            currentBoard[x][startY + 1], 
            currentBoard[x][startY + 2]
          ];
          return true;
        } 
        startY++;
      }
      return false;
    };
    const checkVertical = () => {
      let startX = x - 2;
      const checkCombo = () => (
        currentBoard[startX][y].value === currentBoard[startX+1][y].value 
        && currentBoard[startX+1][y].value === currentBoard[startX+2][y].value
        && currentBoard[startX][y].value !== null
      );

      while (startX < 0) {
        startX++;
      }

      while (startX + 2 < currentBoard.length) {
        if (checkCombo()) {
          winLine = [
            currentBoard[startX][y],
            currentBoard[startX + 1][y], 
            currentBoard[startX + 2][y],
          ];
          return true;
        } 
        startX++;
      }
      return false;
    };

    const checks = [
      checkMainDiagonal,
      checkSideDiagonal,
      checkHorizontal,
      checkVertical,
    ]

    for (let check of checks) {
      if (check()) return winLine;
    }

    return [];
  };

  checkDraw() {return this.cellsLeft === 0;}

  setWinLine(winLine) {
    for (let cell of winLine) {
      this.board.setWin(cell.x, cell.y);
    }
  }

  playRound(x, y) {

    if (!this.board.getToken(x, y)) {
      this.board.setToken(x, y, this.activePlayer)
      this.cellsLeft--;
      let winLine = this.findWinLine(x,y);

      if (winLine.length) {
        this.setWinLine(winLine);
        this.activePlayer.increaseScore();
        this.roundResult = "win";
        this.roundCounter++;

        return;
      }

      if (this.checkDraw()) {
        this.roundResult = "draw";
        this.roundCounter++;

        return;
      }

      this.switchPlayerTurn();
    }
  };


  restart() {
    this.board = new GameBoard(this.board.board.length);
    this.activePlayer = this.playerX;
    this.cellsLeft = this.board.board.length ** 2;
    this.roundResult = "";
  };
}


function ScreenController() {
  let game = null;
  
  let playerTurnDiv = document.querySelector(".turn");
  let boardDiv = document.querySelector(".board");

  let restartBtn = document.querySelector(".restart");
  let quitBtn = document.querySelector(".quit");

  let playerXDiv = document.querySelector(".playerX");
  let playerODiv = document.querySelector(".playerO");
  let ties = document.querySelector(".ties");


  const circleSVG = '<svg viewBox="-1.2 -1.2 10.40 10.40" id="meteor-icon-kit__regular-circle-xxs" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 8C1.79086 8 0 6.2091 0 4C0 1.79086 1.79086 0 4 0C6.2091 0 8 1.79086 8 4C8 6.2091 6.2091 8 4 8zM4 6C5.1046 6 6 5.1046 6 4C6 2.8954 5.1046 2 4 2C2.8954 2 2 2.8954 2 4C2 5.1046 2.8954 6 4 6z" fill="currentColor"></path></g></svg>';
  const crossSVG = '<svg viewBox="-3.75 -3.75 32.50 32.50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cross</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-469.000000, -1041.000000)" fill="currentColor"> <path d="M487.148,1053.48 L492.813,1047.82 C494.376,1046.26 494.376,1043.72 492.813,1042.16 C491.248,1040.59 488.712,1040.59 487.148,1042.16 L481.484,1047.82 L475.82,1042.16 C474.257,1040.59 471.721,1040.59 470.156,1042.16 C468.593,1043.72 468.593,1046.26 470.156,1047.82 L475.82,1053.48 L470.156,1059.15 C468.593,1060.71 468.593,1063.25 470.156,1064.81 C471.721,1066.38 474.257,1066.38 475.82,1064.81 L481.484,1059.15 L487.148,1064.81 C488.712,1066.38 491.248,1066.38 492.813,1064.81 C494.376,1063.25 494.376,1060.71 492.813,1059.15 L487.148,1053.48" id="cross" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>';

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.board;
    const activePlayer = game.activePlayer;
    const roundResult = game.roundResult;
    const playerX = game.playerX;
    const playerO = game.playerO;
    const roundNumber = game.roundNumber;

    playerTurnDiv.textContent = `${activePlayer.name}'s turn`;
    playerXDiv.children.item(0).innerText = `${playerX.name}`;
    playerXDiv.children.item(1).innerText = `${playerX.score}`;
    playerODiv.children.item(0).innerText = `${playerO.name}`;
    playerODiv.children.item(1).innerText = `${playerO.score}`;
    ties.children.item(1).innerText = `${roundNumber - playerX.score - playerO.score}`;
    

    board.board.forEach((row, x) => {
      row.forEach((cell, y) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");


        if (cell.value === playerX.value) {
          cellButton.innerHTML = crossSVG;
        } 

        if (cell.value === playerO.value) {
          cellButton.innerHTML = circleSVG;
        } 


        if (cell.isWin) {
          cellButton.classList.add("win");
        }

        cellButton.dataset.x = x;
        cellButton.dataset.y = y;
        boardDiv.appendChild(cellButton);
      })
    });


    if (roundResult === "win") {
      playerTurnDiv.textContent = `${game.activePlayer.name} won!`;
      boardDiv.removeEventListener("click", clickHandlerBoard);
    } 
    
    if (roundResult === "draw") {
      playerTurnDiv.textContent = "It's a draw!";
      boardDiv.removeEventListener("click", clickHandlerBoard);
    }
    
    }

  function clickHandlerBoard(e) {
    const x = +e.target.dataset.x;
    const y = + e.target.dataset.y;
    
    game.playRound(x, y);
    updateScreen();
  }

  function backToIndex(e) {
    boardDiv.removeEventListener("click", clickHandlerBoard);
    restartBtn.removeEventListener("click", game.restart);
    quitBtn.removeEventListener("click", backToIndex);
    window.location.replace("index.html"); 
  }


  const run = () => {
    const params = JSON.parse(localStorage.getItem("gameParams"));
    let gameParams = null;
    if (params) {
      gameParams = new GameParameters(params.playerX, params.playerO, params.size);
    }

    game = new GameController(gameParams);  
    boardDiv.style["grid-template-columns"] = `repeat(${gameParams.boardSize}, 1fr)`;  
    
    boardDiv.addEventListener("click", clickHandlerBoard);
    restartBtn.addEventListener("click", 
      (e) => {
        game.restart();
        boardDiv.addEventListener("click", clickHandlerBoard);
        updateScreen();
      });
    quitBtn.addEventListener("click", backToIndex);

    updateScreen();
  }

  run();
}

ScreenController();