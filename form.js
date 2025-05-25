function Form() {
  const createBtn = document.querySelector(".create");
  createBtn.addEventListener("click", parseForm);
  
  function parseForm(event) {
    const form = document.querySelector(".gameParams");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    let playerX = document.querySelector('form [name="playerX"]').value;
    let playerO = document.querySelector('form [name="playerO"]').value;
    let size = document.querySelector('form [name="size"]').value;

    localStorage.setItem("gameParams", JSON.stringify({ playerX, playerO, size }));

    event.preventDefault();
    createBtn.removeEventListener("click", parseForm);
    window.location.replace("game.html");
  }
}

Form();