document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://ptwlvrtzjwsvzrbuepvs.supabase.co";
    const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0d2x2cnR6andzdnpyYnVlcHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzAyMjIsImV4cCI6MjA2NDkwNjIyMn0.R7ITezkrnw5wD3ab_sQ6idXX1e7Cn-0_SFFAlVX2BC0";
    const USER_ID = "5fcb76f5-bce1-4e33-b1b9-63fa6c51cb3e";

    const banner = document.getElementById("banner");

    function showBanner(message, duration = 3000) {
        banner.textContent = message;
        banner.classList.remove("hidden");
        clearTimeout(banner._timeout);
        banner._timeout = setTimeout(() => {
            banner.classList.add("hidden");
        }, duration);
    }

    // 👇 שלב ראשוני - בדיקת כניסה ראשונה
    if (!localStorage.getItem("first_time_done")) {
        let firstPIN = prompt("הזן קוד ראשוני");
        if (firstPIN !== "8551") {
            window.location.href = "codes.html";
            return;
        }
        localStorage.setItem("first_time_done", "true");
    }

    // 👇 המשך קוד רגיל...
    let pin = '';
    const maxAttempts = 20;
    const displayDots = document.querySelectorAll('.dot');
    const attemptsKey = "pin_attempts";
    const pinKey = "app_pin";

    async function isLocked() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/security_state?user_id=eq.${USER_ID}`, {
                headers: {
                    "apikey": SUPABASE_API_KEY,
                    "Authorization": `Bearer ${SUPABASE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            return data[0]?.locked === true;
        } catch (err) {
            console.error("שגיאה בבדיקת נעילה:", err);
            return false;
        }
    }

    async function lockAccount() {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/security_state?user_id=eq.${USER_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_API_KEY,
                    "Authorization": `Bearer ${SUPABASE_API_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ locked: true })
            });
        } catch (err) {
            console.error("שגיאה בנעילה:", err);
        }
    }

    async function unlockAccount() {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/security_state?user_id=eq.${USER_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_API_KEY,
                    "Authorization": `Bearer ${SUPABASE_API_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ locked: false })
            });
        } catch (err) {
            console.error("שגיאה בשחרור נעילה:", err);
        }
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

    document.getElementById('keyboard').addEventListener('click', async (e) => {
        if (!e.target.classList.contains('key')) return;
        const key = e.target.textContent;

        if (await isLocked()) {
            showBanner("הגישה ננעלה לאחר 20 ניסיונות שגויים. יש לשחרר דרך Supabase.");
            return;
        }

        if (key === '⌫') {
            pin = pin.slice(0, -1);
        } else if (key === '✔') {
            if (pin.length !== 4) {
                showBanner('נא להזין 4 ספרות');
                return;
            }

            const savedPin = localStorage.getItem(pinKey);
            let attempts = parseInt(localStorage.getItem(attemptsKey) || "0");

            if (savedPin) {
                if (pin === savedPin) {
                    showBanner('ברוך הבא! קוד נכון');
                    localStorage.setItem(attemptsKey, "0");
                    await unlockAccount();
                    // window.location.href = "home.html";
                } else {
                    attempts++;
                    localStorage.setItem(attemptsKey, attempts);
                    if (attempts >= maxAttempts) {
                        await lockAccount();
                        showBanner("נעילת גישה לאחר 20 ניסיונות. ניתן לשחרר דרך Supabase.");
                    } else {
                        showBanner(`קוד שגוי. ניסיון ${attempts} מתוך ${maxAttempts}`);
                    }
                }
            } else {
                localStorage.setItem(pinKey, pin);
                localStorage.setItem(attemptsKey, "0");
                showBanner('קוד נשמר. בפעם הבאה תתבקש להזין אותו.');
            }

            resetPIN();
        } else if (pin.length < 4 && /^\d$/.test(key)) {
            pin += key;
        }

        updateDisplay();
    });

    if (!localStorage.getItem(pinKey)) {
        showBanner('הזן קוד PIN חדש');
    }
});
