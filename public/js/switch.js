'use strict';

$(document).ready(function(){
    $('input.onoffswitch-checkbox').click(function () {
        var containerDiv = $(this).closest('div.onoffswitch');
        var checked = $(this).is(':checked');
        if(checked){
            containerDiv.find('.onoffswitch-inner').css('margin-left', 0);
            containerDiv.find('.onoffswitch-switch').css('right', '0px');
        }
        else{
            containerDiv.find('.onoffswitch-inner').css('margin-left', '-100%');
            containerDiv.find('.onoffswitch-switch').css('right', '56px');
        }
    });
});
