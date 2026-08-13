// =========================
// MOBILE NAVIGATION
// =========================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    const isOpen = navLinks.classList.contains("active");

    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
});


// Close mobile menu after clicking a link

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");

        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "Open navigation");
    });
});


// =========================
// ANIMATED COUNTERS
// =========================

const counters = document.querySelectorAll(".counter");

const animateCounter = counter => {

    const target = Number(counter.dataset.target);

    let current = 0;

    const increment = Math.max(1, Math.ceil(target / 60));

    const updateCounter = () => {

        current += increment;

        if (current >= target) {
            counter.textContent = target;
            return;
        }

        counter.textContent = current;

        requestAnimationFrame(updateCounter);
    };

    updateCounter();
};


// Start counters when About section enters viewport

const counterObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                counters.forEach(counter => {
                    animateCounter(counter);
                });

                counterObserver.disconnect();
            }

        });

    },
    {
        threshold: 0.4
    }
);


const aboutSection = document.querySelector(".about");

if (aboutSection) {
    counterObserver.observe(aboutSection);
}


// =========================
// CONTACT FORM
// =========================

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {

        formMessage.textContent =
            "Please complete all fields.";

        return;
    }

    formMessage.textContent =
        `Thanks, ${name}. Your message has been received.`;

    contactForm.reset();

});


// =========================
// SCROLL REVEAL
// =========================

const revealElements = document.querySelectorAll(
    ".service-card, .project-card, .about-content, .about-visual, .contact-form"
);

revealElements.forEach(element => {

    element.style.opacity = "0";
    element.style.transform = "translateY(25px)";
    element.style.transition =
        "opacity 0.7s ease, transform 0.7s ease";

});


const revealObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

                revealObserver.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.15
    }
);


revealElements.forEach(element => {
    revealObserver.observe(element);
});


// =========================
// CURRENT YEAR
// =========================

const yearElement = document.querySelector(".footer p");

if (yearElement) {

    const currentYear = new Date().getFullYear();

    yearElement.innerHTML =
        `© ${currentYear} NexaTech Solutions. All rights reserved.`;
}