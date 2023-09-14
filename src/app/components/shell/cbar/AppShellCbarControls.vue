<script lang="ts" setup>
import { computed } from 'vue';
import { trackCbarControlClick } from '../../../../_common/analytics/analytics.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { TogglableLeftPane, useAppStore } from '../../../store/index';
import { useQuestStore } from '../../../store/quest';
import { useGridStore } from '../../grid/grid-store';
import AppShellCbarItem from './AppShellCbarItem.vue';

const { activeCommunity, visibleLeftPane, toggleLeftPane } = useAppStore();
const { user, showInitialPackWatermark } = useCommonStore();
const { theme } = useThemeStore();
const { chat } = useGridStore();
const { questActivityIds } = useQuestStore();

const highlight = computed(() => {
	const _theme = activeCommunity.value?.theme ?? theme.value ?? DefaultTheme;
	if (_theme) {
		return '#' + _theme.darkHighlight_;
	}

	return undefined;
});

function trackAndTogglePane(pane: TogglableLeftPane) {
	const currentPane = visibleLeftPane.value;
	let method: 'show' | 'hide' | 'switch';
	if (currentPane === pane) {
		method = 'hide';
	} else if (!currentPane) {
		method = 'show';
	} else {
		method = 'switch';
	}

	trackCbarControlClick(pane, { method, from: currentPane });
	toggleLeftPane(pane);
}
</script>

<template>
	<div>
		<!-- Mobile -->
		<AppShellCbarItem
			v-if="Screen.isXs"
			class="-control"
			:highlight="highlight"
			:is-active="visibleLeftPane === 'mobile'"
			is-control
		>
			<a class="-control-item" @click="trackAndTogglePane('mobile')">
				<AppJolticon class="-control-icon" icon="gamejolt" />
			</a>
		</AppShellCbarItem>

		<template v-if="user">
			<!-- Chat -->
			<AppShellCbarItem
				class="-control"
				:highlight="highlight"
				:notification-count="chat?.roomNotificationsCount || 0"
				:is-active="visibleLeftPane === 'chat'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Chat and friends`)"
					class="-control-item"
					@click="trackAndTogglePane('chat')"
				>
					<AppJolticon class="-control-icon" icon="user-messages" />
				</a>
			</AppShellCbarItem>

			<!-- Backpack -->
			<AppShellCbarItem
				class="-control"
				:highlight="highlight"
				:is-active="visibleLeftPane === 'backpack'"
				:show-blip="showInitialPackWatermark"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Backpack`)"
					class="-control-item"
					@click="trackAndTogglePane('backpack')"
				>
					<AppJolticon class="-control-icon" icon="backpack" />
				</a>
			</AppShellCbarItem>

			<!-- Quests -->
			<AppShellCbarItem
				class="-control"
				:highlight="highlight"
				:is-active="visibleLeftPane === 'quests'"
				:show-blip="questActivityIds.size > 0"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Quests`)"
					class="-control-item"
					@click="trackAndTogglePane('quests')"
				>
					<AppJolticon class="-control-icon" icon="quest-log" />
				</a>
			</AppShellCbarItem>

			<!-- Atlas -->
			<AppShellCbarItem
				class="-control"
				:highlight="highlight"
				:is-active="visibleLeftPane === 'joltydex'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Joltydex`)"
					class="-control-item"
					@click="trackAndTogglePane('joltydex')"
				>
					<AppJolticon class="-control-icon" icon="joltydex" />
				</a>
			</AppShellCbarItem>

			<!-- Library -->
			<AppShellCbarItem
				class="-control"
				:highlight="highlight"
				:is-active="visibleLeftPane === 'library'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Game library`)"
					class="-control-item"
					@click="trackAndTogglePane('library')"
				>
					<AppJolticon class="-control-icon" icon="books" />
				</a>
			</AppShellCbarItem>
		</template>

		<hr v-if="Screen.isXs || user" class="-hr" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.-control
	pressy()
	img-circle()
	background-color: var(--theme-bg-offset)
	position: relative
	z-index: 1

	::v-deep(.jolticon)
		color: var(--theme-lighter)

.-control-item
	display: flex
	justify-content: center
	align-items: center
	width: var(--cbar-item-size)
	height: var(--cbar-item-size)

.-control-icon
	font-size: $jolticon-size * 1.5
</style>
