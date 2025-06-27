const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const modal = document.getElementById("authModal");
    const modalTitle = document.getElementById("modalTitle");
    const closeBtn = document.querySelector(".close");

    loginBtn.onclick = function (e) {
      e.preventDefault();
      modalTitle.textContent = "Login";
      modal.style.display = "block";
    };

    signupBtn.onclick = function (e) {
      e.preventDefault();
      modalTitle.textContent = "Sign Up";
      modal.style.display = "block";
    };

    closeBtn.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };