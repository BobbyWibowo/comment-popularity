(function ( $ ) {
	"use strict";

	$(function () {

		var clicked = false;

		// Catch the upvote/downvote action.
		$( '.comments-main' ).on( 'click', 'div.comment-weight-container span > a:not([href])', _.throttle( function( e ){
			e.preventDefault();
			var value = 0,
				comment_id = $(this).data( 'commentId' ),
				containerClass = $(this).closest( 'span' ).attr( 'class' );

			var post_ids = {};

			var parent = $(this).parents( '#comments[data-post-id]' ).get(0);
			if ( parent && parent.dataset.postId ) {
				post_ids[parent.dataset.postId] = true;
			}

			var currentPost = $( '#main > article[id^="post"]' ).get(0);
			if ( currentPost ) {
				var currentPostID = currentPost.id.replace( 'post-', '' );
				if ( currentPostID !== undefined ) {
					post_ids[currentPostID] = true;
				}
			}

			if ( containerClass !== 'upvote' && $(this).hasClass( 'vote-up' ) ) {
				value = 'upvote';
			} else if( containerClass !== 'downvote' && $(this).hasClass( 'vote-down' ) ) {
				value = 'downvote';
			} else if ( containerClass === 'downvote' && $(this).hasClass( 'vote-down' ) || containerClass === 'upvote' && $(this).hasClass( 'vote-up' ) ) {
				value = 'undo';
			}

			if ( false === clicked ) {
				clicked = true;
				var post = $.post(
					comment_popularity.ajaxurl, {
						action: 'comment_vote_callback',
						vote: value,
						comment_id: comment_id,
						post_ids: Object.keys(post_ids),
						hmn_vote_nonce: comment_popularity.hmn_vote_nonce
					}
				);

				post.done( function( data ) {
					var commentWeightContainer = $( '#comment-weight-value-' + data.data.comment_id );
					if ( data.success === false ) {
						$.growl({ title: 'Error!', style: 'error', message: data.data.error_message });
					} else {
						// Update karma.
						commentWeightContainer.text( data.data.weight );

						// Clear all classes.
						commentWeightContainer.closest( '.comment-weight-container ' ).children().removeClass();

						if ( data.data.vote_type !== 'undo' ) {

							commentWeightContainer.addClass(data.data.vote_type);
							switch (data.data.vote_type) {
								case 'upvote':
									commentWeightContainer.prev().addClass(data.data.vote_type);
									break;
								case 'downvote':
									commentWeightContainer.next().addClass(data.data.vote_type);
									break;
								default:
									break;
							}


						}
						$.growl({ title: 'Success!', style: 'notice', message: data.data.success_message });
					}

					clicked = false;
				});

			}
		}, 500));

	});

}(jQuery));
