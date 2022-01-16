<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatDate } from '../../../../../../../_common/filters/date';
import { Game } from '../../../../../../../_common/game/game.model';
import { AppLazyPlaceholder } from '../../../../../../../_common/lazy/placeholder/placeholder';
import { LinkedAccount } from '../../../../../../../_common/linked-account/linked-account.model';
import { useGameRouteController } from '../../view.vue';

@Options({
	components: {
		AppLazyPlaceholder,
	},
})
export default class AppDiscoverGamesViewOverviewDetails extends Vue {
	routeStore = setup(() => useGameRouteController()!);

	readonly formatDate = formatDate;

	get game() {
		return this.routeStore.game!;
	}

	get linkedAccounts() {
		return this.routeStore.linkedAccounts;
	}

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
		return undefined;
	}

	get twitterAccount() {
		if (this.linkedAccounts) {
			return this.linkedAccounts.find(i => i.provider === LinkedAccount.PROVIDER_TWITTER);
		}
		return undefined;
	}

	get tumblrAccount() {
		if (this.linkedAccounts) {
			return this.linkedAccounts.find(
				i => i.provider === LinkedAccount.PROVIDER_TUMBLR && !!i.tumblrSelectedBlog
			);
		}
		return undefined;
	}
}
</script>

<template>
	<div>
		<div class="-metadata">
			<div class="-metadata-label">
				<translate>Development Stage</translate>
			</div>
			<app-lazy-placeholder tag="span" :when="game.development_status">
				<span class="lazy-placeholder" style="width: 80px" />

				<span class="-metadata-value">
					<translate v-if="game._is_devlog">Devlog</translate>
					<translate v-if="game._is_wip">Early Access</translate>
					<translate v-if="game._is_finished">Complete</translate>
					<translate v-if="game.canceled" class="tag tag-notice">Canceled</translate>
				</span>
			</app-lazy-placeholder>
		</div>

		<div class="-metadata">
			<div class="-metadata-label">
				<translate>Engine/Language</translate>
			</div>
			<app-lazy-placeholder tag="span" :when="creationTool">
				<span class="lazy-placeholder" style="width: 100px" />
				<span class="-metadata-value">
					{{ creationTool }}
				</span>
			</app-lazy-placeholder>
		</div>

		<div v-if="game.published_on" class="-metadata">
			<div class="-metadata-label">
				<translate>Published On</translate>
			</div>
			<app-lazy-placeholder tag="span" :when="game.published_on">
				<span class="lazy-placeholder" style="width: 120px" />
				<router-link
					class="-metadata-value"
					:to="{
						name: 'discover.games.list._fetch-date',
						params: {
							section: 'by-date',
							date: formatDate(game.published_on, 'yyyy-LL-dd'),
						},
					}"
				>
					{{ formatDate(game.published_on, 'longDate') }}
				</router-link>
			</app-lazy-placeholder>
		</div>

		<br />

		<ul v-if="hasLinksSection" class="list-unstyled">
			<li v-if="game.web_site">
				<app-jolticon icon="world" />
				{{ ' ' }}
				<app-link-external :href="game.web_site">
					<translate>Game Website</translate>
				</app-link-external>
			</li>
			<li v-if="facebookAccount?.facebookSelectedPage">
				<app-jolticon icon="facebook" />
				<app-link-external :href="facebookAccount.facebookPageUrl">
					{{ facebookAccount.facebookSelectedPage.name }}
				</app-link-external>
			</li>
			<li v-if="twitterAccount">
				<app-jolticon icon="twitter-bird" />
				<app-link-external :href="twitterAccount.platformLink">
					@{{ twitterAccount.name }}
				</app-link-external>
			</li>
			<li v-if="tumblrAccount?.tumblrSelectedBlog">
				<app-jolticon icon="tumblr" />
				<app-link-external :href="tumblrAccount.tumblrSelectedBlog.url">
					{{ tumblrAccount.tumblrSelectedBlog.title }}
				</app-link-external>
			</li>
		</ul>
	</div>
</template>

<style lang="stylus" scoped>
.-metadata
	display: flex
	flex-direction: row
	align-items: flex-start

.-metadata-label
	flex: none
	width: 150px
	margin-right: 10px

.-metadata-value
	font-weight: bold
</style>
