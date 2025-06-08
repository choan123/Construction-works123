document.addEventListener("DOMContentLoaded", () => {
    const pinKey = "app_pin";
    const firstKey = "first_time_done";
    const firstCode = "8551";

    const displayDots = document.querySelectorAll('.dot');
    const banner = document.getElementById("banner");
    const keyboard = document.getElementById("keyboard");

    let pin = '';
    let mode = localStorage.getItem(firstKey)
        ? (localStorage.getItem(pinKey) ? 'login' : 'setPin')
        : 'first';

    const modeTitles = {
        first: "הזן קוד ראשוני",
        setPin: "הגדר קוד PIN חדש",
        login: "הזן קוד PIN"
    };

    document.querySelector("h2").innerText = modeTitles[mode];

    function showBanner(message, type = "info", duration = 2500) {
        banner.textContent = message;
        banner.classList.remove("hidden", "error", "info");
        banner.classList.add(type);
        clearTimeout(banner._timeout);
        banner._timeout = setTimeout(() => {
            banner.classList.add("hidden");
        }, duration);
    }

    function updateDisplay() {
        displayDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < pin.length);
        });
    }

    function resetPIN() {
        pin = '';
        updateDisplay();
    }

    keyboard.addEventListener("click", (e) => {
        if (!e.target.classList.contains("key")) return;
        const key = e.target.textContent;

        if (key === "⌫") {
            pin = pin.slice(0, -1);
        } else if (key === "✔") {
            if (pin.length !== 4) {
                showBanner("נא להזין 4 ספרות", "error");
                return;
            }

            // שלב 1: קוד ראשוני
            if (mode === "first") {
                if (pin === firstCode) {
                    localStorage.setItem(firstKey, "true");
                    mode = "setPin";
                    document.querySelector("h2").innerText = modeTitles[mode];
                    showBanner("קוד ראשוני נכון, עכשיו בחר קוד חדש", "info");
                } else {
                    window.location.href = "codes.html";
                    return;
                }
            }

            // שלב 2: הגדרת קוד חדש
            else if (mode === "setPin") {
                localStorage.setItem(pinKey, pin);
                showBanner("הקוד נשמר בהצלחה", "info");
                mode = "login";
                document.querySelector("h2").innerText = modeTitles[mode];
            }

            // שלב 3: התחברות רגילה
            else if (mode === "login") {
                const savedPin = localStorage.getItem(pinKey);
                if (pin === savedPin) {
                    showBanner("ברוך הבא!", "info");
                    setTimeout(() => {
                        window.location.href = "home.html";
                    }, 600);
                } else {
                    showBanner("קוד שגוי", "error");
                }
            }

            resetPIN();
        } else if (pin.length < 4 && /^\d$/.test(key)) {
            pin += key;
        }

        updateDisplay();
    });

    if (mode === "setPin") {
        showBanner("הזן קוד חדש לאבטחה", "info");
    }
});
