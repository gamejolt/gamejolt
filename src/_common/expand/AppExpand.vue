<script lang="ts" setup>
import { nextTick, onMounted, ref, toRefs, watch } from 'vue';

const props = defineProps({
	when: {
		type: Boolean,
	},
	animateInitial: {
		type: Boolean,
	},
});

const { when, animateInitial } = toRefs(props);

const root = ref<HTMLElement>();
const inDom = ref(false);

onMounted(async () => {
	inDom.value = when.value;

	if (inDom.value && root.value) {
		root.value.style.height = 'auto';

		// This simulates having it closed and then showing immediately to
		// slide it out.
		if (animateInitial.value) {
			root.value.style.height = '0';
			inDom.value = false;
			await nextTick();
			onWhenWatch();
		}
	}

	watch(when, onWhenWatch);
});

async function onWhenWatch() {
	await nextTick();

	const elem = root.value;
	if (!elem) {
		return;
	}

	if (when.value) {
		// Show in DOM as soon as possible.
		// This will get the correct height to expand out to.
		inDom.value = true;
		elem.classList.add('-transition');
		await nextTick();

		// Should be in DOM now so we can pull height.
		elem.style.height = elem.scrollHeight + 'px';
	} else {
		elem.style.height = elem.scrollHeight + 'px';

		// Reading offsetWidth forces a browser reflow.
		// This way the change from explicit height to 0 is noticed.
		_forceReflow();

		elem.classList.add('-transition');
		elem.style.height = '0';
	}
}

function _forceReflow() {
	// Touching this value will force a reflow.
	return root.value?.offsetWidth;
}

/**
 * For clean up work after transitions.
 */
function afterTransition() {
	const elem = root.value;
	if (!elem) {
		return;
	}

	if (when.value) {
		elem.classList.remove('-transition');
		elem.style.height = 'auto';
	} else if (!when.value) {
		elem.classList.remove('-transition');
		inDom.value = false;
	}
}
</script>

<template>
	<div ref="root" class="-expand" @transitionend="afterTransition">
		<div v-if="inDom" class="clearfix">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-expand
	overflow: hidden
	transition: height 600ms $strong-ease-out

	&.-transition
		height: 0
</style>
