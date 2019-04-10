import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppGameThumbnailPlaceholder from '../../../../../_common/game/thumbnail/placeholder/placeholder.vue';
import { GameGridRowSizeLg, GameGridRowSizeMd, GameGridRowSizeSm } from '../grid';

@Component({
	components: {
		AppGameThumbnailPlaceholder,
	},
})
export default class AppGameGridPlaceholder extends Vue {
	@Prop(Number) num!: number;
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
