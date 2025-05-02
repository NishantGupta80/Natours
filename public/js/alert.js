export const HideAlert = () =>{
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el);
}




export const showAlert = (type,msg) =>{
    HideAlert();
    const markUp = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',markUp);
    window.setTimeout(HideAlert,5000);
}