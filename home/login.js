window.onload = function () {
    const hasVisited = localStorage.getItem('user');
    if (hasVisited) {
        const singUpDiv = document.getElementById('signupForm');
        singUpDiv.style.display = 'none'
    } else {
        const loginDiv = document.getElementById('loginForm');
        loginDiv.style.display = 'none'
    }
};
function signup() {
    const fullName = document.getElementById('fullName').value;
    const idNumber = document.getElementById('idNumberSignup').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('passwordSignup').value;
    if (!fullName || !idNumber || !email || !password) {
        console.log('no reply');
        document.getElementById('signupError').textContent = 'Please fill in all fields'
    } else if (!fullName.includes(' ') || fullName.length < 4) {
        document.getElementById('signupError').textContent = 'Please fill a ful name'
    } else if (!idNumber.length === 9 || isNaN(parseFloat(idNumber))) {
        document.getElementById('signupError').textContent = 'Please fill a valid ID'
    } else if (!email.includes('@' || email.length < 7)) {
        document.getElementById('signupError').textContent = 'Please fill a valid email'
    } else if (password.length < 8) {
        document.getElementById('signupError').textContent = 'Please fill a valid password'
    } else {
        localStorage.setItem('user', JSON.stringify({ fullName, idNumber, email, password }));
        window.location.href = 'home.html';

    }
}


function login() {
    const user = JSON.parse(localStorage.getItem('user'))
    const idNumber = document.getElementById('idNumberLogin').value;
    const password = document.getElementById('passwordLogin').value;
    if (!idNumber || !password) {
        document.getElementById('loginError').textContent = 'Please fill in all fields'
    } else if (user.idNumber !== idNumber) {
        document.getElementById('loginError').textContent = 'User not found Please check the ID'
    }else if(user.password !== password) {
        document.getElementById('loginError').textContent = 'The code is incorrect please try agin'
    }else{
        window.location.href = 'home.html'
    }
}