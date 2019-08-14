import { Game } from '../../../../../../../_common/game/game.model';
import { AppLazyPlaceholder } from '../../../../../../../_common/lazy/placeholder/placeholder';
import { LinkedAccount } from '../../../../../../../_common/linked-account/linked-account.model';
import AppJolticon from '../../../../../../../_common/jolticon/jolticon.vue';
import { date } from '../../../../../../../_common/filters/date';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../view.store';

@Component({
	components: {
		AppLazyPlaceholder,
		AppJolticon,
	},
	filters: {
		date,
	},
})
export default class AppDiscoverGamesViewOverviewDetails extends Vue {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	linkedAccounts!: RouteStore['linkedAccounts'];

	date = date;

	get creationTool() {
		if (
			this.game.creation_tool_human === Game.CREATION_TOOL_OTHER &&
			this.game.creation_tool_other
		) {
			return this.game.creation_tool_other;
		}
		return this.game.creation_tool_human;
	}

	get hasLinksSection() {
		return this.game.web_site || this.facebookAccount || this.twitterAccount || this.tumblrAccount;
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
