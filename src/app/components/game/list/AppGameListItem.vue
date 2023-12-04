<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import AppUserVerifiedTick from '../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	eventLabel: {
		type: String,
		default: undefined,
	},
});

const { game } = toRefs(props);

const url = computed(() => game.value.getUrl());
</script>

<template>
	<div class="game-list-item">
		<RouterLink
			v-app-track-event="eventLabel ? 'game-list:click:' + eventLabel : undefined"
			class="-thumb"
			:to="url"
		>
			<AppGameThumbnailImg :game="game" />
		</RouterLink>

		<div class="-meta">
			<RouterLink
				v-app-track-event="eventLabel ? 'game-list:click:' + eventLabel : undefined"
				class="-title -spacing link-unstyled"
				:to="url"
				:title="game.title"
			>
				{{ game.title }}
			</RouterLink>

			<AppUserCardHover class="-dev -spacing" :user="game.developer">
				<RouterLink
					v-app-track-event="eventLabel ? 'game-list:dev:' + eventLabel : undefined"
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

<style lang="stylus" src="./list-common.styl" scoped></style>
