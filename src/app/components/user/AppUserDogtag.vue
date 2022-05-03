<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
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

const classes = computed(() => {
	if (text.value.toLowerCase() === 'guy') {
		return ['user-dogtag-guy'];
	} else {
		return ['tag-highlight'];
	}
});
</script>

<template>
	<span class="user-dogtag tag" :class="classes">
		{{ text }}
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
