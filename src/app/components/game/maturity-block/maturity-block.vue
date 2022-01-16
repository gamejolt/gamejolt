<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Game } from '../../../../_common/game/game.model';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { SettingRestrictedBrowsing } from '../../../../_common/settings/settings.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppGameOgrs from '../ogrs/ogrs.vue';

@Options({
	components: {
		AppGameOgrs,
	},
})
export default class AppGameMaturityBlock extends Vue {
	@Prop(Object) game!: Game;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	private hasBypassed = false;

	get shouldBlock() {
		return (
			this.game &&
			this.game.tigrs_age === 3 &&
			!import.meta.env.SSR &&
			SettingRestrictedBrowsing.get() &&
			!this.game.is_following &&
			!this.game.hasPerms() &&
			!this.hasBypassed
		);
	}

	@Watch('game', { immediate: true })
	onWatch(newGame: Game, oldGame?: Game) {
		if (!oldGame || newGame.id !== oldGame.id) {
			this.hasBypassed = false;
		}
	}

	proceed() {
		this.hasBypassed = true;
		Scroll.to(0, { animate: false });
		Analytics.trackEvent('restricted-browsing', 'unblock');
	}

	removeRestriction() {
		SettingRestrictedBrowsing.set(false);
		this.proceed();
	}
}
</script>

<template>
	<div v-if="game">
		<section v-if="shouldBlock" class="section fill-darker">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<div class="game-maturity-block">
							<h4>
								<translate>This game is tagged for mature audiences.</translate>
							</h4>
							<p>
								<translate>
									It could contain content you may not want to view.
								</translate>
							</p>
							<br />

							<app-game-ogrs :game="game" />
							<br />

							<p>
								<app-button block primary @click="proceed">
									<translate>Proceed to Game</translate>
								</app-button>
							</p>

							<br />
							<hr class="underbar underbar-center" />

							<p>
								<a class="link-muted" @click="removeRestriction">
									<translate>Don't ask me again, geez...</translate>
								</a>
							</p>

							<p class="small text-muted">
								<translate>
									This setting will apply to this browser/device only.
								</translate>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<div v-else>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.game-maturity-block
	@media $media-sm-up
		text-align: center

	&-img
		display: inline-block
		border: 6px solid $black
		margin-bottom: $line-height-computed

	h4
		theme-prop('color', 'notice')

		@media $media-xs
			margin-top: 0

	::v-deep(.game-ogrs)
		margin: 0 auto
		text-align: left
		max-width: 350px
		margin-bottom: $line-height-computed

		&.no-descriptors
			float: none !important
			width: 88px
</style>
