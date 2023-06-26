"use strict";

﻿$(document).ready(function () { /* jshint ignore: line */
	CKEDITOR.inline('edit-page', { enterMode: CKEDITOR.ENTER_BR });

	$('button#save-page').click(function () { // On save page via ajax
		var content = CKEDITOR.instances['edit-page'].getData();
		var id = $('input[name="id"]').val();
		var modal = UIkit.modal('.uk-modal', { center: true });
		let subNavIndex = $('input[name="sub-nav-index"]').val();
		subNavIndex = (subNavIndex ? `/${subNavIndex}` : '');

		$.ajax({
			type: "post",
			url: `/users/pages/${id}${subNavIndex}`,
			data: { content: content },
			beforeSend: function (){
				modal.find('.uk-modal-dialog').html("<div id='working-to-save'><h3>Working to save page...</h3></div>" +
														"<div class='uk-modal-spinner' style='font-size: 1.8em'></div>");
				modal.show();
			},
			success: function (msg){
				if (msg == 'true') {
					modal.hide();
					UIkit.notify("Successfully Saved Page", { status: 'success', timeout: 10000});
				}
			},
			error: function (xhr){
				var msg = xhr.responseText;
				modal.find('.uk-modal-dialog').html(msg).resize();
				setTimeout(function () {
					modal.hide();
				}, 20000);
			}
		});
	});
});
