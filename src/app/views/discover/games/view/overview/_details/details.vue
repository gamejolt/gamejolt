<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatDate } from '../../../../../../../_common/filters/date';
import { GameCreationToolOther } from '../../../../../../../_common/game/game.model';
import { AppLazyPlaceholder } from '../../../../../../../_common/lazy/placeholder/placeholder';
import { useGameRouteController } from '../../RouteDiscoverGamesView.vue';

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
			this.game.creation_tool_human === GameCreationToolOther &&
			this.game.creation_tool_other
		) {
			return this.game.creation_tool_other;
		}
		return this.game.creation_tool_human;
	}

	get hasLinksSection() {
		return this.game.web_site;
	}
}
</script>

<template>
	<div>
		<div class="-metadata">
			<div class="-metadata-label">
				<AppTranslate>Development Stage</AppTranslate>
			</div>
			<AppLazyPlaceholder tag="span" :when="game.development_status">
				<span class="lazy-placeholder" style="width: 80px" />

				<span class="-metadata-value">
					<AppTranslate v-if="game._is_devlog">Devlog</AppTranslate>
					<AppTranslate v-if="game._is_wip">Early Access</AppTranslate>
					<AppTranslate v-if="game._is_finished">Complete</AppTranslate>
					<AppTranslate v-if="game.canceled" class="tag tag-notice">
						Canceled
					</AppTranslate>
				</span>
			</AppLazyPlaceholder>
		</div>

		<div class="-metadata">
			<div class="-metadata-label">
				<AppTranslate>Engine/Language</AppTranslate>
			</div>
			<AppLazyPlaceholder tag="span" :when="creationTool">
				<span class="lazy-placeholder" style="width: 100px" />
				<span class="-metadata-value">
					{{ creationTool }}
				</span>
			</AppLazyPlaceholder>
		</div>

		<div v-if="game.published_on" class="-metadata">
			<div class="-metadata-label">
				<AppTranslate>Published On</AppTranslate>
			</div>
			<AppLazyPlaceholder tag="span" :when="game.published_on">
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
			</AppLazyPlaceholder>
		</div>

		<br />

		<ul v-if="hasLinksSection" class="list-unstyled">
			<li v-if="game.web_site">
				<AppJolticon icon="world" />
				{{ ' ' }}
				<AppLinkExternal :href="game.web_site">
					<AppTranslate>Game Website</AppTranslate>
				</AppLinkExternal>
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
