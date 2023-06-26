'use strict';

let hostname = window.location.hostname;
const port = (hostname === 'localhost' ? 3000 : 8090);
import $ from 'jquery';
import io from 'socket.io-client';
const socket = io('wss://' + hostname + '/users/classes');
let entrySocket = io('wss://' + hostname + '/users/entries');

socket.on('reload', function () {
    location.reload();
});

$(document).ready(function () {
    let modal = UIkit.modal('div.uk-modal', {center: true});

    function errorHandler (err) {
        modal.find('div.uk-modal-dialog').text(err);
        modal.show();

        setTimeout(function () {
            modal.hide();
        }, 15000);
    }

    socket.on('err', errorHandler);

    //-----------------------------------
    //---------- Class details ----------
    $('div.content').on('click', 'div.class-details ul.details li', function () { // On class details item click, replace text with input
        let value = $(this).html().replace(/\<br\>/g, "\n");
        let name = $(this).attr('id');

        if($(this).find('input, textarea').length === 0){
            $(this).closest('ul').find('li input, li select').each(function () {
                let inputVal = $(this).val();
                $(this).trigger('change');
                $(this).replaceWith(inputVal);
            });

            if(name !== 'gender' && name !== 'minimumAge') {
                $(this).attr('class', 'uk-form').html('<input type="text" name="' + name + '" value="' + value + '" />');
            }
            else if (name == 'gender') {
                $(this).attr('class', 'uk-form').html('<select name="gender">' +
                                                        '<option ' + (value == 'male' ? 'checked' : '') + ' value="Male">Male</option>' +
                                                        '<option ' + (value == 'female' ? 'checked' : '') + ' value="Female">Female</option>');
            }
            else{
                // TODO: ADD input and select box for minimum age
            }
        }
    });

    $('body').click(function (e) { // On anything but show details input click, replace input element with valu
        let classDetails = [];
        $('div.class-details ul.details li').each(function () { // For each
            let name = $(this).attr('id');
            classDetails.push(name);
        });

        if(classDetails.indexOf(e.target.id) === -1 && classDetails.indexOf(e.target.name) === -1){
            $('div.class-details ul.details li').find('select, input').each(function () { // For each show detail li input replace with text
                let inputVal = $(this).val().replace(/\n|\r\n|\r/g, '<br />');
                $(this).trigger('change');
                $(this).replaceWith(inputVal);
            });
        }
    });

    //---------- Class details ----------
    //-----------------------------------

    //-----------------------------------
    //---------- Entry details ----------



    //---------- Entry details ----------
    //-----------------------------------
});
