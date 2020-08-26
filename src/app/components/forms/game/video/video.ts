import { Component, Prop, Watch } from 'vue-property-decorator';
import { REGEX_VIDEO, REGEX_VIMEO, REGEX_YOUTUBE } from '../../../../../utils/regex';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameVideo } from '../../../../../_common/game/video/video.model';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

type FormModel = GameVideo & {
	_url: string;
};

@Component({
	components: {
		AppVideoEmbed,
	},
})
export default class FormGameVideo extends BaseForm<FormModel> implements FormOnInit {
	@Prop(Game) game!: Game;

	modelClass = GameVideo as any;
	resetOnSubmit = true;
	warnOnDiscard = false;

	readonly REGEX_VIDEO = REGEX_VIDEO;

	get hasValidVideoUrl() {
		return !!this.videoData;
	}

	get videoData() {
		const url = this.formModel._url;
		if (url) {
			const youtubeMatch = url.match(REGEX_YOUTUBE);
			const vimeoMatch = url.match(REGEX_VIMEO);

			if (youtubeMatch) {
				return { id: youtubeMatch[4], type: GameVideo.TYPE_YOUTUBE };
			} else if (vimeoMatch) {
				return { id: vimeoMatch[4], type: GameVideo.TYPE_VIMEO };
			}
		}
	}

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
			const videoData = this.videoData;
			if (videoData) {
				this.setField('type', videoData!.type);
				this.setField('url', videoData!.id);
			}
		}
	}
}
