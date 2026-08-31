(function () {
  "use strict";

  /* ─── Countdown ─── */
  var WEDDING_DATE = new Date("2026-10-18T11:00:00+05:30").getTime();

  function tickCountdown() {
    var diff = Math.max(0, WEDDING_DATE - Date.now());
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff / 3600000) % 24);
    var m = Math.floor((diff / 60000) % 60);
    var s = Math.floor((diff / 1000) % 60);
    var pad = function (n) { return String(n).padStart(2, "0"); };
    document.getElementById("cd-days").textContent = pad(d);
    document.getElementById("cd-hours").textContent = pad(h);
    document.getElementById("cd-mins").textContent = pad(m);
    document.getElementById("cd-secs").textContent = pad(s);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ─── Full-page fixed petal rain ─── */
  function initPetalRain() {
    var canvas = document.createElement("canvas");
    canvas.id = "petal-rain-canvas";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "1000",
      opacity: "1",
    });
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var raf;
    var PETAL_COUNT = 55;

    // Wedding palette: dusty pink, blush beige, muted rose
    var BASE_COLORS = [
      [225, 197, 192], // dusty light pink/beige
      [212, 170, 164], // deeper pink-beige accent
      [185, 143, 137], // muted rose accent
      [245, 234, 231], // very light pink-beige
      [250, 246, 244], // soft ivory
      [230, 205, 200], // pale rose blush
    ];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function makePetal(spreadY) {
      var w = rand(5, 16);
      var c = BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)];
      return {
        x: rand(0, window.innerWidth),
        y: spreadY ? rand(-window.innerHeight, window.innerHeight) : rand(-40, -5),
        w: w,
        h: w * rand(0.38, 0.62),
        r: c[0], g: c[1], b: c[2],
        opacity: rand(0.18, 0.6),
        speed: rand(0.18, 0.55),
        drift: rand(-0.2, 0.2),
        angle: rand(0, Math.PI * 2),
        spin: rand(-0.012, 0.012),
        phase: rand(0, Math.PI * 2),
        wobble: rand(0.1, 0.4),
      };
    }

    resize();
    window.addEventListener("resize", resize);

    var petals = [];
    for (var i = 0; i < PETAL_COUNT; i++) petals.push(makePetal(true));
    var tick = 0;

    function draw() {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.x += p.drift + Math.sin(tick * 0.012 + p.phase) * p.wobble;
        p.y += p.speed;
        p.angle += p.spin;

        if (p.x < -30) p.x = canvas.width + 20;
        if (p.x > canvas.width + 30) p.x = -20;

        if (p.y > canvas.height + 30) {
          Object.assign(p, makePetal(false));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.w * 0.6);
        grad.addColorStop(0, "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.opacity + ")");
        grad.addColorStop(1, "rgba(" + p.r + "," + p.g + "," + p.b + ",0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = p.opacity * 0.35;
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.ellipse(-p.w * 0.11, -p.h * 0.14, p.w * 0.2, p.h * 0.15, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
  }
  initPetalRain();

  /* ─── Confetti popper ─── */
  function launchConfetti() {
    var colors = ["#CAAA9F", "#D9BEB5", "#CAAA9F", "#FAF6F4", "#F5EAE7", "#6E514D"];
    var container = document.getElementById("rsvp-confetti-root");
    if (!container) return;
    container.innerHTML = "";
    for (var i = 0; i < 90; i++) {
      var dot = document.createElement("span");
      dot.className = "confetti-dot";
      var color = colors[Math.floor(Math.random() * colors.length)];
      var size = Math.random() * 10 + 6;
      var angleRad = (Math.random() * 360) * (Math.PI / 180);
      var dist = Math.random() * 220 + 80;
      var tx = Math.cos(angleRad) * dist;
      var ty = Math.sin(angleRad) * dist;
      var dur = Math.random() * 0.8 + 0.7;
      var delay = Math.random() * 0.35;
      dot.style.cssText =
        "background:" + color + ";" +
        "width:" + size + "px;height:" + size + "px;" +
        "border-radius:" + (Math.random() > 0.4 ? "50%" : "2px") + ";" +
        "--tx:" + tx + "px;--ty:" + ty + "px;" +
        "animation: confetti-burst " + dur + "s ease-out " + delay + "s forwards;";
      container.appendChild(dot);
    }
  }

  /* ─── RSVP buttons ─── */
  var rsvpAnswer = null;
  var yesBtn = document.getElementById("attend-yes-btn");
  var noBtn = document.getElementById("attend-no-btn");
  var thanksEl = document.getElementById("attend-thanks");
  var regretEl = document.getElementById("attend-regret");

  function setRsvp(answer) {
    if (rsvpAnswer !== null) return;
    rsvpAnswer = answer;
    yesBtn.disabled = true;
    noBtn.disabled = true;
    if (answer === "yes") {
      yesBtn.classList.add("is-selected");
      yesBtn.querySelector(".attend-opt-icon").textContent = "✓";
      thanksEl.style.display = "";
      launchConfetti();
    } else {
      noBtn.classList.add("is-selected");
      noBtn.querySelector(".attend-opt-icon").textContent = "✕";
      regretEl.style.display = "";
    }
  }

  yesBtn.addEventListener("click", function () { setRsvp("yes"); });
  noBtn.addEventListener("click", function () { setRsvp("no"); });

  /* ─── Audio toggle ─── */
  var audio = document.getElementById("bg-audio");
  var audioFab = document.getElementById("audio-fab");
  var audioFabIcon = document.getElementById("audio-fab-icon");
  var playing = false;

  function setPlayingUI(isPlaying) {
    playing = isPlaying;
    audioFab.classList.toggle("playing", isPlaying);
    audioFabIcon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-music";
  }

  function toggleAudio() {
    if (audio.paused) {
      audio.volume = 0.6;
      audio.play().then(function () { setPlayingUI(true); }).catch(function () {});
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  }
  audioFab.addEventListener("click", toggleAudio);

  /* ─── Intro overlay open ─── */
  var wedRoot = document.getElementById("wed-root");
  var introOverlay = document.getElementById("intro-overlay");
  var introBtn = document.getElementById("intro-btn");

  introBtn.addEventListener("click", function () {
    wedRoot.classList.remove("is-closed");
    wedRoot.classList.add("is-opened");
    introOverlay.classList.add("intro-hidden");
    introOverlay.setAttribute("aria-hidden", "true");
    if (audio.paused) {
      audio.volume = 0.6;
      audio.play().then(function () { setPlayingUI(true); }).catch(function () {});
    }
  });

  /* ─── GSAP animations (intro reveal + scroll reveals) ─── */
  function waitForGsap(cb) {
    var check = function () {
      if (window.gsap && window.ScrollTrigger) return cb();
      setTimeout(check, 50);
    };
    check();
  }

  waitForGsap(function () {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    var tl = gsap.timeline();
    tl.from(".bismillah-ar span", {
      opacity: 0,
      y: 24,
      filter: "blur(12px)",
      duration: 1.3,
      stagger: 0.3,
      ease: "power3.out",
    }).from(".bismillah-en, .intro-mark, .intro-names, .intro-btn", {
      opacity: 0,
      y: 16,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    gsap.utils.toArray("[data-stagger]").forEach(function (group) {
      var items = group.querySelectorAll("[data-stagger-item]");
      gsap.from(items, {
        opacity: 0,
        y: 50,
        duration: 0.9,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 82%" },
      });
    });
  });
})();
