import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./follow-widget.html';

import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppUserFollowWidget extends Vue {
	@Prop(User) user: User;
	@Prop(String) size?: string;
	@Prop(Boolean) outline?: boolean;

	@State app: Store['app'];

	isProcessing = false;

	async onClick() {
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.user.is_following) {
			try {
				await this.user.$follow();
			} catch (e) {
				Growls.error(this.$gettext(`Something has prevented you from following this user.`));
			}
		} else {
			try {
				await this.user.$unfollow();
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't unfollow this user.`));
			}
		}

		this.isProcessing = false;
	}
}
