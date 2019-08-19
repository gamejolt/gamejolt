import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Screen } from '../screen/screen-service';
import { AppTooltip } from '../tooltip/tooltip';
import { Minbar, MinbarItem } from './minbar.service';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppMinbar extends Vue {
	readonly Minbar = Minbar;
	readonly Screen = Screen;

	onItemClick(item: MinbarItem) {
		if (item.onClick) {
			item.onClick();
		}
	}
}
