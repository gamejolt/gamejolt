import { AppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';
import { Component } from 'vue-property-decorator';

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class FormPlaylist extends BaseForm<GamePlaylist> {
	modelClass = GamePlaylist;
}
