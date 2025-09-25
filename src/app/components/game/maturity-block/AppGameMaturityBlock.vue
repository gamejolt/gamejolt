<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../_common/game/game.model';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { SettingRestrictedBrowsing } from '../../../../_common/settings/settings.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppGameOgrs from '../ogrs/AppGameOgrs.vue';

type Props = {
	game: GameModel;
};

const { game } = defineProps<Props>();

const hasBypassed = ref(false);

const shouldBlock = computed(() => {
	return (
		game &&
		game.tigrs_age === 3 &&
		!import.meta.env.SSR &&
		SettingRestrictedBrowsing.get() &&
		!game.is_following &&
		!game.hasPerms() &&
		!hasBypassed.value
	);
});

watch(
	() => game,
	(newGame, oldGame) => {
		if (!oldGame || newGame.id !== oldGame.id) {
			hasBypassed.value = false;
		}
	},
	{ immediate: true }
);

function proceed() {
	hasBypassed.value = true;
	Scroll.to(0, { animate: false });
}

function removeRestriction() {
	SettingRestrictedBrowsing.set(false);
	proceed();
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
								<AppTranslate>
									This game is tagged for mature audiences.
								</AppTranslate>
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
