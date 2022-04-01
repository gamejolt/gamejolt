<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppQuestProgress from './AppQuestProgress.vue';
import AppQuestThumbnail from './AppQuestThumbnail.vue';
import { Quest } from './quest-model';

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	active: {
		type: Boolean,
	},
	/** Hides the quest type and progress bar. */
	compact: {
		type: Boolean,
	},
	/**
	 * Hides the quest type and displays the avatar above the title and progress
	 * bar.
	 * */
	compactStack: {
		type: Boolean,
	},
});

const { quest, active, compact, compactStack } = toRefs(props);

const thumbnailIconSize = computed(() => {
	if (compact.value) {
		return 'sm';
	}
	return undefined;
});

const showProgress = computed(() => !quest.value.isExpired && !compact.value);
const showType = computed(() => !quest.value.isExpired && !compactStack.value);

const emit = defineEmits({
	goto: (_id: number) => true,
});

function onSelect() {
	emit('goto', quest.value.id);
}
</script>

<template>
	<RouterLink
		class="-item"
		:class="{
			'-active': active,
			'-compact': compact,
			'-compact-stack': compactStack,
			'-expired': quest.isExpired && !quest.has_activity,
		}"
		:to="{ name: 'quests.view', params: { id: quest.id } }"
		@click="onSelect"
	>
		<div class="-thumb">
			<AppQuestThumbnail :quest="quest" :icon-size="thumbnailIconSize" />
		</div>

		<AppSpacer :horizontal="!compactStack" :vertical="compactStack" :scale="4" />

		<div class="-details">
			<div v-if="showType" class="-type">{{ quest.questType }}</div>

			<div class="-title">{{ quest.title }}</div>

			<template v-if="showProgress">
				<AppSpacer vertical :scale="3" />

				<AppQuestProgress
					:progress="quest.progress_percent"
					:max-progress-ticks="100"
					:is-percent="true"
				/>
			</template>
		</div>
	</RouterLink>
</template>

<style lang="stylus" scoped>
.-item
	display: flex
	padding: 8px 16px 8px 8px
	margin-left: -8px
	margin-right: -16px
	border-radius: $border-radius-large

	&:hover
		background-color: unquote('rgba(var(--theme-bg-rgb), 0.5)')

	&.-expired
		.-title
			color: var(--theme-fg-muted)

	&.-active
		background-color: var(--theme-bg)

		.-title
			color: var(--theme-fg)

	&.-compact
		.-thumb
			max-width: 64px

		.-title
			font-size: 20px

	&.-compact-stack
		flex-direction: column
		align-items: center

		.-thumb
			width: 100%
			max-width: 80px

		.-title
			font-size: $font-size-base

.-thumb
	width: 30%
	max-width: 100px

.-details
	flex: auto
	display: flex
	flex-direction: column
	justify-content: center

.-title
	font-family: 'Germania'
	font-size: 24px
	color: var(--theme-fg)
	transition: color 300ms $weak-ease-out

.-type
	font-size: $font-size-small
	text-transform: uppercase
	color: var(--theme-fg-muted)
</style>
