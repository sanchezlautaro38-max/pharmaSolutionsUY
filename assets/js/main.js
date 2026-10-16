document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav__toggle");

  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
      var expanded = header.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    document.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("is-open");
      });
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var form = document.getElementById("contact-form");
  if (form) {
    var success = document.getElementById("form-success");
    var error = document.getElementById("form-error");
    var button = document.getElementById("form-submit");
    var buttonText = button ? button.textContent : "";
    // FormSubmit reenvía cada consulta al mail configurado en el action del formulario.
    var endpoint = form.getAttribute("action").replace("formsubmit.co/", "formsubmit.co/ajax/");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (success) success.classList.remove("is-visible");
      if (error) error.classList.remove("is-visible");
      if (button) {
        button.disabled = true;
        button.textContent = "Enviando…";
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });
      if (data.email) data._replyto = data.email;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().then(function (json) {
            if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "Error");
          });
        }, function () {
          throw new Error("network");
        })
        .then(function () {
          form.reset();
          if (success) {
            success.classList.add("is-visible");
            success.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .catch(function (err) {
          if (error) {
            var msg = String(err && err.message);
            var detail = error.querySelector("[data-detail]");
            if (detail) {
              if (window.location.protocol === "file:" || /web server/i.test(msg)) {
                detail.textContent = "El formulario solo funciona con el sitio publicado en un servidor web (no abriendo el archivo HTML directamente).";
              } else if (/activat/i.test(msg)) {
                detail.textContent = "El formulario todavía no fue activado: revisá el mail de FormSubmit en info@pharmasolutionsrl.com y hacé clic en “Activate Form”.";
              } else {
                detail.textContent = "";
              }
            }
            error.classList.add("is-visible");
            error.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.textContent = buttonText;
          }
        });
    });
  }
});
