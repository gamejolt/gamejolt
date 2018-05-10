import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./add-modal.html';

import { BaseModal } from '../../../../../lib/gj-lib-client/components/modal/base';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppNavTabList } from '../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { FormGameImage } from '../../../forms/game/image/image';
import { FormGameVideo } from '../../../forms/game/video/video';
import { FormGameSketchfab } from '../../../forms/game/sketchfab/sketchfab';
import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';

@View
@Component({
	components: {
		AppNavTabList,
		FormGameImage,
		FormGameVideo,
		FormGameSketchfab,
	},
})
export default class AppGameMediaItemAddModal extends BaseModal {
	@Prop(Game) game: Game;

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
