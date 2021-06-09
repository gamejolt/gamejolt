import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppGameThumbnailPlaceholder from '../../../../../_common/game/thumbnail/placeholder/placeholder.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { GameGridRowSizeLg, GameGridRowSizeMd, GameGridRowSizeSm } from '../grid';

@Component({
	components: {
		AppGameThumbnailPlaceholder,
	},
})
export default class AppGameGridPlaceholder extends Vue {
	@Prop(propRequired(Number)) num!: number;
	@Prop(propOptional(Boolean, false)) truncateToFit!: boolean;
	@Prop(propOptional(Boolean, false)) scrollable!: boolean;
	@Prop(propOptional(Boolean, false)) forceScrollable!: boolean;

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
