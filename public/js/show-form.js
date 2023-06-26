'use strict';

let {hostname, protocol} = window.location;
const port = (hostname === 'localhost' ? 3000 : 8090);
hostname += (hostname == 'localhost' ? `:${port}` : '');
import $ from 'jquery';
import io from 'socket.io-client';
const socket = io(`${protocol}//${hostname}/show/enter`);
import moment from 'moment';

$(document).ready(function () {
    let modal = UIkit.modal('.uk-modal', { center: true });

    socket.on('err', function (err) {
        modal.find('div.uk-modal-dialog').text(err);
        modal.show();
        setTimeout(function () {
            modal.hide();
        }, 15000);
    });

    $('select[name="class"]').change(function () { // On combobox class change, update minumu and maximum date picker dates
        let value = $(this).val();
        let option = $(this).find('option[value="' + value + '"]');
        let minimumAge = option.data('minimumage');
        let maximumAge = option.data('maximumage');
        let showDate = $('input[name="show-date"]').val();
        let gender = option.data('gender');

        if(gender !== 'both'){
            $('select[name="gender"]').val(gender);
        }

        let minDOB = moment(showDate).subtract(minimumAge.date1, minimumAge.date2).format('YYYY-MM-DD');
        let maxDOB = moment(showDate).subtract(maximumAge.date1, maximumAge.date2).format('YYYY-MM-DD');

        $('input[name="dob"]').replaceWith(`<input type="date" name="dob" min="${maxDOB}" max="${minDOB}" />`);
    });

    $('form#show-entry').submit(function (e) { // On show entry submit, save the entry
        e.preventDefault();

        let classID = $(this).find('select[name="class"]').val();
        let hog = {
            name: $(this).find('input[name="hog_name"]').val(),
            gender: $(this).find('select[name="gender"]').val(),
            dob: $(this).find('input[name="dob"]').val()
        };
        let owner = {
            name: $(this).find('input[name="owner"]').val(),
            email: $(this).find('input[name="email"]').val()
        };
        

        socket.emit('entry', classID, hog, owner);
    });

    socket.on('added entry', function (entryID, hogName, className, classPrice) { // On added entry socket event, display the paypal button in a modal box
        let options = {
            entryID: entryID,
            hogName: hogName,
            className: className,
            classPrice: classPrice,
            payPalAccnt: 'hedgehogclubuk@gmail.com'
        };

        modal.find('.uk-modal-dialog').html(JST['views/client/paypal-form'](options));
        modal.show();
    });
});
