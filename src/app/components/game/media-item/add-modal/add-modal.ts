import { Options, Prop } from 'vue-property-decorator';
import { Game } from '../../../../../_common/game/game.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideo } from '../../../../../_common/game/video/video.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import FormGameImage from '../../../forms/game/image/image.vue';
import FormGameSketchfab from '../../../forms/game/sketchfab/sketchfab.vue';
import FormGameVideo from '../../../forms/game/video/video.vue';

@Options({
	components: {
		AppNavTabList,
		FormGameImage,
		FormGameVideo,
		FormGameSketchfab,
	},
})
export default class AppGameMediaItemAddModal extends BaseModal {
	@Prop(Game) game!: Game;

	tab: 'image' | 'video' | 'sketchfab' = 'image';

	onImagesAdd(_model: any, response: any) {
		this.modal.resolve(GameScreenshot.populate(response.screenshots));
	}

	onVideoAdd(video: GameVideo) {
		this.modal.resolve([video]);
	}

	onSketchfabAdd(sketchfab: GameSketchfab) {
		this.modal.resolve([sketchfab]);
	}
}
