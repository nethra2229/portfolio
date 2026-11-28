(function () {

  "use strict";

  /* ---------- TAB SWITCHING ---------- */

  var sections = document.querySelectorAll(".tab-section");

  var tabButtons = document.querySelectorAll(".tab-btn");

  var triggers = document.querySelectorAll("[data-tab]");

  var nav = document.getElementById("tabNav");

  var menuToggle = document.getElementById("menuToggle");


  function showTab(id, updateHash) {

    var valid = Array.from(sections).some(function (section) {
      return section.id === id;
    });

    if (!valid) {
      id = "home";
    }

    sections.forEach(function (section) {

      section.classList.toggle(
        "active",
        section.id === id
      );

    });


    tabButtons.forEach(function (button) {

      var active =
        button.getAttribute("data-tab") === id;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-current",
        active ? "page" : "false"
      );

    });


    nav.classList.remove("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );


    if (updateHash) {

      try {

        history.replaceState(
          null,
          "",
          "#" + id
        );

      } catch (error) {}

    }

  }


  /* ---------- NAVIGATION BUTTONS ---------- */

  triggers.forEach(function (element) {

    element.addEventListener("click", function (event) {

      event.preventDefault();

      showTab(
        element.getAttribute("data-tab"),
        true
      );

    });

  });


  /* ---------- MOBILE MENU ---------- */

  menuToggle.addEventListener("click", function () {

    var isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });


  /* ---------- URL HASH ---------- */

  window.addEventListener("hashchange", function () {

    showTab(
      location.hash.slice(1),
      false
    );

  });


  /* ---------- AUTOMATIC FOOTER YEAR ---------- */

  document.getElementById("year").textContent =
    new Date().getFullYear();


  /* ---------- INITIAL TAB ---------- */

  showTab(
    location.hash.slice(1) || "home",
    false
  );


  /* ---------- ANIMATED STARFIELD ---------- */

  var canvas = document.getElementById("starfield");

  var ctx = canvas.getContext("2d");

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var stars = [];

  var shooters = [];

  var width = 0;

  var height = 0;

  var dpr = 1;

  var animationFrame = null;


  /* ---------- RESIZE CANVAS ---------- */

  function resize() {

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    width = window.innerWidth;

    height = window.innerHeight;

    canvas.width = width * dpr;

    canvas.height = height * dpr;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    var count = Math.min(
      260,
      Math.floor((width * height) / 6000)
    );

    stars = [];


    for (var i = 0; i < count; i++) {

      stars.push({

        x: Math.random() * width,

        y: Math.random() * height,

        radius: Math.random() * 1.3 + 0.2,

        base: Math.random() * 0.6 + 0.3,

        speed: Math.random() * 0.02 + 0.005,

        phase: Math.random() * Math.PI * 2,

        tint: Math.random() < 0.2
          ? "201,191,255"
          : (
              Math.random() < 0.15
                ? "229,139,214"
                : "255,255,255"
            )

      });

    }


    if (reduceMotion) {
      draw();
    }

  }


  /* ---------- SHOOTING STAR ---------- */

  function spawnShooter() {

    shooters.push({

      x: Math.random() * width * 0.8 + width * 0.1,

      y: Math.random() * height * 0.4,

      vx: 7 + Math.random() * 4,

      vy: 3 + Math.random() * 2,

      life: 0,

      max: 55

    });

  }


  /* ---------- DRAW STARS ---------- */

  function draw() {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    stars.forEach(function (star) {

      star.phase += star.speed;

      var alpha = Math.max(
        0.05,
        Math.min(
          1,
          star.base + Math.sin(star.phase) * 0.35
        )
      );


      ctx.beginPath();

      ctx.fillStyle =
        "rgba(" +
        star.tint +
        "," +
        alpha.toFixed(2) +
        ")";

      ctx.arc(
        star.x,
        star.y,
        star.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();

    });


    /* DRAW SHOOTING STARS */

    for (
      var i = shooters.length - 1;
      i >= 0;
      i--
    ) {

      var shooter = shooters[i];

      shooter.x += shooter.vx;

      shooter.y += shooter.vy;

      shooter.life++;


      var alpha =
        1 - shooter.life / shooter.max;


      var gradient = ctx.createLinearGradient(

        shooter.x,

        shooter.y,

        shooter.x - shooter.vx * 9,

        shooter.y - shooter.vy * 9

      );


      gradient.addColorStop(
        0,
        "rgba(255,255,255," +
        alpha.toFixed(2) +
        ")"
      );


      gradient.addColorStop(
        1,
        "rgba(124,92,255,0)"
      );


      ctx.strokeStyle = gradient;

      ctx.lineWidth = 1.8;

      ctx.beginPath();

      ctx.moveTo(
        shooter.x,
        shooter.y
      );

      ctx.lineTo(
        shooter.x - shooter.vx * 9,
        shooter.y - shooter.vy * 9
      );

      ctx.stroke();


      if (shooter.life >= shooter.max) {

        shooters.splice(i, 1);

      }

    }


    if (!reduceMotion) {

      animationFrame =
        requestAnimationFrame(draw);

    }

  }


  /* ---------- AUTOMATIC SHOOTING STARS ---------- */

  var shooterTimer;


  function scheduleShooter() {

    shooterTimer = window.setTimeout(function () {

      if (!document.hidden) {

        spawnShooter();

      }

      scheduleShooter();

    }, 4000 + Math.random() * 6000);

  }


  /* ---------- INITIALIZE ---------- */

  resize();

  window.addEventListener("resize", resize);


  if (!reduceMotion) {

    draw();

    scheduleShooter();

  }


  /* ---------- PAUSE WHEN TAB IS HIDDEN ---------- */

  document.addEventListener(
    "visibilitychange",
    function () {

      if (document.hidden && animationFrame) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

        clearTimeout(shooterTimer);

      }

      else if (
        !document.hidden &&
        !reduceMotion &&
        !animationFrame
      ) {

        draw();

        scheduleShooter();

      }

    }
  );

})();