<script lang="ts" setup>
import AppGamePlaylistAddToPopover from '~app/components/game-playlist/add-to-popover/AppGamePlaylistAddToPopover.vue';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import { GameModel } from '~common/game/game.model';
import AppPopper from '~common/popper/AppPopper.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

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
