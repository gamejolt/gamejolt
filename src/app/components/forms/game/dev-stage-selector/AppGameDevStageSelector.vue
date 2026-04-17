<script lang="ts" setup>
import { showGameDevStageSelectorConfirmModal } from '~app/components/forms/game/dev-stage-selector/confirm-service';
import AppCard from '~common/card/AppCard.vue';
import { $setGameDevStage, GameDevelopmentStatus, GameModel } from '~common/game/game.model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	game?: GameModel;
};
const { game } = defineProps<Props>();

const emit = defineEmits<{
	select: [stage: number];
}>();

const assetPaths = import.meta.glob('./*.png', { eager: true, as: 'url' });

const stages = [
	GameDevelopmentStatus.Devlog,
	GameDevelopmentStatus.Wip,
	GameDevelopmentStatus.Finished,
];

async function select(stage: number) {
	emit('select', stage);

	if (!game) {
		return;
	}

	if (!isEnabled(stage) || stage === game.development_status) {
		return;
	}

	const result = await showGameDevStageSelectorConfirmModal(game, stage);
	if (result) {
		await $setGameDevStage(game, stage);
		showSuccessGrowl(
			$gettext(`Your game's development stage has been changed!`),
			$gettext(`Stage Changed`)
		);
	}
}

function isEnabled(stage: number) {
	if (!game) {
		return true;
	}

	if (
		(stage === GameDevelopmentStatus.Wip || stage === GameDevelopmentStatus.Finished) &&
		!game.has_active_builds
	) {
		return false;
	}
	return true;
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
								<template v-if="stage === GameDevelopmentStatus.Devlog">
									{{ $gettext(`Devlog-Only`) }}
								</template>
								<template v-else-if="stage === GameDevelopmentStatus.Wip">
									{{ $gettext(`Early Access`) }}
								</template>
								<template v-else-if="stage === GameDevelopmentStatus.Finished">
									{{ $gettext(`Complete/Stable`) }}
								</template>
							</h4>
						</div>

						<div class="card-content">
							<template v-if="stage === GameDevelopmentStatus.Devlog">
								{{
									$gettext(
										`You don't have anything playable yet, but would like to share active game development in the form of images, videos, posts and more.`
									)
								}}
							</template>
							<template v-else-if="stage === GameDevelopmentStatus.Wip">
								{{
									$gettext(
										`Your game has playable builds, but you're still actively developing it.`
									)
								}}
							</template>
							<template v-else-if="stage === GameDevelopmentStatus.Finished">
								{{
									$gettext(
										`Your game is complete. It's in a stable state and you only plan on making bug fixes, performance optimizations, or small improvements.`
									)
								}}
							</template>
						</div>

						<template v-if="!isEnabled(stage)">
							<br />
							<div class="alert sans-margin">
								<AppJolticon icon="notice" />
								{{
									$gettext(
										`You must have active published packages to transition to this stage.`
									)
								}}
							</div>
						</template>
					</div>

					<div class="dev-stage-selector-mascot">
						<img
							v-if="stage === GameDevelopmentStatus.Devlog"
							:src="assetPaths['./mascot-devlog.png']"
							width="68"
							height="68"
							alt=""
						/>
						<img
							v-else-if="stage === GameDevelopmentStatus.Wip"
							:src="assetPaths['./mascot-early-access.png']"
							width="48"
							height="46"
							alt=""
						/>
						<img
							v-else-if="stage === GameDevelopmentStatus.Finished"
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
