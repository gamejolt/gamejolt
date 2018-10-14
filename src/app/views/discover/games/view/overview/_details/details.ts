import View from '!view!./details.html?style=./details.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { LinkedAccount } from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../../../lib/gj-lib-client/vue/filters/date';
import { RouteStore, RouteStoreModule } from '../../view.store';

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
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	linkedAccounts!: RouteStore['linkedAccounts'];

	date = date;

	get hasLinksSection() {
		return (
			this.game.web_site || this.facebookAccount || this.twitterAccount || this.tumblrAccount
		);
	}

	get facebookAccount() {
		if (this.linkedAccounts) {
			return this.linkedAccounts.find(
				i => i.provider === LinkedAccount.PROVIDER_FACEBOOK && !!i.facebookSelectedPage
			);
		}
	}

	get twitterAccount() {
		if (this.linkedAccounts) {
			return this.linkedAccounts.find(i => i.provider === LinkedAccount.PROVIDER_TWITTER);
		}
	}

	get tumblrAccount() {
		if (this.linkedAccounts) {
			return this.linkedAccounts.find(
				i => i.provider === LinkedAccount.PROVIDER_TUMBLR && !!i.tumblrSelectedBlog
			);
		}
	}
}
