import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameScreenshot } from 'game-jolt-frontend-lib/components/game/screenshot/screenshot.model';
import { GameSketchfab } from 'game-jolt-frontend-lib/components/game/sketchfab/sketchfab.model';
import { GameVideo } from 'game-jolt-frontend-lib/components/game/video/video.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppNavTabList from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list.vue';
import { Component, Prop } from 'vue-property-decorator';
import FormGameImage from '../../../forms/game/image/image.vue';
import FormGameSketchfab from '../../../forms/game/sketchfab/sketchfab.vue';
import FormGameVideo from '../../../forms/game/video/video.vue';

@Component({
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
		this.modal.resolve(sketchfab);
	}
}
