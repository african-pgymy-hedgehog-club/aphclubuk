'use strict';

const hostname = window.location.hostname;
const port = (hostname === 'localhost' ? 3000 : 8090);
import $ from 'jquery';
import io from 'socket.io-client';
const socket = io('wss://' + hostname + '/users/shows');

socket.on('reload', function () {
    location.reload();
});

$(document).ready(function () {
    let modal = UIkit.modal('.uk-modal', { center: true });

    socket.on('err', function (err) {
        modal.find('div.uk-modal-dialog').text(err);
        modal.show();
        setTimeout(function () {
            modal.hide();
        }, 15000);
    });

    $('button#add-show').click(function () { // On add show button
        modal.find('div.uk-modal-dialog').html(JST["views/client/add-show-form"]());
        modal.show();
    });

    $('div.uk-modal-dialog').on('submit', 'form#add-show', function (e) { // On add show form submit
        e.preventDefault();

        let name = $(this).find('input[name="name"]').val();
        let location = $(this).find('textarea[name="location"]').val();
        let date = $(this).find('input[name="date"]').val();
        let time = $(this).find('input[name="time"]').val();

        socket.emit('add', name, location, date, time);
    });

    socket.on('created show', function (shows) {
        modal.hide();
        UIkit.notify("Successfully Saved Show", { status: 'success', timeout: 10000});

        $('ul.shows').replaceWith(shows);
    });

    $("div.content").on('click', 'ul.shows i.delete', function () { // On show delete icon click, delete show
        let id = $(this).data('id');
        UIkit.modal.confirm('Are you sure you want to delete the show?', function () {
            socket.emit('delete', id);
        });
    });

    socket.on('deleted show', function (shows) {
        modal.hide();
        UIkit.notify("Successfully Deleted Show", { status: 'success', timeout: 10000});

        $('ul.shows').replaceWith(shows);
    });

    $('input.onoffswitch-checkbox').change(function () { // On, on off switch change show active and de-active all other shows
		let checked = $(this).is(':checked');
		let id = $(this).attr('name');

		socket.emit('active', checked, id);
	});

    socket.on('set active', function (activeID) {
        $('input.onoffswitch-checkbox').each(function () {
            let id = $(this).attr('name');
            if(id !== activeID){
                $(this).attr('checked', false);

                let containerDiv = $(this).closest('div.onoffswitch');
                containerDiv.find('.onoffswitch-inner').css('margin-left', '-100%');
                containerDiv.find('.onoffswitch-switch').css('right', '56px');
            }
        });
    });
});
