const signinbutton=document.querySelector('#sign-in-button');
const signupbutton=document.querySelector('#sign-up-button');
const container=document.querySelector('.container');
signupbutton.addEventListener('click',()=>{
    container.classList.add('sign-up-mode');
});
signinbutton.addEventListener('click',()=>{
    container.classList.remove('sign-up-mode');
});

