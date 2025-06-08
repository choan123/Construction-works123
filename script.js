document.addEventListener("DOMContentLoaded", () => {
    const pinKey = "app_pin";
    const attemptsKey = "pin_attempts";
    const firstKey = "first_time_done";
    const firstCode = "8551";
    const maxAttempts = 20;

    const displayDots = document.querySelectorAll('.dot');
    const banner = document.getElementById("banner");
    const keyboard = document.getElementById("keyboard");

    let pin = '';
    let mode = localStorage.getItem(firstKey) ? 'login' : 'first';

    const modeTitles = {
        first: "הזן קוד ראשוני (8551)",
        setPin: "הגדר קוד PIN חדש",
        login: "הזן קוד PIN"
    };

    document.querySelector("h2").innerText = modeTitles[mode];

    function showBanner(message, duration = 2500) {
        banner.textContent = message;
        banner.classList.remove("hidden");
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
                showBanner("נא להזין 4 ספרות");
                return;
            }

            // מצב: קוד ראשוני
            if (mode === "first") {
                if (pin === firstCode) {
                    localStorage.setItem(firstKey, "true");
                    mode = "setPin";
                    document.querySelector("h2").innerText = modeTitles[mode];
                    showBanner("קוד נכון, עכשיו בחר קוד חדש");
                } else {
                    window.location.href = "codes.html";
                }
            }

            // מצב: הגדרת קוד חדש
            else if (mode === "setPin") {
                localStorage.setItem(pinKey, pin);
                localStorage.setItem(attemptsKey, "0");
                mode = "login";
                document.querySelector("h2").innerText = modeTitles[mode];
                showBanner("הקוד נשמר בהצלחה");
            }

            // מצב: התחברות רגילה
            else if (mode === "login") {
                const savedPin = localStorage.getItem(pinKey);
                let attempts = parseInt(localStorage.getItem(attemptsKey) || "0");

                if (pin === savedPin) {
                    showBanner("ברוך הבא!");
                    localStorage.setItem(attemptsKey, "0");
                    // window.location.href = "home.html";
                } else {
                    attempts++;
                    localStorage.setItem(attemptsKey, attempts);
                    if (attempts >= maxAttempts) {
                        window.location.href = "codes.html";
                    } else {
                        showBanner(`קוד שגוי. ניסיון ${attempts} מתוך ${maxAttempts}`);
                    }
                }
            }

            resetPIN();
        } else if (pin.length < 4 && /^\d$/.test(key)) {
            pin += key;
        }

        updateDisplay();
    });
});
