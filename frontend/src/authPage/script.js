const starsEl = document.getElementById('stars')

for (let i = 0; i < 60; i++) {
    const s = document.createElement('div')
    s.className = 'star';
    const size = Math.random() * 2 + 1
    s.style.cssText = `
          width:${size}px; height:${size}px
          top:${Math.random() * 100}vh; left:${Math.random() * 100}vw
          --dur:${(Math.random() * 4 + 2).toFixed(1)}s
          --delay:${(Math.random() * 5).toFixed(1)}s
          --op:${(Math.random() * 0.4 + 0.2).toFixed(2)}`
    
    starsEl.appendChild(s)
}

function flip() { document.getElementById('flipper').classList.toggle('flipped') }

function showErr(id, msg) {
    const el = document.getElementById(id)
    el.textContent = msg
    el.classList.add('show')
}

function clearErr(id) { document.getElementById(id).classList.remove('show') }

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

function showToast(msg) {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 3200)
}

async function handleLogin() {
    let ok = true
    const email = document.getElementById('loginEmail').value.trim()
    const pass = document.getElementById('loginPass').value

    clearErr('loginEmailErr')
    clearErr('loginPassErr')

    if (!isValidEmail(email)) {
        showErr('loginEmailErr', 'Please enter a valid email.')
        ok = false
    }

    if (pass.length < 6) {
        showErr('loginPassErr', 'Password must be at least 6 characters.')
        ok = false
    }

    if (ok) {
        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: pass
                })
            })

            const result = await res.json()

            if (res.ok) {
                localStorage.setItem("token", result.data.token)

                showToast("Logged in!");

                setTimeout(() => { window.location.href = "/seat.html" }, 100)

                console.log("TOKEN:", result.data.token)

            } else {
                showToast(result.message)
            }

        } catch (err) {
            console.error(err)
            showToast("Server error")
        }
    }
}

async function handleRegister() {
    let ok = true
    const name = document.getElementById('regName').value.trim()
    const email = document.getElementById('regEmail').value.trim()
    const pass = document.getElementById('regPass').value
    const pass2 = document.getElementById('regPass2').value

    clearErr('regNameErr'); clearErr('regEmailErr')
    clearErr('regPassErr'); clearErr('regPass2Err')

    if (!name) {
        showErr('regNameErr', 'Please enter your name.')
        ok = false
    }

    if (!isValidEmail(email)) {
        showErr('regEmailErr', 'Please enter a valid email')
        ok = false
    }

    if (pass.length < 6) {
        showErr('regPassErr', 'Password must be at least 6 characters')
        ok = false
    }

    if (pass !== pass2) {
        showErr('regPass2Err', 'Passwords do not match.')
        ok = false
    }

    if (ok) {
        const data = {
            name: name,
            email: email,
            password: pass,
            confirmPassword: pass2
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (res.ok) {
                localStorage.setItem("token", result.data.token)
                showToast("Account created! Welcome")
                setTimeout(() => {
                    window.location.href = "/seat.html"
                }, 100)
            } else {
                showToast(result.message)
            }
        } catch (err) {
            console.error(err)
            showToast("Server error")
        }
    }
}

