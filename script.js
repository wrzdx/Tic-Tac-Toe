function GameBoard(rows=3, columns=3) {
  board = []
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const setToken = (x, y, player) => {
    let cell = board[x][y];
    if (cell.getValue()) return false;

    cell.setValue(player.getValue());
    return true;
  }


  return {getBoard, setToken};
}

function Cell() {
  let value = null;

  const setValue = (newValue) => {
    value = newValue;
  }

  const getValue = () => value;

  return {
    setValue,
    getValue
  };
}

function Player(value) {
  let score = 0;
  
  const getScore = () => score;
  const increaseScore = () => ++score;
  const getValue = () => value; 

  return {getValue, getScore, increaseScore};
}

function GameController() {
  let board = GameBoard();
  let winCombination = null;

  let firstPlayer = Player("PlayerX");
  let secondPlayer = Player("PlayerO");

  let activePlayer = firstPlayer;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === firstPlayer ? secondPlayer : firstPlayer;
  };

  const getActivePlayer = () => activePlayer;

  const findWinCombination = () => {
    const combinations = (x, y, board) => {
      const column = () => {
        if (x + 2 >= board.length || !board[x][y].getValue()) return false;

        return (board[x][y].getValue() === board[x+1][y].getValue() 
                && board[x][y].getValue() === board[x+2][y].getValue());
      };
      const row = () => {
        if (y + 2 >= board.length || !board[x][y].getValue()) return false;

        return (board[x][y+1].getValue() === board[x][y].getValue() 
        && board[x][y+2].getValue() === board[x][y].getValue());
      };
      const mainDiagonal = () => {
        if (y + 2 >= board.length || x +2 >= board.length || 
          !board[x][y].getValue()) return false;

        return (board[x+1][y+1].getValue() === board[x][y].getValue() 
          && board[x+2][y+2].getValue() === board[x][y].getValue());
      };
      const sideDiagonal = () => {
        if (y - 2 < 0 || x +2 >= board.length || 
          !board[x][y].getValue()) return false;

        return (board[x+1][y-1].getValue() === board[x][y].getValue() 
          && board[x+2][y-2].getValue() === board[x][y].getValue());
      };
      if (column()) return [x+2,y];
      if (row()) return [x,y+2];
      if (mainDiagonal()) return [x+2,y+2];
      if (sideDiagonal()) return [x+2, y-2];
      return null;
    };

    for (let i=0; i < board.getBoard().length; i++) {
      for (let j=0; j < board.getBoard().length; j++) {
        const combo = combinations(i,j, board.getBoard());
        if (combo) {
          winCombination = [i,j,combo[0],combo[1]];
          return;
        }
      }
    }
  };

  const playRound = (x, y) => {
    if (board.setToken(x, y, activePlayer)) {
      if (findWinCombination()) {
        return;
      }
      switchPlayerTurn();
    }
  };

  const getWinCombination = () => winCombination;

  return {
    getActivePlayer,
    playRound,
    getBoard: board.getBoard,
    getWinCombination
  };
}


function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  
  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.getValue()}`

    board.forEach((row, x) => {
      row.forEach((cell, y) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");


        if (cell.getValue()) {
          cellButton.classList.add(cell.getValue());
        }

        cellButton.dataset.x = x;
        cellButton.dataset.y = y;
        boardDiv.appendChild(cellButton);
      })
    });
    if (game.getWinCombination()) {
      const [x0, y0, x2, y2] = game.getWinCombination();
      const [x1, y1] = [(x0+x2)/2, (y0+y2)/2];

      const first = boardDiv.children.item(x0 * board.length + y0);
      const second = boardDiv.children.item(x1 * board.length + y1);
      const third = boardDiv.children.item(x2 * board.length + y2);
      
      first.classList.add("winCell");
      second.classList.add("winCell");
      third.classList.add("winCell");
      boardDiv.removeEventListener("click", clickHandlerBoard);
    }
  }

  function clickHandlerBoard(e) {
    const x = e.target.dataset.x;
    const y = e.target.dataset.y;
    if (!(x && y)) return;
    
    game.playRound(x, y);
    updateScreen();
  }

  boardDiv.addEventListener("click", clickHandlerBoard);

  updateScreen();
}

ScreenController();
