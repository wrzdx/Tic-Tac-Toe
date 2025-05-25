function GameBoard(size=3) {
  let board = []
  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i].push(Cell(i, j));
    }
  }

  const getBoard = () => board;

  const setToken = (x, y, player) => {
    let cell = board[x][y];
    cell.setValue(player.getValue());
  };

  const setWin = (x, y) => {
    let cell = board[x][y];
    cell.setIsWin();
  };

  const isWin = (x, y) => {
    let cell = board[x][y];
    return cell.IsWin();
  };

  const getToken = (x, y) => board[x][y].getValue();


  return {getBoard, getToken, setToken, setWin, isWin};
}

function Cell(x, y) {
  let value = null;
  let isWin = false;
  
  const setValue = (newValue) => {
    value = newValue;
  }

  const getValue = () => value;
  const getPosition = () => [x,y];

  const setIsWin = () => isWin = true;
  const IsWin = () => isWin;

  return {
    setValue,
    getValue,
    getPosition,
    setIsWin,
    IsWin,
  };
}

function Player(value, name) {
  let score = 0;
  
  const getScore = () => score;
  const increaseScore = () => ++score;
  const resetScore = () => score = 0;
  const getName = () => name;
  const getValue = () => value;

  return {getScore, increaseScore, resetScore, getName, getValue};
}

function GameParameters(playerX, playerO, boardSize) {
  const getPlayerXName = () => playerX;
  const getPlayerOName = () => playerO;
  const getBoardSize = () => boardSize;

  return {getPlayerXName, getPlayerOName, getBoardSize};
}

function GameController() {
  let roundCounter = 0;
  let roundResult = "";
  let board = GameBoard();
  let cellsLeft = board.getBoard().length ** 2;

  let playerX = Player("TokenX", "PlayerX");
  let playerO = Player("TokenO", "PlayerO");

  let activePlayer = playerX;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === playerX ? playerO : playerX;
  };

  const getActivePlayer = () => activePlayer;

  const findWinLine = (x, y) => {
    const currentBoard = board.getBoard();
    let winLine = [];
    const checkMainDiagonal = () => {
      let startX = x - 2;
      let startY = y - 2;
      const checkCombo = () => (
        currentBoard[startX][startY].getValue() === currentBoard[startX+1][startY+1].getValue() 
        && currentBoard[startX+1][startY+1].getValue() === currentBoard[startX+2][startY+2].getValue()
        && currentBoard[startX][startY].getValue() !== null
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
        currentBoard[startX][startY].getValue() === currentBoard[startX+1][startY-1].getValue() 
        && currentBoard[startX+1][startY-1].getValue() === currentBoard[startX+2][startY-2].getValue()
        && currentBoard[startX][startY].getValue() !== null
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
        currentBoard[x][startY].getValue() === currentBoard[x][startY+1].getValue() 
        && currentBoard[x][startY+1].getValue() === currentBoard[x][startY+2].getValue()
        && currentBoard[x][startY].getValue() !== null
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
        currentBoard[startX][y].getValue() === currentBoard[startX+1][y].getValue() 
        && currentBoard[startX+1][y].getValue() === currentBoard[startX+2][y].getValue()
        && currentBoard[startX][y].getValue() !== null
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

    for (check of checks) {
      if (check()) return winLine;
    }

    return [];
  };

  const checkDraw = () => cellsLeft === 0;

  const setWinLine = (winLine) => {
    for (cell of winLine) {
      board.setWin(...cell.getPosition())
    }
  }

  const playRound = (x, y) => {

    if (!board.getToken(x, y)) {
      board.setToken(x, y, activePlayer)
      cellsLeft--;
      let winLine = findWinLine(x,y);

      if (winLine.length) {
        setWinLine(winLine);
        activePlayer.increaseScore();
        roundResult = "win";
        roundCounter++;

        return;
      }

      if (checkDraw()) {
        roundResult = "draw";
        roundCounter++;

        return;
      }

      switchPlayerTurn();
    }
  };

  const getRoundNumber = () => roundCounter;
  const getRoundResult = () => roundResult;


  const restart = () => {
    board = GameBoard(board.getBoard().length);
    activePlayer = playerX;
    cellsLeft = board.getBoard().length ** 2;
    roundResult = "";
  };

  const init = (gameParams) => {
    playerX = Player("TokenX", gameParams.getPlayerXName());
    playerO = Player("TokenO", gameParams.getPlayerOName());
    activePlayer = playerX;
    board = GameBoard(gameParams.getBoardSize());
    cellsLeft = board.getBoard().length ** 2;
    roundResult = "";
  };

  const getPlayers = () => [playerX, playerO];
  const getBoard = () => board;

  return {
    getActivePlayer,
    playRound,
    getBoard,
    restart,
    init,
    getRoundNumber,
    getRoundResult,
    getPlayers,
  };
}


function ScreenController() {
  let game = GameController();
  
  let playerTurnDiv = document.querySelector(".turn");
  let boardDiv = document.querySelector(".board");

  let restartBtn = document.querySelector(".restart");
  let quitBtn = document.querySelector(".quit");

  let playerXScore = document.querySelector(".playerXScore");
  let playerOScore = document.querySelector(".playerOScore");
  let ties = document.querySelector(".ties");

  
  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const roundResult = game.getRoundResult();
    const players = game.getPlayers();
    const roundNumber = game.getRoundNumber();

    playerTurnDiv.textContent = `${activePlayer.getName()}`;
    playerXScore.innerText = `${players[0].getScore()}`;
    playerOScore.innerText = `${players[1].getScore()}`;
    ties.innerText = `${roundNumber - players[0].getScore() - players[1].getScore()}`;
    

    board.getBoard().forEach((row, x) => {
      row.forEach((cell, y) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");


        if (cell.getValue()) {
          cellButton.classList.add(cell.getValue());
        }

        if (cell.IsWin()) {
          cellButton.classList.add("win");
        }

        cellButton.dataset.x = x;
        cellButton.dataset.y = y;
        boardDiv.appendChild(cellButton);
      })
    });


    if (roundResult === "win") {
      playerTurnDiv.textContent = `${game.getActivePlayer().getName()} won!`;
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
      gameParams = GameParameters(params.playerX, params.playerO, params.size);
    }

    game.init(gameParams);  
    boardDiv.style["grid-template-columns"] = `repeat(${gameParams.getBoardSize()}, 1fr)`;  
    
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