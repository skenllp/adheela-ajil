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

  /* ─── RSVP — Google Sheets integration ─── */
  // ⚠️  Replace with your deployed Google Apps Script web app URL:
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-q1_OI60zuIXxPv3GugszjxZUrRN1EsK_plX2nH9Wy87RCHjUaO2Q5LyLg7OfP6WC/exec";

  var attendanceVal = null; // "Yes" or "No"
  var thanksEl      = document.getElementById("attend-thanks");
  var thanksText    = document.getElementById("attend-thanks-text");
  var rsvpCard      = document.getElementById("rsvp-card");
  var submitLabel   = document.getElementById("rsvp-submit-label");
  var guestsRow     = document.getElementById("rsvp-guests-row");

  /* ── Guest counter stepper ── */
  var guestCount = 1;
  var stepCount  = document.getElementById("step-count");
  document.getElementById("step-minus").addEventListener("click", function () {
    if (guestCount > 1) { guestCount--; stepCount.textContent = guestCount; }
  });
  document.getElementById("step-plus").addEventListener("click", function () {
    if (guestCount < 20) { guestCount++; stepCount.textContent = guestCount; }
  });

  /* ── Attendance toggle buttons ── */
  var toggleYes = document.getElementById("rsvp-toggle-yes");
  var toggleNo  = document.getElementById("rsvp-toggle-no");

  function selectAttendance(val) {
    attendanceVal = val;
    toggleYes.classList.toggle("rsvp-toggle-active", val === "Yes");
    toggleNo.classList.toggle("rsvp-toggle-active", val === "No");
    toggleYes.classList.toggle("rsvp-toggle-inactive", val === "No");
    toggleNo.classList.toggle("rsvp-toggle-inactive", val === "Yes");

    // Show/hide guests row
    if (val === "Yes") {
      guestsRow.style.display = "";
      guestsRow.classList.add("rsvp-guests-open");
      submitLabel.textContent = "Confirm RSVP 🌸";
    } else {
      guestsRow.style.display = "none";
      guestsRow.classList.remove("rsvp-guests-open");
      submitLabel.textContent = "Send Warm Wishes 🤍";
    }
  }

  toggleYes.addEventListener("click", function () { selectAttendance("Yes"); });
  toggleNo.addEventListener("click",  function () { selectAttendance("No");  });

  /* ── Send data to Google Sheets ── */
  function sendToSheet(payload, onSuccess, onError) {
    // NOTE: mode:"no-cors" only allows CORS-safelisted Content-Types.
    // application/json causes the body to be dropped → use text/plain instead.
    // Apps Script still receives the raw JSON string via e.postData.contents.
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    })
      .then(function () { onSuccess(); })
      .catch(function (err) { console.error("RSVP send error:", err); onError(); });
  }

  /* ── Single form submit ── */
  document.getElementById("rsvp-main-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate attendance selected
    if (!attendanceVal) {
      toggleYes.focus();
      toggleYes.classList.add("rsvp-toggle-shake");
      toggleNo.classList.add("rsvp-toggle-shake");
      setTimeout(function () {
        toggleYes.classList.remove("rsvp-toggle-shake");
        toggleNo.classList.remove("rsvp-toggle-shake");
      }, 500);
      return;
    }

    var name = document.getElementById("rsvp-name").value.trim();
    if (!name) { document.getElementById("rsvp-name").focus(); return; }

    var submitBtn  = document.getElementById("rsvp-main-submit");
    var sendingMsg = document.getElementById("rsvp-sending-main");
    submitBtn.disabled = true;
    sendingMsg.style.display = "";

    var payload = {
      name:      name,
      mobile:    document.getElementById("rsvp-mobile").value.trim(),
      attending: attendanceVal,
      guests:    attendanceVal === "Yes" ? guestCount : 0,
      message:   document.getElementById("rsvp-message").value.trim(),
      timestamp: new Date().toISOString(),
    };

    function onDone() {
      rsvpCard.style.display = "none";
      thanksText.textContent = attendanceVal === "Yes"
        ? "Jazakallah Khair! We look forward to celebrating with you! 🎉"
        : "We understand, and we appreciate your warm wishes. May Allah bless you always. 🤍";
      thanksEl.style.display = "";
      if (attendanceVal === "Yes") launchConfetti();
    }

    sendToSheet(payload, onDone, onDone);
  });

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
