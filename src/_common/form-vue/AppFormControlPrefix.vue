<script lang="ts" setup>
import { computed, Ref, ref, watch } from 'vue';
import { useResizeObserver } from '../../utils/hooks/useResizeObserver';
import { sleep } from '../../utils/utils';
import { Ruler } from '../ruler/ruler-service';
import { provideFormControlHooks } from './form-control-hooks';

defineProps({
	prefix: {
		type: String,
		required: true,
	},
});

const prefixElement = ref<HTMLSpanElement>();
let inputElem: Ref<HTMLInputElement | undefined>;

const originalInputPaddingTop = ref(0);
const originalInputPaddingLeft = ref(0);
const originalInputMarginTop = ref(0);
const originalInputMarginLeft = ref(0);
const paddingLeft = ref('');

const originalOffsetTop = computed(
	() => originalInputPaddingTop.value + originalInputMarginTop.value
);
const originalOffsetLeft = computed(
	() => originalInputPaddingLeft.value + originalInputMarginLeft.value
);

function recalcPositioning() {
	if (prefixElement.value) {
		paddingLeft.value = Ruler.outerWidth(prefixElement.value) + originalOffsetLeft.value + 'px';
	}
}

useResizeObserver({ target: prefixElement, callback: recalcPositioning });

provideFormControlHooks({
	async afterMount(_controller, mountedInputElem) {
		inputElem = mountedInputElem;

		await sleep(500);

		// If there's a prefix.
		if (inputElem.value && prefixElement.value) {
			const styles = window.getComputedStyle(inputElem.value);
			originalInputPaddingTop.value = parseFloat(styles.paddingTop || '0');
			originalInputPaddingLeft.value = parseFloat(styles.paddingLeft || '0');
			originalInputMarginTop.value = parseFloat(styles.marginTop || '0');
			originalInputMarginLeft.value = parseFloat(styles.marginLeft || '0');

			recalcPositioning();
		}
	},
});

watch(
	() => paddingLeft.value,
	paddingLeft => {
		if (inputElem.value) {
			inputElem.value.style.paddingLeft = paddingLeft;
		}
	}
);
</script>

<template>
	<div class="form-control-prefix">
		<slot />
		<span
			v-if="prefix"
			ref="prefixElement"
			class="-prefix text-muted"
			:style="{ top: `${originalOffsetTop}px`, left: `${originalOffsetLeft}px` }"
		>
			<em>{{ prefix }}</em>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.form-control-prefix
	position: relative

.-prefix
	position: absolute
	pointer-events: none
</style>
