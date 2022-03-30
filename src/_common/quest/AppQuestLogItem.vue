<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
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
});

const { quest } = toRefs(props);

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
		:class="{ '-active': active }"
		:to="{ name: 'quests.view', params: { id: quest.id } }"
		@click="onSelect"
	>
		<div class="-thumb">
			<AppQuestThumbnail :quest="quest" />
		</div>

		<AppSpacer horizontal :scale="4" />

		<div class="-details">
			<div class="-type">{{ quest.questType }}</div>
			<div class="-title">{{ quest.title }}</div>

			<AppSpacer vertical :scale="3" />

			<AppQuestProgress
				:progress="quest.progress_percent"
				:max-progress-ticks="100"
				:is-percent="true"
			/>
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

	&.-active
		background-color: var(--theme-bg)

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
	font-size: 28px
	color: var(--theme-fg)

.-type
	font-size: $font-size-small
	text-transform: uppercase
	color: var(--theme-fg-muted)
</style>
