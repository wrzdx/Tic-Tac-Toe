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

  let playerXDiv = document.querySelector(".playerX");
  let playerODiv = document.querySelector(".playerO");
  let ties = document.querySelector(".ties");


  const circleSVG = '<svg viewBox="-1.2 -1.2 10.40 10.40" id="meteor-icon-kit__regular-circle-xxs" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 8C1.79086 8 0 6.2091 0 4C0 1.79086 1.79086 0 4 0C6.2091 0 8 1.79086 8 4C8 6.2091 6.2091 8 4 8zM4 6C5.1046 6 6 5.1046 6 4C6 2.8954 5.1046 2 4 2C2.8954 2 2 2.8954 2 4C2 5.1046 2.8954 6 4 6z" fill="currentColor"></path></g></svg>';
  const crossSVG = '<svg viewBox="-3.75 -3.75 32.50 32.50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cross</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-469.000000, -1041.000000)" fill="currentColor"> <path d="M487.148,1053.48 L492.813,1047.82 C494.376,1046.26 494.376,1043.72 492.813,1042.16 C491.248,1040.59 488.712,1040.59 487.148,1042.16 L481.484,1047.82 L475.82,1042.16 C474.257,1040.59 471.721,1040.59 470.156,1042.16 C468.593,1043.72 468.593,1046.26 470.156,1047.82 L475.82,1053.48 L470.156,1059.15 C468.593,1060.71 468.593,1063.25 470.156,1064.81 C471.721,1066.38 474.257,1066.38 475.82,1064.81 L481.484,1059.15 L487.148,1064.81 C488.712,1066.38 491.248,1066.38 492.813,1064.81 C494.376,1063.25 494.376,1060.71 492.813,1059.15 L487.148,1053.48" id="cross" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>';

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const roundResult = game.getRoundResult();
    const players = game.getPlayers();
    const roundNumber = game.getRoundNumber();

    playerTurnDiv.textContent = `${activePlayer.getName()}'s turn`;
    playerXDiv.children.item(0).innerText = `${players[0].getName()}`;
    playerXDiv.children.item(1).innerText = `${players[0].getScore()}`;
    playerODiv.children.item(0).innerText = `${players[1].getName()}`;
    playerODiv.children.item(1).innerText = `${players[1].getScore()}`;
    ties.children.item(1).innerText = `${roundNumber - players[0].getScore() - players[1].getScore()}`;
    

    board.getBoard().forEach((row, x) => {
      row.forEach((cell, y) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");


        if (cell.getValue() === players[0].getValue()) {
          cellButton.innerHTML = crossSVG;
        } 

        if (cell.getValue() === players[1].getValue()) {
          cellButton.innerHTML = circleSVG;
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