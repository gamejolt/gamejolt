import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html?style=./placeholder.styl';

import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import {
	GameGridRowSizeSm,
	GameGridRowSizeMd,
	GameGridRowSizeLg,
} from '../grid';
import { AppGameThumbnailPlaceholder } from '../../thumbnail/placeholder/placeholder';

@View
@Component({
	components: {
		AppGameThumbnailPlaceholder,
	},
})
export class AppGameGridPlaceholder extends Vue {
	@Prop([Number])
	num: number;
	@Prop([Boolean])
	truncateToFit?: boolean;
	@Prop([Boolean])
	scrollable?: boolean;

	Screen = makeObservableService(Screen);

	get count() {
		if (!this.truncateToFit) {
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
