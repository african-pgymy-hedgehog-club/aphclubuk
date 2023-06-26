'use strict';

let hostname = window.location.hostname;
const port = (hostname === 'localhost' ? 3000 : 8090);
import $ from 'jquery';
import io from 'socket.io-client';
const socket = io(`wss://${hostname}/users/pages`);

socket.on('reload', function () {
	location.reload();
});

socket.on('nav', function(html) {
	$('div#nav').replaceWith("<div id='nav'>" + html + "</div>");
});

$(document).ready(function () {
	$('ul.pages tbody').sortable({ // Make pages unordered list sortable
		items: 	'tr:not(.sub-nav)',
		cancel: '.sub-nav',
		revert: true,
		stop: function (evt, ui){
			let pages = [];
			$('ul.pages li.page a').each(function () { // For each list item page anchor update add data items id and revision to an array
				let id = $(this).data('id');
				let rev = $(this).data('rev');
				pages.push({ id: id, rev: rev });
			});

			socket.emit('sort', pages); // Update pages order

			$('tr.sub-nav').each((i, target) => { // Move sub nav table row to after moved table row (incase moved)
				let navID = $(target).data('nav');
				let html = $(target)[0].outerHTML;
				$(target).remove();

				$(`tr[data-id="${navID}"]`).after(html);
			});
		}
	});

	$('div.content').on('change', 'tr.sub-nav input.onoffswitch-checkbox', (e) => { // On sub nav on of swtich change active or de-active sub nav link
		e.stopImmediatePropagation();

		let {target} = e;
		let checked = $(target).is(':checked');
		let name = $(target).attr('name');

		socket.emit('active sub nav', checked, name);
	});

	$('div.content').on('change', 'input.onoffswitch-checkbox', function () { // On, on off switch change active or de-active page nav link
		let checked = $(this).is(':checked');
		let name = $(this).attr('name');

		socket.emit('active', checked, name);
	});

	$('button#add-page').click(function () { // On button add page click display modal with add page form
		socket.emit('get all pages');
	});

	socket.on('form all pages', function (pages) { // On form all pages event, display add button form in a modal box
		let modal = UIkit.modal('.uk-modal', { center: true });
		modal.find('.uk-modal-dialog').html(JST['views/client/add-page-form']({pages: pages}));
		modal.show();
	});

	$('div.uk-modal-dialog').on('submit', 'form#add-page', function (e) { // On add page form submit save new page doument
		e.preventDefault();

		let name = $(this).find('input[name="name"]').val();
		let active = $(this).find('input[name="active"]').is(':checked');
		let order = $('ul.pages li.page a').length - 1;
		let parent = $(this).find('select[name="parent"]').val();
		parent = (parent == 'null' ? null : parent);

		socket.emit('add', name, active, order, parent);
	});

	$('div.content').on('click', 'tr.sub-nav i.delete-page', (e) => { // On delete sub nav icon, delete page document
		e.stopImmediatePropagation();

		let {target} = e;
		let id = $(target).data('id');

		UIkit.modal.confirm('Are you sure you want to delete the page?', function () {
            socket.emit('delete sub nav', id);
    	});
	});

	$('div.content').on('click', 'i.delete-page', function () { // On delete page icon, delete page document
		let id = $(this).data('id');
		UIkit.modal.confirm('Are you sure you want to delete the page?', function () {
            socket.emit('delete', id);
    	});
	});

	$('i.dropdown').click(function () { // On dropdown icon click display drop down nav menu pages
		let trID = $(this).closest('tr').data('id');
		let tr = $(`tr[data-nav="${trID}"]`);

		if(!tr.is(':visible')) {
			tr.show();
		}
		else{
			tr.hide();
		}
	});
});
