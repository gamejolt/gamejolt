import { AppFocusWhen } from 'game-jolt-frontend-lib/components/form-vue/focus-when.directive';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { GamePlaylist } from 'game-jolt-frontend-lib/components/game-playlist/game-playlist.model';
import { Component } from 'vue-property-decorator';


@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class FormPlaylist extends BaseForm<GamePlaylist> {
	modelClass = GamePlaylist;
}
