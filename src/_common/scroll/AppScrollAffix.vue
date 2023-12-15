<script lang="ts" setup>
import { CSSProperties, PropType, ref, toRef, toRefs } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { useResizeObserver } from '../../utils/resize-observer';
import { Ruler } from '../ruler/ruler-service';
import AppScrollInview, { ScrollInviewConfig } from './inview/AppScrollInview.vue';
import { Scroll } from './scroll.service';

const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
	padding: {
		type: Number,
		default: 24,
	},
	anchor: {
		type: String as PropType<'top' | 'bottom'>,
		validator: i => typeof i === 'string' && ['top', 'bottom'].indexOf(i) !== -1,
		default: 'top',
	},
	offsetTop: {
		type: Number,
		default: undefined,
	},
	affixedStyles: {
		type: Object as PropType<CSSProperties>,
		default: () => ({}),
	},
});

const { disabled, padding, anchor, offsetTop } = toRefs(props);

const container = ref<HTMLElement>();
const placeholder = ref<HTMLElement>();

const shouldAffix = ref(false);
const width = ref<number>();
const height = ref(0);
const inviewConfig = _createInviewConfig();

useResizeObserver({
	target: placeholder,
	callback: entries => {
		if (!shouldAffix.value) {
			return;
		}
		width.value = entries[0].contentRect.width;
	},
});

const isAffixed = toRef(() => shouldAffix.value && !disabled.value);

function outview() {
	if (shouldAffix.value) {
		return;
	}

	height.value = Ruler.outerHeight(container.value!);
	shouldAffix.value = true;
}

function inview() {
	if (!shouldAffix.value) {
		return;
	}

	shouldAffix.value = false;
}

function getOffsetTop() {
	return offsetTop?.value ?? Scroll.offsetTop;
}

function _createInviewConfig() {
	let offset = padding.value;
	if (anchor.value === 'top') {
		offset += getOffsetTop();
	} else if (offsetTop?.value !== undefined) {
		offset += offsetTop.value;
	}

	// The 10000px is so that it only considers the element "out of view" in
	// one direction.
	const margin =
		anchor.value === 'top'
			? `${offset * -1}px 0px 10000px 0px`
			: `10000px 0px ${offset * -1}px 0px`;

	return new ScrollInviewConfig({ margin, emitsOn: 'full-overlap' });
}
</script>

<template>
	<AppScrollInview :config="inviewConfig" @inview="inview" @outview="outview">
		<div
			v-if="isAffixed"
			ref="placeholder"
			class="gj-scroll-affix-placeholder"
			:style="{ height: `${height}px` }"
		/>

		<div
			ref="container"
			class="scroll-affix-container"
			:class="{
				'gj-scroll-affixed': isAffixed,
			}"
			:style="{
				...styleWhen(isAffixed && anchor === 'top', {
					top: `var(--scroll-affix-top, 0)`,
					paddingTop: `${padding}px`,
				}),
				...styleWhen(isAffixed && anchor === 'bottom', {
					bottom: `var(--scroll-affix-bottom, 0)`,
					paddingBottom: `${padding}px`,
				}),
				...styleWhen(isAffixed, {
					position: `fixed`,
					width: `${width}px`,
					...affixedStyles,
				}),
			}"
		>
			<slot :affixed="isAffixed" />
		</div>
	</AppScrollInview>
</template>
