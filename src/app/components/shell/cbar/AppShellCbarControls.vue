<script lang="ts" setup>
import { computed } from 'vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useAppStore } from '../../../store/index';
import { useGridStore } from '../../grid/grid-store';
import AppShellCbarItem from './AppShellCbarItem.vue';

const { activeCommunity, visibleLeftPane, toggleLeftPane } = useAppStore();
const { user } = useCommonStore();
const { theme } = useThemeStore();
const { chat } = useGridStore();

const highlight = computed(() => {
	const _theme = activeCommunity.value?.theme ?? theme.value ?? DefaultTheme;
	if (_theme) {
		return '#' + _theme.darkHighlight_;
	}

	return undefined;
});
</script>

<template>
	<div class="shell-cbar-controls">
		<!-- Mobile -->
		<AppShellCbarItem
			v-if="Screen.isXs"
			class="-control"
			:highlight="highlight"
			:is-active="visibleLeftPane === 'mobile'"
			is-control
		>
			<a
				v-app-track-event="`cbar:menu:toggle`"
				class="-control-item"
				@click="toggleLeftPane('mobile')"
			>
				<AppJolticon class="-control-icon" icon="gamejolt" />
			</a>
		</AppShellCbarItem>

		<template v-if="user">
			<!-- Chat -->
			<AppShellCbarItem
				v-if="chat"
				class="-control"
				:highlight="highlight"
				:notification-count="chat.roomNotificationsCount"
				:is-active="visibleLeftPane === 'chat'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Chat and Friends List (c)`)"
					v-app-track-event="`cbar:chat:toggle`"
					class="-control-item"
					@click="toggleLeftPane('chat')"
				>
					<AppJolticon class="-control-icon" icon="user-messages" />
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
					v-app-tooltip.right="$gettext(`Game Library (m)`)"
					v-app-track-event="`cbar:library:toggle`"
					class="-control-item"
					@click="toggleLeftPane('library')"
				>
					<AppJolticon class="-control-icon" icon="books" />
				</a>
			</AppShellCbarItem>

			<!-- Backpack -->
			<!-- TODO(sticker-collections-2) Backpack illustration -->
			<AppShellCbarItem
				class="-control"
				:highlight="highlight"
				:is-active="visibleLeftPane === 'backpack'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Backpack`)"
					v-app-track-event="`cbar:backpack:toggle`"
					class="-control-item"
					@click="toggleLeftPane('backpack')"
				>
					<AppJolticon class="-control-icon" icon="other-os" />
				</a>
			</AppShellCbarItem>
		</template>

		<hr v-if="Screen.isXs || user" class="-hr" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.shell-cbar-controls
	.-control
		pressy()
		img-circle()
		background-color: var(--theme-bg-offset)
		position: relative
		z-index: 1

		::v-deep(.jolticon)
			color: var(--theme-lighter)

		&-item
			display: flex
			justify-content: center
			align-items: center
			width: var(--cbar-item-size)
			height: var(--cbar-item-size)

		&-icon
			font-size: $jolticon-size * 1.5
</style>
