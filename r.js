function redirect_lang() {
    var lang = window.navigator.language;
    if ( lang.match(/en/)) {
        window.location.href = './index_en.html';
    }
}
window.onload = function(){
    redirect_lang();
    }
