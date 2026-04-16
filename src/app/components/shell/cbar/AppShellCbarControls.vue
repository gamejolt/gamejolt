<script lang="ts" setup>
import { computed } from 'vue';

import { useGridStore } from '~app/components/grid/grid-store';
import AppShellCbarItem from '~app/components/shell/cbar/AppShellCbarItem.vue';
import { showVendingMachineModal } from '~app/components/vending-machine/modal/modal.service';
import { TogglableLeftPane, useAppStore } from '~app/store/index';
import { useQuestStore } from '~app/store/quest';
import { trackCbarControlClick } from '~common/analytics/analytics.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { Screen } from '~common/screen/screen-service';
import { useCommonStore } from '~common/store/common-store';
import { DefaultTheme } from '~common/theme/theme.model';
import { useThemeStore } from '~common/theme/theme.store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

const { activeCommunity, visibleLeftPane, toggleLeftPane } = useAppStore();
const { user, showInitialPackWatermark } = useCommonStore();
const { theme } = useThemeStore();
const { chat } = useGridStore();
const { newQuestIds, questActivityIds } = useQuestStore();

const highlight = computed(() => {
	const _theme = activeCommunity.value?.theme ?? theme.value ?? DefaultTheme;
	if (_theme) {
		return '#' + _theme.darkHighlight_;
	}

	return undefined;
});

const showQuestsBlip = computed(
	() => newQuestIds.value.size > 0 || questActivityIds.value.size > 0
);

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
				:show-blip="chat?.roomHasNotifications"
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

			<!-- Shop -->
			<AppShellCbarItem class="-control" :highlight="highlight" is-control>
				<a
					v-app-tooltip.right="$gettext(`Shop`)"
					class="-control-item"
					@click="
						showVendingMachineModal({
							location: 'cbar',
						})
					"
				>
					<AppJolticon class="-control-icon" icon="marketplace-filled" />
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
				:show-blip="showQuestsBlip"
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
