// =========================
// Slideshow settings
// =========================
var SLIDE_TOTAL = 15;
var SLIDE_INTERVAL = 7000;   // ms per photo
var FADE_DURATION = 1600;    // must match CSS transition

var images = [];
for (var i = 1; i <= SLIDE_TOTAL; i++) images.push(`img${i}.jpg`);

var bgA, bgB;
var slideIndex = 0;
var usingA = true;
var slideshowTimer = null;

// =========================
// Notes settings
// =========================
var noteText;
var noteIndex = 0;
var NOTE_INTERVAL = 20000; // 20s
var TYPE_SPEED = 80;

// ✅ GLOBAL padding from top (so applyResponsiveText can see it)
var NOTE_TOP_PADDING = 100; // px from top (try 30–60)

var notes = [
  "My Sweet girl…\n4 months ago, I could live my life without anybody.\nFast forward to today, I can’t seem to look at life without you in it.\nI didn’t know I was this capable of love 🫠.",
  "The funny thing is…\nI don’t even need a special reason to be with you.\nYour existence alone is enough to make my day softer.",
  "Every time I talk to you,\nit feels like the world gets quieter.\nLike everything stressful just steps back for a moment.",
  "You’re the sweetest, kindest, most loving person I have ever known.\nYou make kindness, forgiveness and love  look so easy",
  "You’ve taught me beautiful things in this life. You’ve changed me for the better.",
  "I love the way you make simple things feel special.\nA conversation.\nA laugh.\nEven silence feels comfortable with you.",
  "I love the way you answer your phone when I call you “Heyyy baaaabbyyy”. its so Beautiful ❤️.\nI Love the way you make me feel. I love the way you hug me.",
  "I love the way you hold me whenever we’re together.",
  "Baby..\nI love your eyes.\nI love your hair.\nI love your smile.\nI love your intelligence and smartness.\nI love your hot body.\nBaby, I Love you !!!.",
  "You’re the kind of person I prayed for without knowing your name.\nAnd now that you’re here,\nI don’t want to take you for granted.",
  "I’m not perfect.\nBut if loving you is something I get to do,\nthen I promise I’ll always try to love you properly.",
  "You deserve patience.\nYou deserve reassurance.\nYou deserve someone who chooses you every day… and means it.",
  "I want to be the place you run to,\nnot the place you recover from.\nI want you to feel safe with me.",
  "If I could bottle up the way you make me feel,\nI swear it would be the sweetest thing in the world.\nThat’s what you are to me.",
  "So yeah…\nThis is me saying it clearly:\nI care about you deeply.\nAnd I’m really happy you’re in my life.",
  "Happy Valentines day my baby Girl.\nI Love you sooo mcch❤️."
];

var typingTimer = null;
var noteIntervalTimer = null;
var startedNotes = false;

// manual fade (no TweenJS)
var fadeMode = "none"; // "in" | "out" | "none"
var fadeSpeed = 0.06;
var pendingAfterFadeOut = false;

// =========================
// Hearts (CreateJS)
// =========================
var canvas, stage, container, overlay;
var HEART_COUNT = 60;

// =========================
// Init
// =========================
function init() {
  bgA = document.getElementById("bgA");
  bgB = document.getElementById("bgB");

  // Show first image immediately
  setBg(bgA, images[0], true);
  setBg(bgB, images[1], false);

  // preload images (smooth transitions)
  images.forEach(function (src) {
    var img = new Image();
    img.src = src;
  });

  // canvas setup
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  resizeCanvas();

  container = new createjs.Container(); // hearts
  overlay = new createjs.Container();   // notes on top
  stage.addChild(container);
  stage.addChild(overlay);

  createHearts();

  // notes text
  noteText = new createjs.Text("", "bold 30px Arial", "#ffffff");
  noteText.textAlign = "center";
  noteText.textBaseline = "top";
  noteText.x = canvas.width / 2;
  noteText.y = NOTE_TOP_PADDING;
  noteText.alpha = 0; // hidden until OK
  noteText.shadow = new createjs.Shadow("rgba(255, 0, 136, 0.85)", 0, 0, 28);
  overlay.addChild(noteText);
  applyResponsiveText();

  window.addEventListener("resize", function () {
    resizeCanvas();

    // optional: adapt padding a bit on resize (keeps it nice on small phones)
    // NOTE_TOP_PADDING = Math.max(30, Math.round(window.innerHeight * 0.06));

    noteText.x = canvas.width / 2;
    noteText.y = NOTE_TOP_PADDING;
    applyResponsiveText();
  });

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick", tick);

  setupModals();
}

// =========================
// Background helpers
// =========================
function setBg(el, src, visible) {
  el.style.backgroundImage = `url("${src}")`;
  el.style.opacity = visible ? "1" : "0";
}

function startSlideshow() {
  if (slideshowTimer) return;
  slideshowTimer = setInterval(nextSlide, SLIDE_INTERVAL);
}

function nextSlide() {
  slideIndex = (slideIndex + 1) % images.length;

  var showEl = usingA ? bgB : bgA;
  var hideEl = usingA ? bgA : bgB;

  // set next image on hidden layer, then fade it in
  showEl.style.transition = "none";
  showEl.style.opacity = "0";
  showEl.style.backgroundImage = `url("${images[slideIndex]}")`;

  // force reflow
  showEl.offsetHeight;

  showEl.style.transition = `opacity ${FADE_DURATION}ms ease-in-out`;
  hideEl.style.transition = `opacity ${FADE_DURATION}ms ease-in-out`;

  showEl.style.opacity = "1";
  hideEl.style.opacity = "0";

  usingA = !usingA;
}

// =========================
// Hearts
// =========================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createHearts() {
  container.removeAllChildren();

  for (var i = 0; i < HEART_COUNT; i++) {
    var heart = new createjs.Shape();
    heart.graphics.beginFill(
      createjs.Graphics.getHSL(Math.random() * 30 - 45, 100, 50 + Math.random() * 30)
    );
    heart.graphics
      .moveTo(0, -12)
      .curveTo(1, -20, 8, -20)
      .curveTo(16, -20, 16, -10)
      .curveTo(16, 0, 0, 12)
      .curveTo(-16, 0, -16, -10)
      .curveTo(-16, -20, -8, -20)
      .curveTo(-1, -20, 0, -12);

    resetHeart(heart, true);
    container.addChild(heart);
  }
}

function resetHeart(heart, initial) {
  var w = canvas.width;
  var h = canvas.height;

  heart._x = Math.random() * w;
  heart.y = initial ? (Math.random() * h) : (h + 80 + Math.random() * h);

  heart.perX = (1.3 + Math.random() * 1.6) * h;
  heart.offX = Math.random() * h;
  heart.ampX = heart.perX * 0.05 * (0.12 + Math.random() * 0.25);

  heart.velY = -(Math.random() * 1.1 + 0.35); // slow
  heart.scaleX = heart.scaleY = Math.random() * 0.9 + 0.55;

  heart._rotation = Math.random() * 16 - 8;
  heart.alpha = Math.random() * 0.50 + 0.20;

  heart.compositeOperation = Math.random() < 0.25 ? "lighter" : "source-over";
}

// =========================
// Notes logic
// =========================
function startNotes() {
  if (startedNotes) return;
  startedNotes = true;

  noteIndex = 0;
  noteText.text = "";
  noteText.alpha = 0;
  fadeMode = "in";

  typeNote(notes[noteIndex]);
  noteIntervalTimer = setInterval(forceNextNote, NOTE_INTERVAL);
}

function forceNextNote() {
  if (!startedNotes) return;

  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  pendingAfterFadeOut = true;
  fadeMode = "out";
}

function typeNote(fullText) {
  if (typingTimer) clearInterval(typingTimer);

  noteText.text = "";
  var i = 0;

  typingTimer = setInterval(function () {
    var raw = fullText.slice(0, i + 1);

    var maxWidth = Math.floor(canvas.width * 0.80);
    var fontSize = getResponsiveFontSize();
    noteText.font = "bold " + fontSize + "px Arial";

    noteText.text = wrapTextByWidth(raw, maxWidth, noteText.font);
    i++;

    if (i >= fullText.length) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }, TYPE_SPEED);
}

// =========================
// Responsive text helpers
// =========================
function getResponsiveFontSize() {
  var min = 18, max = 36;
  var size = Math.round(window.innerWidth * 0.055);
  return Math.max(min, Math.min(max, size));
}

function wrapTextByWidth(text, maxWidthPx, fontStr) {
  var ctx = document.createElement("canvas").getContext("2d");
  ctx.font = fontStr;

  var paragraphs = String(text).split("\n");
  var linesOut = [];

  for (var p = 0; p < paragraphs.length; p++) {
    var words = paragraphs[p].split(" ");
    var line = "";

    for (var i = 0; i < words.length; i++) {
      var testLine = line ? line + " " + words[i] : words[i];
      var testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidthPx && line) {
        linesOut.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    linesOut.push(line);

    if (p !== paragraphs.length - 1) linesOut.push("");
  }

  return linesOut.join("\n");
}

function applyResponsiveText() {
  if (!noteText) return;

  var fontSize = getResponsiveFontSize();
  noteText.font = "bold " + fontSize + "px Arial";

  var maxWidth = Math.floor(canvas.width * 0.80);
  noteText.text = wrapTextByWidth(noteText.text, maxWidth, noteText.font);

  noteText.x = canvas.width / 2;
  noteText.y = NOTE_TOP_PADDING; // keep it near the top always
}

// =========================
// Tick loop
// =========================
function tick(event) {
  // hearts movement
  for (var i = 0; i < container.numChildren; i++) {
    var heart = container.getChildAt(i);

    if (heart.y < -70) resetHeart(heart, false);

    var ang = (heart.offX + heart.y) / heart.perX * Math.PI * 2;
    heart.y += (heart.velY * heart.scaleX) / 2;
    heart.x = heart._x + Math.cos(ang) * heart.ampX;
    heart.rotation = heart._rotation + Math.sin(ang) * 10;
  }

  // note fade
  if (fadeMode === "in") {
    noteText.alpha = Math.min(1, noteText.alpha + fadeSpeed);
    if (noteText.alpha >= 1) fadeMode = "none";
  } else if (fadeMode === "out") {
    noteText.alpha = Math.max(0, noteText.alpha - fadeSpeed);
    if (noteText.alpha <= 0) {
      fadeMode = "none";
      if (pendingAfterFadeOut) {
        pendingAfterFadeOut = false;
        noteIndex = (noteIndex + 1) % notes.length;
        typeNote(notes[noteIndex]);
        fadeMode = "in";
      }
    }
  }

  stage.update(event);
}

// =========================
// Modals + Audio
// =========================
function setupModals() {
  $("#moodModal").modal("show");

  function goToHeadphonesModal() {
    $("#moodModal").modal("hide");
    setTimeout(function () {
      $("#headphonesModal").modal("show");
    }, 250);
  }

  $("#yesBtn1").on("click", goToHeadphonesModal);
  $("#yesBtn2").on("click", goToHeadphonesModal);

  $("#okHeadphones").on("click", function () {
    $("#headphonesModal").modal("hide");

    var song = document.getElementById("moodSong");
    song.volume = 0.85;
    song.play().catch(function (err) {
      console.log("Audio play blocked:", err);
    });

    startSlideshow();
    startNotes();
  });
}

init();




