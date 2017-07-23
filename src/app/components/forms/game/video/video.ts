import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./video.html';

import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({
	components: {},
})
export class FormGameVideo extends BaseForm<GameVideo> implements FormOnInit {
	@Prop(Game) game: Game;

	modelClass = GameVideo;
	resetOnSubmit = true;
	warnOnDiscard = false;

	GameVideo = GameVideo;

	onInit() {
		this.setField('game_id', this.game.id);
	}
}

// angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameVideo', function( Form, Game_Video )
// {
// 	var form = new Form( {
// 		model: 'Game_Video',
// 		template: require( './video.html' ),
// 		resetOnSubmit: true,
// 	} );

// 	form.scope.game = '=gjGame';

// 	form.onInit = function( scope )
// 	{
// 		// Set the game ID on the video form model from the game passed in.
// 		scope.formModel.game_id = scope.game.id;

// 		// We use _url as the form model's URL and copy back and forth.
// 		if ( scope.formModel.url ) {
// 			if ( scope.formModel.type === Game_Video.TYPE_VIMEO ) {
// 				scope.formModel._url = 'https://www.vimeo.com/' + scope.formModel.url;
// 			}
// 			else if ( scope.formModel.type === Game_Video.TYPE_YOUTUBE ) {
// 				scope.formModel._url = 'https://www.youtube.com/watch?v=' + scope.formModel.url;
// 			}
// 		}

// 		scope.$watch( 'formModel._url', function( url )
// 		{
// 			// Check if we need to scrub out anything from the URL.
// 			// Will be the case if they entered in a full URL such as http://www.youtube.com/watch?v=something, etc.
// 			if ( url ) {

// 				var youtubeMatch = url.match( Game_Video.REGEX.YOUTUBE );
// 				var vimeoMatch = url.match( Game_Video.REGEX.VIMEO );

// 				if ( youtubeMatch ) {
// 					scope.formModel.type = Game_Video.TYPE_YOUTUBE;
// 					scope.formModel.url = youtubeMatch[4];
// 				}
// 				else if ( vimeoMatch ) {
// 					scope.formModel.type = Game_Video.TYPE_VIMEO;
// 					scope.formModel.url = vimeoMatch[4];
// 				}
// 			}
// 		} );
// 	};

// 	return form;
// } );
