<script lang="ts">
import { computed, PropType, StyleValue, toRefs } from 'vue';
import { DogtagData } from '../../../_common/dogtag/dogtag-data';
</script>

<script lang="ts" setup>
const props = defineProps({
	tag: {
		type: Object as PropType<DogtagData>,
		required: true,
	},
});

const { tag } = toRefs(props);

const text = computed(() => tag.value.text);

const displayText = computed(() => {
	// Maintain consistency between single pronoun selections and combined ones.
	return text.value
		.split('/')
		.map(i => i.trim())
		.join(' / ');
});

const classes = computed(() => {
	if (text.value.toLowerCase() === 'guy') {
		return ['user-dogtag-guy'];
	} else {
		return ['tag-highlight'];
	}
});

const styles = computed<StyleValue>(() => {
	const match = text.value.match(/[/ ]/);
	if (match && match.length > 0) {
		return { 'text-transform': 'capitalize' };
	}
	return {};
});
</script>

<template>
	<span class="user-dogtag tag" :class="classes" :style="styles">
		{{ displayText }}
	</span>
</template>

<style lang="stylus" scoped>
// Alternate between all dogtag types!
@keyframes user-dogtag-guy
	0%
		background-color: $gj-pink
		color: $white

	25%
		background-color: $gj-green
		color: $gj-dark-green

	50%
		background-color: $gj-blue
		color: $black

	75%
		background-color: $gj-dark-green
		color: $gj-green

	100%
		background-color: $gj-pink
		color: $white

.user-dogtag-guy
		animation-name: user-dogtag-guy
		animation-duration: 5s
		animation-iteration-count: infinite
</style>
