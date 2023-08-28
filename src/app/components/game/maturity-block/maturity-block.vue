<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { GameModel } from '../../../../_common/game/game.model';
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
	@Prop(Object) game!: GameModel;

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
	onWatch(newGame: GameModel, oldGame?: GameModel) {
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
								<AppTranslate
									>This game is tagged for mature audiences.</AppTranslate
								>
							</h4>
							<p>
								<AppTranslate>
									It could contain content you may not want to view.
								</AppTranslate>
							</p>
							<br />

							<AppGameOgrs :game="game" />
							<br />

							<p>
								<AppButton block primary @click="proceed">
									<AppTranslate>Proceed to Game</AppTranslate>
								</AppButton>
							</p>

							<br />
							<hr class="underbar underbar-center" />

							<p>
								<a class="link-muted" @click="removeRestriction">
									<AppTranslate>Don't ask me again, geez...</AppTranslate>
								</a>
							</p>

							<p class="small text-muted">
								<AppTranslate>
									This setting will apply to this browser/device only.
								</AppTranslate>
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
