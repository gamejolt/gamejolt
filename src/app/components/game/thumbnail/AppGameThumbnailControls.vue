<script lang="ts" setup>
/**
 * Used only in app section in order to show that section's specific controls
 * for [AppGameThumbnail]
 */

import AppGamePlaylistAddToWidget from '~app/components/game-playlist/add-to-widget/AppGamePlaylistAddToWidget.vue';
import AppButton from '~common/button/AppButton.vue';
import AppGameFollowWidget from '~common/game/follow-widget/AppGameFollowWidget.vue';
import { GameModel } from '~common/game/game.model';
import AppGameModLinks from '~common/game/mod-links/AppGameModLinks.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import { useCommonStore } from '~common/store/common-store';

type Props = {
	game: GameModel;
};
const { game } = defineProps<Props>();

const { user } = useCommonStore();
</script>

<template>
	<template v-if="user">
		<AppGameFollowWidget :game="game" overlay circle location="thumbnail" />
		{{ ' ' }}
		<AppGamePlaylistAddToWidget :game="game" overlay circle />
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
