/* OMEII — intro vidéo de la page d'accueil.
   Joue une seule fois par session de navigation (sessionStorage),
   respecte prefers-reduced-motion, et peut être passée à tout moment. */

function initIntro() {
  const overlay = document.querySelector("[data-intro-overlay]");
  if (!overlay) return;

  const seenKey = "omeii-intro-seen";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (sessionStorage.getItem(seenKey) || reduceMotion) {
    overlay.remove();
    return;
  }

  const media = overlay.querySelector("img");
  const skipBtn = overlay.querySelector("[data-intro-skip]");

  const hide = () => {
    overlay.classList.add("is-hidden");
    sessionStorage.setItem(seenKey, "1");
    setTimeout(() => overlay.remove(), 650);
  };

  media.addEventListener("error", hide);
  skipBtn.addEventListener("click", hide);

  // Un GIF n'émet pas d'événement "ended" : on masque l'intro après un délai fixe.
  setTimeout(hide, 3000);
}

document.addEventListener("DOMContentLoaded", initIntro);
