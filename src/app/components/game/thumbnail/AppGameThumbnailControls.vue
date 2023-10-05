<script lang="ts" setup>
/**
 * Used only in app section in order to show that section's specific controls
 * for [AppGameThumbnail]
 */

import { PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppGameFollowWidget from '../../../../_common/game/follow-widget/AppGameFollowWidget.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameModLinks from '../../../../_common/game/mod-links/mod-links.vue';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppGamePlaylistAddToWidget from '../../game-playlist/add-to-widget/add-to-widget.vue';

defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
});

const { user } = useCommonStore();
</script>

<template>
	<template v-if="user">
		<AppGameFollowWidget :game="game" overlay circle location="thumbnail" />
		{{ ' ' }}
		<AppGamePlaylistAddToWidget :game="game" overlay circle event-label="game-thumb" />
		{{ ' ' }}
		<template v-if="user.isMod">
			<AppPopper popover-class="fill-darkest">
				<AppButton overlay circle icon="cog" />

				<template #popover>
					<AppGameModLinks :game="game" />
				</template>
			</AppPopper>
		</template>
	</template>
</template>
