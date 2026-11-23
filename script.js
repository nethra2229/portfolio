(function () {
  "use strict";

  /* ---------- Tab switching ---------- */
  var sections = document.querySelectorAll(".tab-section");
  var tabButtons = document.querySelectorAll(".tab-btn");
  var triggers = document.querySelectorAll("[data-tab]");
  var nav = document.getElementById("tabNav");
  var menuToggle = document.getElementById("menuToggle");

  function showTab(id, updateHash) {
    var found = false;
    sections.forEach(function (s) {
      var match = s.id === id;
      s.classList.toggle("active", match);
      if (match) found = true;
    });
    if (!found) { id = "home"; document.getElementById("home").classList.add("active"); }

    tabButtons.forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === id);
    });

    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (updateHash) {
      try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignore */ }
    }
  }

  triggers.forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      showTab(el.getAttribute("data-tab"), true);
    });
  });

  menuToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("hashchange", function () {
    showTab(location.hash.replace("#", ""), false);
  });

  showTab(location.hash.replace("#", "") || "home", false);

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Starfield ---------- */
  var canvas = document.getElementById("starfield");
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stars = [];
  var shooters = [];
  var w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.min(260, Math.floor((w * h) / 6000));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        base: Math.random() * 0.6 + 0.3,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        tint: Math.random() < 0.2 ? "201,191,255" : (Math.random() < 0.15 ? "229,139,214" : "255,255,255")
      });
    }
  }

  function spawnShooter() {
    var startX = Math.random() * w * 0.8 + w * 0.1;
    shooters.push({
      x: startX,
      y: Math.random() * h * 0.4,
      vx: 7 + Math.random() * 4,
      vy: 3 + Math.random() * 2,
      life: 0,
      max: 55
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.phase += s.speed;
      var a = s.base + Math.sin(s.phase) * 0.35;
      if (a < 0.05) a = 0.05;
      if (a > 1) a = 1;
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + s.tint + "," + a.toFixed(2) + ")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var j = shooters.length - 1; j >= 0; j--) {
      var sh = shooters[j];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life++;
      var alpha = 1 - sh.life / sh.max;
      var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 9, sh.y - sh.vy * 9);
      grad.addColorStop(0, "rgba(255,255,255," + alpha.toFixed(2) + ")");
      grad.addColorStop(1, "rgba(124,92,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9);
      ctx.stroke();
      if (sh.life >= sh.max) shooters.splice(j, 1);
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  function scheduleShooter() {
    setTimeout(function () {
      if (!document.hidden) spawnShooter();
      scheduleShooter();
    }, 4000 + Math.random() * 6000);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
  if (!reduceMotion) scheduleShooter();
})();