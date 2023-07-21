<script lang="ts" setup>
import { CSSProperties, PropType, computed, onMounted, ref, toRefs } from 'vue';
import { kFontSizeTiny } from '../../../../_styles/variables';
import { sleep } from '../../../../utils/utils';
import AppCircularProgress from '../../../progress/AppCircularProgress.vue';
import { $gettext, $gettextInterpolate } from '../../../translate/translate.service';
import AppShellNoticeBase from '../_base/AppShellNoticeBase.vue';
import { CreatorExperienceNotice, getShellNotice } from '../notice.service';

const props = defineProps({
	noticeId: {
		type: Number,
		required: true,
	},
	data: {
		type: Object as PropType<CreatorExperienceNotice>,
		required: true,
	},
});

const { noticeId, data } = toRefs(props);

interface PercentContent {
	percent: number;
	text: string | number;
	styles?: CSSProperties;
}

const noticeAnimDurationMs = 500;

const percentTransitionMs = ref<number>(500);
const percentData = ref<PercentContent>({ percent: 0, text: 0 });

const creatorLevelUpData = computed(() => {
	const currentExperience = data.value.experience.current_level_xp;
	const previousExperience = Math.max(0, currentExperience - data.value.xpGained);

	const currentLevel = data.value.experience.current_level;
	let previousLevel = currentLevel;
	if (data.value.leveledUp) {
		previousLevel -= 1;
	}

	const previousPercent = data.value.leveledUp
		? 0
		: previousExperience / data.value.experience.current_level_xp_required;

	const currentPercent = data.value.experience.is_max_level
		? 1
		: currentExperience / data.value.experience.current_level_xp_required;

	return {
		currentExperience,
		currentPercent,
		currentLevel,
		previousExperience,
		previousPercent,
		previousLevel,
	};
});

// Initialize values. Done outside of [onMounted] so we don't animate the
// initial values.
const { previousLevel, previousPercent } = creatorLevelUpData.value;
percentData.value = { percent: previousPercent, text: previousLevel };

const message = computed(() => {
	const {
		leveledUp,
		experience: { current_level },
		xpGained,
	} = data.value;

	if (leveledUp) {
		return $gettextInterpolate(`Level up! You are now level %{ level }.`, {
			level: current_level,
		});
	}
	return $gettextInterpolate(`You gained %{ xpGained } experience.`, {
		xpGained,
	});
});

const subtext = computed(() => {
	const messages: string[] = [];

	if (data.value.experience.is_max_level) {
		messages.push(
			$gettext(`You've reached the max level... for now.`),
			$gettext(`Check your dashboard later for more rewards!`)
		);
	} else if (data.value.experience.ability_on_level_up_display) {
		messages.push(
			$gettext(`Next reward`) + `: ${data.value.experience.ability_on_level_up_display}`
		);
	}

	return messages;
});

onMounted(async () => {
	// Wait for the enter animation to finish before starting the animation
	// flow.
	await sleep(noticeAnimDurationMs);
	afterIntroTransition();
});

async function afterIntroTransition() {
	const { currentLevel, currentPercent } = creatorLevelUpData.value;
	const { experience, leveledUp, xpGained } = data.value;
	const percent = leveledUp ? 1 : currentPercent;

	if (leveledUp) {
		percentData.value.percent = percent;
	} else {
		percentData.value = {
			percent,
			text: `+${xpGained}xp`,
			styles: {
				fontSize: kFontSizeTiny.px,
				textAlign: `center`,
			},
		};
	}

	await sleep(percentTransitionMs.value + 1_000);
	percentData.value = {
		percent,
		text: currentLevel,
	};

	// Only do this if we're not at the max level. Percent should already be set
	// up properly when hitting max level.
	if (leveledUp && !experience.is_max_level) {
		// Force the circular progress to 0%, wait a moment, then animate back
		// to our current experience level.
		percentTransitionMs.value = 0;
		percentData.value.percent = 0;
		await sleep(50);
		percentTransitionMs.value = 500;
		percentData.value.percent = currentPercent;
	}

	await sleep(3_000);
	closeNotice();
}

function closeNotice() {
	getShellNotice().remove(noticeId.value);
}
</script>

<template>
	<AppShellNoticeBase
		:notice-id="noticeId"
		:message="message"
		:anim-duration-ms="noticeAnimDurationMs"
	>
		<template #leading>
			<AppCircularProgress
				:transition-ms="percentTransitionMs"
				:percent="percentData.percent"
			>
				<Transition name="fade">
					<span
						:key="`${percentData.text}-${JSON.stringify(percentData.styles)}`"
						:style="percentData.styles"
					>
						{{ percentData.text }}
					</span>
				</Transition>
			</AppCircularProgress>
		</template>

		<template #subtext>
			<template v-if="subtext.length">
				<div v-for="text of subtext" :key="text">
					{{ text }}
				</div>
			</template>
		</template>
	</AppShellNoticeBase>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 400ms $strong-ease-out, transform 400ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0
	position: absolute

.fade-enter-from
	transform: translateY(20px)

.fade-leave-to
	transform: translateY(-20px)
</style>
