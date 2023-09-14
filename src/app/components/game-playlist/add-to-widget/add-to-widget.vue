<script lang="ts" setup>
import { PropType } from 'vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppGamePlaylistAddToPopover from '../add-to-popover/add-to-popover.vue';

defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	eventLabel: {
		type: String,
		default: 'global',
	},
	overlay: {
		type: Boolean,
	},
	circle: {
		type: Boolean,
	},
});
</script>

<template>
	<AppPopper v-if="game.isVisible" popover-class="fill-darkest" placement="bottom">
		<template #default>
			<AppButton
				v-app-auth-required
				v-app-tooltip.bottom="$gettext('Add to Playlist')"
				v-app-track-event="`add-to-playlist:widget:${eventLabel}`"
				icon="add"
				sparse
				:overlay="overlay"
				:circle="circle"
			/>
		</template>

		<template #popover>
			<AppGamePlaylistAddToPopover :game="game" />
		</template>
	</AppPopper>
</template>
