<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import { UserGameScore } from '../../../../_common/user/game-score/game-score.model';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';

@Options({
	components: {
		AppUserAvatar,
		AppTimeAgo,
		AppUserCardHover,
		AppUserVerifiedTick,
	},
})
export default class AppScoreList extends Vue {
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Number) startRank?: number;
	@Prop(Number) step?: number;

	readonly Environment = Environment;
	readonly formatNumber = formatNumber;
}
</script>

<template>
	<ol class="score-list list-unstyled">
		<li
			v-for="(score, i) of scores"
			:key="score.id"
			class="score-list-item clearfix anim-fade-in-up no-animate-leave"
		>
			<div class="score-list-media">
				<AppUserCardHover :user="score.user">
					<AppUserAvatar :user="score.user" />
				</AppUserCardHover>
			</div>

			<div class="score-list-content">
				<div class="score-list-rank">
					<span class="score-list-rank-sign">#</span>
					{{ formatNumber((startRank || 1) + (step ? i * step : i)) }}
				</div>
				<div class="score-list-title" :title="score.score">
					{{ score.score }}
				</div>
				<div class="score-list-user">
					<template v-if="score.user">
						<router-link :to="score.user.url">
							{{ score.user.display_name }}
							<AppUserVerifiedTick :user="score.user" />
						</router-link>
						<small class="text-muted">@{{ score.user.username }}</small>
					</template>
					<template v-if="!score.user">
						{{ score.guest }}
						<em class="text-muted small">
							(
							<AppTranslate>guest</AppTranslate>
							)
						</em>
					</template>
				</div>
				<div class="score-list-time text-muted small">
					<AppTimeAgo :date="score.logged_on" />
				</div>
			</div>
		</li>
	</ol>
</template>

<style lang="stylus" src="./list.styl" scoped></style>
