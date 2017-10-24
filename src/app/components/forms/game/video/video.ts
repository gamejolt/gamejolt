import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./video.html';

import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

type FormModel = GameVideo & {
	_url: string;
};

@View
@Component({
	components: {},
})
export class FormGameVideo extends BaseForm<FormModel> implements FormOnInit {
	@Prop(Game) game: Game;

	modelClass = GameVideo as any;
	resetOnSubmit = true;
	warnOnDiscard = false;

	GameVideo = GameVideo;

	onInit() {
		this.setField('game_id', this.game.id);

		// We use _url as the form model's URL and copy back and forth.
		if (this.formModel.url) {
			if (this.formModel.type === GameVideo.TYPE_VIMEO) {
				this.setField('_url', 'https://www.vimeo.com/' + this.formModel.url);
			} else if (this.formModel.type === GameVideo.TYPE_YOUTUBE) {
				this.setField('_url', 'https://www.youtube.com/watch?v=' + this.formModel.url);
			}
		}
	}

	@Watch('formModel._url')
	onUrlChange(url: string) {
		// Check if we need to scrub out anything from the URL.
		// Will be the case if they entered in a full URL such as http://www.youtube.com/watch?v=something, etc.
		if (url) {
			const youtubeMatch = url.match(GameVideo.REGEX.YOUTUBE);
			const vimeoMatch = url.match(GameVideo.REGEX.VIMEO);

			if (youtubeMatch) {
				this.setField('type', GameVideo.TYPE_YOUTUBE);
				this.setField('url', youtubeMatch[4]);
			} else if (vimeoMatch) {
				this.setField('type', GameVideo.TYPE_VIMEO);
				this.setField('url', vimeoMatch[4]);
			}
		}
	}
}
