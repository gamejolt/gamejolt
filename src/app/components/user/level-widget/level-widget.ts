import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./level-widget.html?style=./level-widget.styl';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppUserLevelWidget extends Vue {
	@Prop([User])
	user: User;

	get tooltip() {
		return this.$gettextInterpolate('%{ percentage }% progress to next level', {
			percentage: this.user.level_next_percentage,
		});
	}
}
