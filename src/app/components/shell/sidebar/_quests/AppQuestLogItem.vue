<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppConfetti from '../../../../../_common/particle-effects/AppConfetti.vue';
import AppQuestProgress from '../../../../../_common/quest/AppQuestProgress.vue';
import AppQuestThumbnail from '../../../../../_common/quest/AppQuestThumbnail.vue';
import { QuestModel } from '../../../../../_common/quest/quest-model';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import {
	styleBorderRadiusLg,
	styleChangeBgRgba,
	styleFlexCenter,
} from '../../../../../_styles/mixins';
import { kFontSizeBase, kFontSizeLarge, kFontSizeSmall } from '../../../../../_styles/variables';
import { useAppStore } from '../../../../store/index';
import { useQuestStore } from '../../../../store/quest';
import AppQuestTimer from '../../../quest/AppQuestTimer.vue';

const props = defineProps({
	quest: {
		type: Object as PropType<QuestModel>,
		required: true,
	},
	active: {
		type: Boolean,
	},
	/**
	 * Hides the quest type and displays the avatar above the title and progress
	 * bar.
	 */
	compactStack: {
		type: Boolean,
	},
	confetti: {
		type: Boolean,
		default: false,
	},
});

const { quest, active, compactStack, confetti } = toRefs(props);

const { visibleLeftPane, toggleLeftPane } = useAppStore();
const { activeQuest } = useQuestStore();

const showProgress = computed(() => !quest.value.isExpired);

const asExpired = computed(() => quest.value.isExpired && !quest.value.has_activity);

function onSelect() {
	if (visibleLeftPane.value !== 'quests') {
		toggleLeftPane('quests');
	}
	activeQuest.value = quest.value;
}
</script>

<template>
	<a
		class="_item"
		:class="{
			_active: active,
			'_compact-stack': compactStack,
			_expired: asExpired,
		}"
		@click="onSelect"
	>
		<AppConfetti v-if="confetti" />
		<div class="_container" :class="{ '_compact-stack': compactStack }">
			<div class="_thumb">
				<AppQuestThumbnail :quest="quest" />

				<div
					v-if="quest.ends_on && !quest.isDaily && !compactStack"
					:style="{
						...styleFlexCenter(),
						marginTop: `6px`,
					}"
				>
					<AppQuestTimer
						class="fill-offset"
						:style="{
							...styleBorderRadiusLg,
							...styleChangeBgRgba('var(--theme-fg-rgb)', 0.05),
							padding: `1px 6px`,
						}"
						:ends-on="quest.ends_on"
						:now-text="$gettext('Expired')"
					>
						<template #ended>
							{{ $gettext(`Expired`) }}
						</template>
					</AppQuestTimer>
				</div>
			</div>

			<AppSpacer :horizontal="!compactStack" :vertical="compactStack" :scale="4" />

			<div class="_details">
				<div class="_title">
					{{ quest.title }}
				</div>

				<template v-if="showProgress">
					<AppSpacer vertical :scale="3" />

					<AppQuestProgress
						class="_progress"
						:progress="quest.progress_percent"
						:max-progress-ticks="100"
						:is-percent="true"
					/>
				</template>
			</div>
		</div>
	</a>
</template>

<style lang="stylus" scoped>
._item
	position: relative
	border-radius: $border-radius-large
	padding: 8px
	margin-left: -8px
	margin-right: -8px

	&:hover
		background-color: unquote('rgba(var(--theme-bg-rgb), 0.5)')

	&._expired
		._title
			color: var(--theme-fg-muted)

	&._active
		background-color: var(--theme-bg)

		._title
			color: var(--theme-fg)

	&._compact-stack
		margin-left: unset
		margin-right: unset

._container
	display: flex

	&._compact-stack
		flex-direction: column
		align-items: center

		._progress
			padding: 0 8px

		._thumb
			width: 100%

		._title
			font-size: v-bind('kFontSizeSmall.px')
			text-align: center
			height: 100%
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center

._thumb
	width: 30%
	max-width: 56px

._details
	flex: auto
	display: flex
	flex-direction: column
	justify-content: center
	width: 100%

._title
	font-family: 'Lato'
	font-size: v-bind('kFontSizeLarge.px')
	font-weight: bold
	color: var(--theme-fg)
	transition: color 300ms $weak-ease-out

	@media $media-xs
		font-size: v-bind('kFontSizeBase.px')
</style>
