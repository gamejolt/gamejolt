import { Component } from 'vue-property-decorator';
import View from '!view!./playlist.html';

import { BaseForm } from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';
import { AppFocusWhen } from '../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';

@View
@Component({
	directives: {
		AppFocusWhen,
	},
})
export class FormPlaylist extends BaseForm<GamePlaylist> {
	modelClass = GamePlaylist;
}
