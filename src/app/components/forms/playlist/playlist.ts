import { Options } from 'vue-property-decorator';
import { AppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';

@Options({
	directives: {
		AppFocusWhen,
	},
})
export default class FormPlaylist extends BaseForm<GamePlaylist> {
	modelClass = GamePlaylist;
}
