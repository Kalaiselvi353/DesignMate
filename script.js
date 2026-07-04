const deck = document.querySelector("#deck");
const slides = Array.from(deck.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".nav-dot"));
const previousButton = document.querySelector(".slide-arrow.previous");
const nextButton = document.querySelector(".slide-arrow.next");
const progressBar = document.querySelector("#progressBar");
const canvas = document.querySelector("#jewelCanvas");
const context = canvas.getContext("2d");

let particles = [];
let activeIndex = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = window.innerWidth < 720 ? 34 : 58;
    particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 0.8 + 0.2,
        size: Math.random() * 2.4 + 0.8,
        speed: Math.random() * 0.22 + 0.07,
        phase: index * 0.35
    }));
}

function drawGemDust(time = 0) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
        particle.x -= particle.speed * particle.z;
        particle.y += Math.sin(time * 0.001 + particle.phase) * 0.18;

        if (particle.x < -20) {
            particle.x = window.innerWidth + 20;
            particle.y = Math.random() * window.innerHeight;
        }

        const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 7);
        glow.addColorStop(0, `rgba(242, 198, 117, ${0.34 * particle.z})`);
        glow.addColorStop(0.42, `rgba(184, 109, 255, ${0.18 * particle.z})`);
        glow.addColorStop(1, "rgba(124, 60, 255, 0)");

        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 7, 0, Math.PI * 2);
        context.fill();
    });

    if (!prefersReducedMotion) {
        requestAnimationFrame(drawGemDust);
    }
}

function setActiveSlide(index) {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));

    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === activeIndex);
    });

    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;

    if (progressBar) {
        progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    }
}

function goToSlide(index) {
    const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
    setActiveSlide(targetIndex);
    deck.scrollTo({ left: slides[targetIndex].offsetLeft, behavior: "smooth" });
}

const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            setActiveSlide(slides.indexOf(entry.target));
        }
    });
}, { root: deck, threshold: 0.58 });

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
        }
    });
}, { root: deck, threshold: 0.16 });

slides.forEach((slide) => slideObserver.observe(slide));
document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 85}ms`;
    revealObserver.observe(element);
});

dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", (event) => {
        event.preventDefault();
        goToSlide(dotIndex);
    });
});

previousButton.addEventListener("click", () => goToSlide(activeIndex - 1));
nextButton.addEventListener("click", () => goToSlide(activeIndex + 1));

deck.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        deck.scrollLeft += event.deltaY;
    }
}, { passive: false });

window.addEventListener("keydown", (event) => {
    const nextKeys = ["ArrowRight", "PageDown", " "];
    const previousKeys = ["ArrowLeft", "PageUp"];

    if (nextKeys.includes(event.key)) {
        event.preventDefault();
        goToSlide(activeIndex + 1);
    }

    if (previousKeys.includes(event.key)) {
        event.preventDefault();
        goToSlide(activeIndex - 1);
    }
});

window.addEventListener("resize", () => {
    resizeCanvas();
    goToSlide(activeIndex);
});

setActiveSlide(0);
resizeCanvas();
drawGemDust();
