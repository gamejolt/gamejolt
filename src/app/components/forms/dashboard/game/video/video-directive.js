angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameVideo', function( Form, Game_Video )
{
	var form = new Form( {
		model: 'Game_Video',
		template: '/app/components/forms/dashboard/game/video/video.html'
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		// Set the game ID on the video form model from the game passed in.
		scope.formModel.game_id = scope.game.id;

		// We use _url as the form model's URL and copy back and forth.
		if ( scope.formModel.url ) {
			if ( scope.formModel.type == Game_Video.TYPE_VIMEO ) {
				scope.formModel._url = 'https://www.vimeo.com/' + scope.formModel.url;
			}
			else if ( scope.formModel.type == Game_Video.TYPE_YOUTUBE ) {
				scope.formModel._url = 'https://www.youtube.com/watch?v=' + scope.formModel.url;
			}
		}

		scope.$watch( 'formModel._url', function( url )
		{
			// Check if we need to scrub out anything from the URL.
			// Will be the case if they entered in a full URL such as http://www.youtube.com/watch?v=something, etc.
			if ( url ) {

				var youtubeMatch = url.match( Game_Video.REGEX.YOUTUBE );
				var vimeoMatch = url.match( Game_Video.REGEX.VIMEO );

				if ( youtubeMatch ) {
					scope.formModel.type = Game_Video.TYPE_YOUTUBE;
					scope.formModel.url = youtubeMatch[4];
				}
				else if ( vimeoMatch ) {
					scope.formModel.type = Game_Video.TYPE_VIMEO;
					scope.formModel.url = vimeoMatch[4];
				}
			}
		} );
	};

	return form;
} );
