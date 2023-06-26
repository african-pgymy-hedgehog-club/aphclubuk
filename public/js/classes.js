'use strict';
let hostname = window.location.hostname;
const port = (hostname === 'localhost' ? 3000 : 8090);
let $ = require('jquery');
import io from 'socket.io-client';
let socket = io('wss://' + hostname + '/users/shows');
let clasSocket = io('wss://' + hostname + '/users/classes');

socket.on('reload', function () {
    location.reload();
});

$(document).ready(function () {
    let modal = UIkit.modal('div.uk-modal', { center: true });

    function errorHandler (err) {
        modal.find('div.uk-modal-dialog').text(err);
        modal.show();

        setTimeout(function () {
            modal.hide();
        }, 15000);
    }

    socket.on('err', errorHandler);
    clasSocket.on('err', errorHandler);

    //----------------------------------
    //---------- Show details ----------
    $('div.content').on('click', 'div.show-details ul.details li', function () { // On show details item click, replace text with input
        let value = $(this).html().replace(/\<br\>/g, "\n");
        let name = $(this).attr('id');

        if($(this).find('input, textarea').length === 0){
            $(this).closest('ul').find('li input, li textarea').each(function () { // For each show detail li input replace with text
                let inputVal = $(this).val().replace(/\n|\r\n|\r/g, '<br />');
                $(this).trigger('change');
                $(this).replaceWith(inputVal);
            });

            if($(this).attr('id') !== 'location'){
                $(this).attr('class', 'uk-form').html('<input type="text" name="' + name + '" value="' + value + '" />');
            }
            else{
                $(this).attr('class', 'uk-form').html('<textarea name="' + name + '">' + value + '</textarea>');
            }
        }
    });

    $('body').click(function (e) { // On anything but show details input click, replace input element with valu
        let showDetails = [];
        $('div.show-details ul.details li').each(function () { // For each
            let name = $(this).attr('id');
            showDetails.push(name);
        });

        if(showDetails.indexOf(e.target.id) === -1 && showDetails.indexOf(e.target.name) === -1){
            $('div.show-details ul.details li').find('textarea, input').each(function () { // For each show detail li input replace with text
                let inputVal = $(this).val().replace(/\n|\r\n|\r/g, '<br />');
                $(this).trigger('change');
                $(this).replaceWith(inputVal);
            });
        }
    });

    $('div.content').on('change', 'div.show-details ul.details li input, div.show-details ul.details li textarea', function () { // On show details input and textarea change update, document in the database
        let id = $(this).closest('ul').attr('id');
        let name = $(this).attr('name');
        let value = $(this).val().replace(/<br\>/g, "\n");

        socket.emit('update', id, name, value);
    });

    //---------- Show details ----------
    //----------------------------------

    //-----------------------------------
    //---------- Class details ----------
    $('button#add-class').click(function () { // On add class button click, display add class form in modal
        modal.find('div.uk-modal-dialog').html(JST['views/client/add-class-form']());
        modal.show();
    });

    $('div.uk-modal').on('submit', 'form#add-class', function (e) { // On add class form submit, create new class docuement in the database
        e.preventDefault();

        let name = $(this).find('input[name="name"]').val();
        let gender = $(this).find('select[name="gender"]').val();
        let minimumAge = {
            'date1': $(this).find('input[name="min-date-1"]').val(),
            'date2': $(this).find('select[name="min-date-2"]').val()
        };
        let maximumAge = {
            'date1': $(this).find('input[name="max-date-1"]').val(),
            'date2': $(this).find('select[name="max-date-2"]').val()
        };
        let price = $(this).find('input[name="price"]').val();
        let showID = window.location.pathname.replace(/\/([a-z0-9]+)\/([a-z0-9]+)\//, '');

        clasSocket.emit('add', name, gender, minimumAge, maximumAge, price, showID);
    });

    clasSocket.on('created class', function (classes) { // On class created socket event, update class list and display noitification to user
        modal.hide();
        UIkit.notify("Successfully Created Class", { status: 'success', timeout: 10000});

        $('div.classes').replaceWith(classes);
    });

    $('div.content').on('click', 'i.delete', function () { // On delete icon click, delete class document from th
         let id = $(this).data('id');
        UIkit.modal.confirm('Are you sure you want to delete the class?', function () {
            let showID = window.location.pathname.replace(/\/([a-z0-9]+)\/([a-z0-9]+)\//, '');

            clasSocket.emit('delete', id, showID);
        });
    });

    clasSocket.on('deleted class', function (classes) { // On class deleted socket event, update class list and display noitification to user
        modal.hide();
        UIkit.notify("Successfully Deleted Class", { status: 'success', timeout: 10000});

        $('div.classes').replaceWith(classes);
    });
    //---------- Class details ----------
    //-----------------------------------
});
