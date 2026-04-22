<script lang="ts" setup>
import { computed, HTMLAttributes } from 'vue';

import { $gettext } from '~common/translate/translate.service';

const images = import.meta.glob<string>('./*.gif', {
	eager: true,
	query: '?url',
	import: 'default',
});

type Props = {
	label?: string;
	hideLabel?: boolean;
	big?: boolean;
	noColor?: boolean;
	stationary?: boolean;
	centered?: boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const {
	label = $gettext(`Loading...`),
	hideLabel = false,
	big = false,
	noColor = false,
	stationary = false,
	centered = false,
} = defineProps<Props>();

const img = computed(() => {
	const img =
		'loading' + (stationary ? '-stationary' : '') + (noColor ? '-bw' : '') + (big ? '-2x' : '');

	return images[`./${img}.gif`];
});
</script>

<template>
	<div
		class="loading"
		:class="{
			'loading-big': big,
			'loading-stationary': stationary,
			'loading-bw': noColor,
			'loading-centered': centered,
		}"
	>
		<img :src="img" alt="" :title="$gettext(`Loading...`)" />
		<span class="loading-label" :class="{ 'sr-only': hideLabel }">
			{{ label }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.loading
	theme-prop('color', 'light')
	font-size: $font-size-small
	text-transform: uppercase
	line-height: 20px
	margin-bottom: $font-size-base
	animation-delay: 250ms

	> img
		display: block
		margin-bottom: 5px

.loading-big
	font-size: $font-size-large
	font-weight: bold

	img
		margin-bottom: 10px

.loading-centered
	text-align: center

	img
		margin-left: auto
		margin-right: auto

// Loading image sizing.
.loading > img
	width: 175px * 0.5
	height: 56px * 0.5

.loading-big > img
	width: 352px * 0.5
	height: 112px * 0.5

.loading-stationary > img
	width: 184px * 0.5

.loading-stationary.loading-big > img
	width: 368px * 0.5
</style>
