<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';

@Options({
	components: {
		AppGameThumbnailImg,
		AppUserCardHover,
		AppUserVerifiedTick,
	},
})
export default class AppGameListItem extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop(String)
	eventLabel?: string;

	formatNumber = formatNumber;

	get url() {
		return this.game.getUrl();
	}
}
</script>

<template>
	<div class="game-list-item">
		<router-link
			v-app-track-event="eventLabel ? 'game-list:click:' + eventLabel : undefined"
			class="-thumb"
			:to="url"
		>
			<AppGameThumbnailImg :game="game" />
		</router-link>

		<div class="-meta">
			<router-link
				v-app-track-event="eventLabel ? 'game-list:click:' + eventLabel : undefined"
				class="-title -spacing link-unstyled"
				:to="url"
				:title="game.title"
			>
				{{ game.title }}
			</router-link>

			<AppUserCardHover class="-dev -spacing" :user="game.developer">
				<router-link
					v-app-track-event="eventLabel ? 'game-list:dev:' + eventLabel : undefined"
					class="link-muted"
					:to="{
						name: 'profile.overview',
						params: { username: game.developer.username },
					}"
					:title="`${game.developer.display_name} (@${game.developer.username})`"
				>
					<AppTranslate>by</AppTranslate>
					{{ ' ' }}
					<strong>
						{{ game.developer.display_name }}
					</strong>
					<AppUserVerifiedTick :user="game.developer" />
				</router-link>
			</AppUserCardHover>

			<div class="-followers -spacing text-muted">
				<AppTranslate
					:translate-n="game.follower_count || 0"
					:translate-params="{ count: formatNumber(game.follower_count || 0) }"
					translate-plural="%{ count } followers"
				>
					%{ count } follower
				</AppTranslate>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="../list-common.styl" scoped></style>
