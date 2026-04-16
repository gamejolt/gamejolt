<script lang="ts" setup>
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppGamePlaylistAddToPopover from '../add-to-popover/AppGamePlaylistAddToPopover.vue';

type Props = {
	game: GameModel;
	eventLabel?: string;
	overlay?: boolean;
	circle?: boolean;
};
const { game, overlay, circle } = defineProps<Props>();
</script>

<template>
	<AppPopper v-if="game.isVisible" popover-class="fill-darkest" placement="bottom">
		<template #default>
			<AppButton
				v-app-auth-required
				v-app-tooltip.bottom="$gettext('Add to Playlist')"
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
