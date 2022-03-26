<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppProgressBar from '../progress/AppProgressBar.vue';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppQuestThumbnail from './AppQuestThumbnail.vue';
import { Quest } from './quest-model';

defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	active: {
		type: Boolean,
	},
});
</script>

<template>
	<RouterLink
		class="-item"
		:class="{ '-active': active }"
		:to="{ name: 'quests.view', params: { id: quest.id } }"
	>
		<div class="-thumb">
			<AppQuestThumbnail :quest="quest" />
		</div>

		<AppSpacer horizontal :scale="4" />

		<div class="-details">
			<div class="-type">World Event / Daily</div>
			<div class="-title">{{ quest.title }}</div>

			<AppSpacer vertical :scale="3" />

			<AppProgressBar class="sans-margin" :percent="20" glow thin />
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
