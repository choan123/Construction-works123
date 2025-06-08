document.addEventListener("DOMContentLoaded", () => {
    const pinKey = "app_pin";
    const attemptsKey = "pin_attempts";
    const maxAttempts = 20;

    const displayDots = document.querySelectorAll('.dot');
    const banner = document.getElementById("banner");
    let pin = '';

    function showBanner(message, duration = 3000) {
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

    // שלב 1: בדיקה אם זו כניסה ראשונה
    if (!localStorage.getItem("first_time_done")) {
        let firstPIN = prompt("קוד ראשוני (8551):");
        if (firstPIN === "8551") {
            localStorage.setItem("first_time_done", "true");
            alert("קוד ראשוני נכון, כעת הגדר קוד PIN חדש.");
        } else {
            window.location.href = "codes.html";
            return;
        }
    }

    document.getElementById('keyboard').addEventListener('click', (e) => {
        if (!e.target.classList.contains('key')) return;
        const key = e.target.textContent;

        if (key === '⌫') {
            pin = pin.slice(0, -1);
        } else if (key === '✔') {
            if (pin.length !== 4) {
                showBanner('נא להזין 4 ספרות');
                return;
            }

            const savedPin = localStorage.getItem(pinKey);
            let attempts = parseInt(localStorage.getItem(attemptsKey) || "0");

            // אם אין PIN – נשמר הפין הראשון שהוזן
            if (!savedPin) {
                localStorage.setItem(pinKey, pin);
                localStorage.setItem(attemptsKey, "0");
                showBanner('הקוד נשמר! תתבקש להזין אותו בפעם הבאה.');
            } else {
                if (pin === savedPin) {
                    localStorage.setItem(attemptsKey, "0");
                    showBanner('ברוך הבא!');
                    // window.location.href = "home.html";
                } else {
                    attempts++;
                    localStorage.setItem(attemptsKey, attempts);
                    if (attempts >= maxAttempts) {
                        showBanner("הגעת למקסימום ניסיונות. עובר לדף קוד גיבוי.");
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

    // הודעה התחלתית אם אין PIN
    if (!localStorage.getItem(pinKey)) {
        showBanner("הזן קוד PIN חדש");
    }
});
