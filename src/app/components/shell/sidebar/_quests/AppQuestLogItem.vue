<script lang="ts" setup>
import { toRef } from 'vue';
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

type Props = {
	quest: QuestModel;
	active?: boolean;
	/**
	 * Hides the quest type and displays the avatar above the title and progress
	 * bar.
	 */
	compactStack?: boolean;
};

const { quest } = defineProps<Props>();

const { visibleLeftPane, toggleLeftPane } = useAppStore();
const { activeQuest } = useQuestStore();

const showProgress = toRef(() => !quest.isExpired);
const asExpired = toRef(() => quest.isExpired && !quest.has_activity);

function onSelect() {
	if (visibleLeftPane.value !== 'quests') {
		toggleLeftPane('quests');
	}
	activeQuest.value = quest;
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
		<div class="_thumb">
			<AppQuestThumbnail :quest />

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
					is-percent
				/>
			</template>
		</div>
	</a>
</template>

<style lang="stylus" scoped>
._item
	display: flex
	padding: 8px
	border-radius: $border-radius-large
	margin-left: -8px
	margin-right: -8px

	&:hover
		background-color: var(--theme-bg-offset)

	&._expired
		._title
			color: var(--theme-fg-muted)

	&._active
		background-color: var(--theme-bg)

		._title
			color: var(--theme-fg)

	&._compact-stack
		flex-direction: column
		align-items: center
		margin-left: unset
		margin-right: unset

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
