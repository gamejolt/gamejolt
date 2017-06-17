import { Component, Inject, Input } from 'ng-metadata/core';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import * as template from '!html-loader!./hero.html';

@Component({
	selector: 'gj-discover-home-featured-hero',
	template,
})
export class HeroComponent {
	@Input('<') item: any;

	game: any;
	webm: string;
	mp4: string;

	screen = Screen;

	constructor(@Inject('$sce') $sce: ng.ISCEService) {
		this.game = this.item.game;

		if (this.game.has_animated_thumbnail) {
			this.webm = $sce.trustAsResourceUrl(this.game.img_thumbnail_webm);
			this.mp4 = $sce.trustAsResourceUrl(this.game.img_thumbnail_mp4);
		}
	}
}
