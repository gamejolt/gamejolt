<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { Ruler } from '../ruler/ruler-service';
import { onScreenResize } from '../screen/screen-service';
import { useEventSubscription } from '../system/event/event-topic';
import AppScrollInview, { ScrollInviewConfig } from './inview/AppScrollInview.vue';
import { Scroll } from './scroll.service';

// Sync up with the $scroll-affixed-spacing stylus variable.
const ScrollAffixSpacing = 24;

const props = defineProps({
	className: {
		type: String,
		default: 'gj-scroll-affixed',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	scrollOffset: {
		type: Number,
		default: 0,
	},
	anchor: {
		type: String as PropType<'top' | 'bottom'>,
		validator: i => typeof i === 'string' && ['top', 'bottom'].indexOf(i) !== -1,
		default: 'top',
	},
});

const { className, disabled, scrollOffset, anchor } = toRefs(props);

const container = ref<HTMLElement>();
const placeholder = ref<HTMLElement>();

const shouldAffix = ref(false);
const width = ref<number>();
const height = ref(0);
const InviewConfig = _createInviewConfig();

// If we resized, then the element dimensions most likely changed.
useEventSubscription(onScreenResize, () => {
	// Always save dimensions, even if disabled, since we need to make
	// sure that if they enable at any point we're ready to affix it
	// properly.
	if (!shouldAffix.value) {
		return;
	}

	// Pull from the placeholder which should be the source of the
	// true width now.
	if (placeholder.value) {
		width.value = Ruler.outerWidth(placeholder.value);
	}
});

const isAffixed = computed(() => shouldAffix.value && !disabled.value);

const cssClasses = computed(() => {
	const classes = [];
	if (isAffixed.value) {
		classes.push(className.value);
	}

	if (anchor.value === 'top') {
		classes.push('-anchor-top');
	} else if (anchor.value === 'bottom') {
		classes.push('-anchor-bottom');
	}

	return classes;
});

function outview() {
	if (shouldAffix.value) {
		return;
	}

	width.value = Ruler.outerWidth(container.value!);
	height.value = Ruler.outerHeight(container.value!);
	shouldAffix.value = true;
}

function inview() {
	if (!shouldAffix.value) {
		return;
	}

	shouldAffix.value = false;
}

function _createInviewConfig() {
	let offset = scrollOffset.value + ScrollAffixSpacing;
	if (anchor.value === 'top') {
		offset += Scroll.offsetTop;
	}

	// The 10000px is so that it only considers the element "out of view" in
	// one direction.
	const margin =
		anchor.value === 'top' ? `-${offset}px 0px 10000px 0px` : `10000px 0px -${offset}px 0px`;

	console.log('margin', margin);

	return new ScrollInviewConfig({ margin, emitsOn: 'full-overlap' });
}
</script>

<template>
	<AppScrollInview :config="InviewConfig" @inview="inview" @outview="outview">
		<div
			v-if="isAffixed"
			ref="placeholder"
			class="gj-scroll-affix-placeholder"
			:style="{ height: `${height}px` }"
		/>

		<div
			ref="container"
			class="scroll-affix-container"
			:style="{ width: isAffixed ? `${width}px` : undefined }"
			:class="cssClasses"
		>
			<slot />
		</div>
	</AppScrollInview>
</template>

<style lang="stylus" scoped>
.gj-scroll-affixed
	position: fixed

.-anchor-top
	top: $scroll-affixed-spacing

.-anchor-bottom
	bottom: $scroll-affixed-spacing
</style>
