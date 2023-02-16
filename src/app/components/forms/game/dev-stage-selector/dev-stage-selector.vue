<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../../_common/card/AppCard.vue';
import { Game } from '../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { GameDevStageSelectorConfirmModal } from './confirm-service';

@Options({
	components: {
		AppCard,
	},
})
export default class AppGameDevStageSelector extends Vue {
	@Prop(Object) game?: Game;

	stages = [
		Game.DEVELOPMENT_STATUS_DEVLOG,
		Game.DEVELOPMENT_STATUS_WIP,
		Game.DEVELOPMENT_STATUS_FINISHED,
	];

	readonly Game = Game;
	readonly assetPaths = import.meta.glob('./*.png', { eager: true, as: 'url' });

	@Emit('select')
	emitSelect(_stage: number) {}

	async select(stage: number) {
		this.emitSelect(stage);

		if (!this.game) {
			return;
		}

		if (!this.isEnabled(stage) || stage === this.game.development_status) {
			return;
		}

		const result = await GameDevStageSelectorConfirmModal.show(this.game, stage);
		if (result) {
			await this.game.$setDevStage(stage);
			showSuccessGrowl(
				this.$gettext(`Your game's development stage has been changed!`),
				this.$gettext('Stage Changed')
			);
		}
	}

	isEnabled(stage: number) {
		if (!this.game) {
			return true;
		}

		if (
			(stage === Game.DEVELOPMENT_STATUS_WIP || stage === Game.DEVELOPMENT_STATUS_FINISHED) &&
			!this.game.has_active_builds
		) {
			return false;
		}
		return true;
	}
}
</script>

<template>
	<div class="dev-stage-selector">
		<div v-for="stage of stages" :key="stage">
			<a @click="select(stage)">
				<AppCard :is-disabled="!isEnabled(stage)">
					<div class="dev-stage-selector-content">
						<div class="card-title">
							<h4>
								<AppJolticon
									:icon="
										game && game.development_status === stage
											? 'radio-circle-filled'
											: 'radio-circle'
									"
								/>
								<template v-if="stage === Game.DEVELOPMENT_STATUS_DEVLOG">
									<AppTranslate>Devlog-Only</AppTranslate>
								</template>
								<template v-else-if="stage === Game.DEVELOPMENT_STATUS_WIP">
									<AppTranslate>Early Access</AppTranslate>
								</template>
								<template v-else-if="stage === Game.DEVELOPMENT_STATUS_FINISHED">
									<AppTranslate>Complete/Stable</AppTranslate>
								</template>
							</h4>
						</div>

						<div class="card-content">
							<template v-if="stage === Game.DEVELOPMENT_STATUS_DEVLOG">
								<AppTranslate>
									You don't have anything playable yet, but would like to share
									active game development in the form of images, videos, posts and
									more.
								</AppTranslate>
							</template>
							<template v-else-if="stage === Game.DEVELOPMENT_STATUS_WIP">
								<AppTranslate>
									Your game has playable builds, but you're still actively
									developing it.
								</AppTranslate>
							</template>
							<template v-else-if="stage === Game.DEVELOPMENT_STATUS_FINISHED">
								<AppTranslate>
									Your game is complete. It's in a stable state and you only plan
									on making bug fixes, performance optimizations, or small
									improvements.
								</AppTranslate>
							</template>
						</div>

						<template v-if="!isEnabled(stage)">
							<br />
							<div class="alert sans-margin">
								<AppJolticon icon="notice" />
								<AppTranslate>
									You must have active published packages to transition to this
									stage.
								</AppTranslate>
							</div>
						</template>
					</div>

					<div class="dev-stage-selector-mascot">
						<img
							v-if="stage === Game.DEVELOPMENT_STATUS_DEVLOG"
							:src="assetPaths['./mascot-devlog.png']"
							width="68"
							height="68"
							alt=""
						/>
						<img
							v-else-if="stage === Game.DEVELOPMENT_STATUS_WIP"
							:src="assetPaths['./mascot-early-access.png']"
							width="48"
							height="46"
							alt=""
						/>
						<img
							v-else-if="stage === Game.DEVELOPMENT_STATUS_FINISHED"
							:src="assetPaths['./mascot-complete.png']"
							width="52"
							height="54"
							alt=""
						/>
					</div>
				</AppCard>
			</a>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.dev-stage-selector
	.card
		position: relative

	&-content
		margin-right: 100px

	&-mascot
		position: absolute
		right: 0
		top: 0
		bottom: 0
		width: 100px
		display: flex
		align-items: center
		justify-content: center
</style>
