$(function(){
    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDelete').on('click', ()=> {
        if (!confirm('Are you sour wanna delete this item ?'))
            return false;
    });
});    