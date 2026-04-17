<script lang="ts" setup>
import { CSSProperties, ref, toRef, useTemplateRef } from 'vue';

import { Ruler } from '~common/ruler/ruler-service';
import AppScrollInview, { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';
import { Scroll } from '~common/scroll/scroll.service';
import { styleWhen } from '~styles/mixins';
import { useResizeObserver } from '~utils/resize-observer';

type Props = {
	disabled?: boolean;
	padding?: number;
	anchor?: 'top' | 'bottom';
	offsetTop?: number;
	affixedStyles?: CSSProperties;
};
const {
	disabled = false,
	padding = 24,
	anchor = 'top',
	offsetTop,
	affixedStyles = {},
} = defineProps<Props>();

const container = useTemplateRef('container');
const placeholder = useTemplateRef('placeholder');

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

const isAffixed = toRef(() => shouldAffix.value && !disabled);

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
	return offsetTop ?? Scroll.offsetTop;
}

function _createInviewConfig() {
	let offset = padding;
	if (anchor === 'top') {
		offset += getOffsetTop();
	} else if (offsetTop !== undefined) {
		offset += offsetTop;
	}

	// The 10000px is so that it only considers the element "out of view" in
	// one direction.
	const margin =
		anchor === 'top' ? `${offset * -1}px 0px 10000px 0px` : `10000px 0px ${offset * -1}px 0px`;

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
