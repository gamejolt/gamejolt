<script lang="ts" setup>
import { computed } from 'vue';

import { formatNumber } from '~common/filters/number';
import { GameModel } from '~common/game/game.model';
import AppGameThumbnailImg from '~common/game/thumbnail/AppGameThumbnailImg.vue';
import AppUserVerifiedTick from '~common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';

type Props = {
	game: GameModel;
};
const { game } = defineProps<Props>();

const url = computed(() => game.getUrl());
</script>

<template>
	<div class="game-list-item">
		<RouterLink class="-thumb" :to="url">
			<AppGameThumbnailImg :game="game" />
		</RouterLink>

		<div class="-meta">
			<RouterLink class="-title -spacing link-unstyled" :to="url" :title="game.title">
				{{ game.title }}
			</RouterLink>

			<AppUserCardHover class="-dev -spacing" :user="game.developer">
				<RouterLink
					class="link-muted"
					:to="{
						name: 'profile.overview',
						params: { username: game.developer.username },
					}"
					:title="`${game.developer.display_name} (@${game.developer.username})`"
				>
					{{ $gettext(`by`) }}
					{{ ' ' }}
					<strong>
						{{ game.developer.display_name }}
					</strong>
					<AppUserVerifiedTick :user="game.developer" />
				</RouterLink>
			</AppUserCardHover>

			<div class="-followers -spacing text-muted">
				{{
					$ngettext(
						`%{ count } follower`,
						`%{ count } followers`,
						game.follower_count || 0,
						{
							count: formatNumber(game.follower_count || 0),
						}
					)
				}}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="~app/components/game/list/list-common.styl" scoped></style>
