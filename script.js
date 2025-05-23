function GameBoard(size=3) {
  board = []
  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
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

function Player(value, name) {
  let score = 0;
  
  const getScore = () => score;
  const increaseScore = () => ++score;
  const getValue = () => value;
  const getName = () => name ? name : value;

  return {getValue, getScore, increaseScore, getName};
}

function GameController() {
  let board = GameBoard();
  let winCombination = [];

  let firstPlayer = Player("PlayerX");
  let secondPlayer = Player("PlayerO");

  let activePlayer = firstPlayer;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === firstPlayer ? secondPlayer : firstPlayer;
  };

  const getActivePlayer = () => activePlayer;

  const findWinCombinationOrDraw = () => {
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
          return true;
        }
      }
    }
    if (checkDraw()) {
      winCombination = [-1];
      return true;
    }
    return false;
  };

  const checkDraw = () => board.getBoard().reduce(
    (sum, row) => {
      sum += row.reduce((rowSum, cell) => rowSum + +(cell.getValue()!==null), 0);
      return sum;
  }, 0) === board.getBoard().length ** 2;

  const playRound = (x, y) => {
    if (board.setToken(x, y, activePlayer)) {
      if (!findWinCombinationOrDraw()) {
        switchPlayerTurn();
      }
    }
  };

  const getWinCombination = () => winCombination;

  const reset = () => {
    board = GameBoard(board.getBoard().length);
    winCombination = null;
    activePlayer = firstPlayer;
  };

  const init = (newFirstPlayer, newSecondPlayer, newSize) => {
    firstPlayer = Player("PlayerX", newFirstPlayer);
    secondPlayer = Player("PlayerO", newSecondPlayer);
    activePlayer = firstPlayer;
    board = GameBoard(newSize);
  };

  return {
    getActivePlayer,
    playRound,
    getBoard: board.getBoard,
    getWinCombination,
    reset,
    init,
  };
}


function ScreenController() {
  let game = GameController();
  const initialState = document.querySelector("body").innerHTML;
  let playerTurnDiv = document.querySelector(".turn");
  let boardDiv = document.querySelector(".board");

  
  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.getName()}`

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
    if (game.getWinCombination().length) {
      if (game.getWinCombination().length === 1) {
        playerTurnDiv.textContent = "It's a draw";
      } else {  
        const [x0, y0, x2, y2] = game.getWinCombination();
        const [x1, y1] = [(x0+x2)/2, (y0+y2)/2];

        const first = boardDiv.children.item(x0 * board.length + y0);
        const second = boardDiv.children.item(x1 * board.length + y1);
        const third = boardDiv.children.item(x2 * board.length + y2);
        
        first.classList.add("winCell");
        second.classList.add("winCell");
        third.classList.add("winCell");

        playerTurnDiv.textContent = `${game.getActivePlayer().getName()} won!`;
      }
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

  function init(e) {
    game = GameController();
    playerTurnDiv = document.querySelector(".turn");
    boardDiv = document.querySelector(".board");
    const form = document.querySelector(".params");

    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    let firstPlayer = document.querySelector('form [name="firstPlayer"]').value;
    let secondPlayer = document.querySelector('form [name="secondPlayer"]').value;
    let size = document.querySelector('form [name="size"]').value;

    game.init(firstPlayer, secondPlayer, size);
    boardDiv.style["grid-template-columns"] = `repeat(${size}, 1fr)`;
    e.preventDefault();
    form.remove();
    return true
  }

  function reset() {
    let body = document.querySelector("body"); 
    body.innerHTML = initialState;
    const initBtn = document.querySelector(".init");
    initBtn.addEventListener("click", start);
  }

  function run() {
    const resetBtn = document.createElement("button");
    resetBtn.classList.add("reset");
    resetBtn.innerText = "Reset";
    boardDiv.after(resetBtn);
    
    boardDiv.addEventListener("click", clickHandlerBoard);
    resetBtn.addEventListener("click", reset);
    updateScreen();
  }
  function start(e) {
    if (init(e)) {
      run();
    }
  }

  const initBtn = document.querySelector(".init");
  initBtn.addEventListener("click", start);
  
}

ScreenController();
