<script lang="ts" setup>
import { computed } from 'vue';

import { useGameRouteController } from '~app/views/discover/games/view/RouteDiscoverGamesView.vue';
import { formatDate } from '~common/filters/date';
import { GameCreationToolOther } from '~common/game/game.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLazyPlaceholder from '~common/lazy/placeholder/AppLazyPlaceholder.vue';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

const routeStore = useGameRouteController()!;

const game = computed(() => routeStore.game.value!);
const creationTool = computed(() => {
	if (
		game.value.creation_tool_human === GameCreationToolOther &&
		game.value.creation_tool_other
	) {
		return game.value.creation_tool_other;
	}
	return game.value.creation_tool_human;
});

const hasLinksSection = computed(() => game.value.web_site);
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
