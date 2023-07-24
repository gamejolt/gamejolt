<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppCard from '../../../../../_common/card/AppCard.vue';
import { Game, GameDevelopmentStatus } from '../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { GameDevStageSelectorConfirmModal } from './confirm-service';

const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		default: undefined,
	},
});

const emit = defineEmits({
	select: (_stage: number) => true,
});

const { game } = toRefs(props);

const assetPaths = import.meta.glob('./*.png', { eager: true, as: 'url' });

const stages = [
	GameDevelopmentStatus.Devlog,
	GameDevelopmentStatus.Wip,
	GameDevelopmentStatus.Finished,
];

async function select(stage: number) {
	emit('select', stage);

	if (!game?.value) {
		return;
	}

	if (!isEnabled(stage) || stage === game.value.development_status) {
		return;
	}

	const result = await GameDevStageSelectorConfirmModal.show(game.value, stage);
	if (result) {
		await game.value.$setDevStage(stage);
		showSuccessGrowl(
			$gettext(`Your game's development stage has been changed!`),
			$gettext(`Stage Changed`)
		);
	}
}

function isEnabled(stage: number) {
	if (!game?.value) {
		return true;
	}

	if (
		(stage === GameDevelopmentStatus.Wip || stage === GameDevelopmentStatus.Finished) &&
		!game.value.has_active_builds
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
