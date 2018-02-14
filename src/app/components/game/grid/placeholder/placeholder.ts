import View from '!view!./placeholder.html?style=./placeholder.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { AppGameThumbnailPlaceholder } from '../../../../../_common/game/thumbnail/placeholder/placeholder';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { GameGridRowSizeLg, GameGridRowSizeMd, GameGridRowSizeSm } from '../grid';

@View
@Component({
	components: {
		AppGameThumbnailPlaceholder,
	},
})
export class AppGameGridPlaceholder extends Vue {
	@Prop(Number) num: number;
	@Prop(Boolean) truncateToFit?: boolean;
	@Prop(Boolean) scrollable?: boolean;
	@Prop(Boolean) forceScrollable?: boolean;

	readonly Screen = Screen;

	get isScrollable() {
		return (Screen.isXs && this.scrollable) || this.forceScrollable;
	}

	get count() {
		if (!this.truncateToFit || this.isScrollable) {
			return this.num;
		}

		let rowSize: number;
		if (Screen.breakpoint === 'sm') {
			rowSize = GameGridRowSizeSm;
		} else if (Screen.breakpoint === 'md') {
			rowSize = GameGridRowSizeMd;
		} else if (Screen.breakpoint === 'lg') {
			rowSize = GameGridRowSizeLg;
		} else {
			rowSize = this.num;
		}

		return Math.max(1, Math.floor(this.num / rowSize)) * rowSize;
	}
}
