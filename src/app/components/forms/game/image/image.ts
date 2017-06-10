import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./image.html';

import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { BaseForm, FormOnInit } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppFormLoader,
		AppFormControlUpload,
	},
})
export class FormGameImage extends BaseForm<GameScreenshot> implements FormOnInit
{
	@Prop( Game ) game: Game;

	modelClass = GameScreenshot;
	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	onInit()
	{
		this.formModel.game_id = this.game.id;

		// // Only on adding can they send in the file.
		// if ( this.method === 'add' ) {
		// 	if ( !scope.isLoaded ) {
		// 		Api.sendRequest( '/web/dash/developer/games/media/save/image/' + scope.formModel.game_id )
		// 			.then( function( payload )
		// 			{
		// 				scope.isLoaded = true;
		// 				angular.extend( scope, payload );
		// 			} );
		// 	}
		// }
		// else {
		// 	this.isLoaded = true;
		// }
	}

	onLoaded( payload: any )
	{
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}
}
