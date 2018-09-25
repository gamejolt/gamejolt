import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./details.html?style=./details.styl';

import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { date } from '../../../../../../../lib/gj-lib-client/vue/filters/date';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { RouteState, RouteStore } from '../../view.store';
import { LinkedAccount } from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';

@View
@Component({
	components: {
		AppLazyPlaceholder,
		AppJolticon,
	},
	filters: {
		date,
	},
})
export class AppDiscoverGamesViewOverviewDetails extends Vue {
	@RouteState
	game!: RouteStore['game'];

	date = date;

	get facebookAccount() {
		if (this.game.linkedAccounts) {
			return this.game.linkedAccounts.find(
				l => l.provider === LinkedAccount.PROVIDER_FACEBOOK
			);
		}
	}

	get twitterAccount() {
		if (this.game.linkedAccounts) {
			return this.game.linkedAccounts.find(
				l => l.provider === LinkedAccount.PROVIDER_TWITTER
			);
		}
	}

	get tumblrAccount() {
		if (this.game.linkedAccounts) {
			return this.game.linkedAccounts.find(l => l.provider === LinkedAccount.PROVIDER_TUMBLR);
		}
	}
}
