<script lang="ts" setup>
import { computed, CSSProperties, onMounted, ref, toRefs, watch } from 'vue';
import { debounce } from '../../../../utils/utils';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { vAppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Ruler } from '../../../../_common/ruler/ruler-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { useFiresideController } from '../../../components/fireside/controller/controller';

const props = defineProps({
	opacity: {
		type: Number,
		default: 0.9,
	},
	collapse: {
		type: Boolean,
	},
});

const { opacity, collapse } = toRefs(props);

const debounceHeaderDimensions = debounce(updateHeaderHeight, 300);
const debounceRootDimensions = debounce(afterRootHeightChanged, 300);

const { isFullscreen } = useFiresideController()!;

const root = ref<HTMLDivElement>();
const header = ref<HTMLDivElement>();

const shouldCollapse = ref(props.collapse);
const useStaticHeight = ref(false);

const rootHeight = computed(() => Screen.height - (isFullscreen.value ? 0 : 56));
const headerHeight = ref(56);

const isAnimatingHeight = ref(false);
let isAnimatingTimeout: NodeJS.Timeout | null = null;

const contentStyle = computed<CSSProperties>(() => {
	// Fill the available space of our flex parent.
	//
	// This gets set to `false` when the sidebar dimensions change, then back to
	// `true` after we debounce the dimensions change. This is done so we don't
	// rapidly assign dimensions as they change, but our content can still
	// immediately size itself to fit the parent element.
	if (!useStaticHeight.value && !isAnimatingHeight.value) {
		return { flex: 'auto' };
	}

	return {};
});

const expandHeight = computed<string | undefined>(() => {
	if (!useStaticHeight.value && !isAnimatingHeight.value) {
		return undefined;
	}

	return rootHeight.value - headerHeight.value + 'px';
});

watch(collapse, async willCollapse => {
	const callbacks = [
		[updateHeaderHeight, afterRootHeightChanged],
		[() => (shouldCollapse.value = willCollapse)],
	];

	if (isAnimatingTimeout) {
		clearTimeout(isAnimatingTimeout);
		isAnimatingTimeout = null;
		isAnimatingHeight.value = false;
	}
	isAnimatingHeight.value = true;

	if (!willCollapse) {
		callbacks.reverse();
	}

	callbacks.flat().forEach(cb => cb());

	isAnimatingTimeout = setTimeout(() => {
		isAnimatingHeight.value = false;
		isAnimatingTimeout = null;
	}, 3_000);
});

onMounted(() => {
	updateHeaderHeight();
	afterRootHeightChanged();
});

function updateHeaderHeight() {
	if (header.value) {
		headerHeight.value = Ruler.height(header.value);
	}
}

function afterRootHeightChanged() {
	useStaticHeight.value = true;
}

function onRootDimensionsChanged() {
	useStaticHeight.value = false;
	debounceRootDimensions();
}
</script>

<template>
	<div
		ref="root"
		v-app-observe-dimensions="onRootDimensionsChanged"
		class="-wrapper"
		:class="{ '-collapsed': shouldCollapse }"
		:style="{
			'background-color': `rgba(var(--theme-bg-offset-rgb), ${opacity})`,
		}"
	>
		<div ref="header" v-app-observe-dimensions="debounceHeaderDimensions" class="-header">
			<slot name="header" />
		</div>

		<AppExpand
			class="-content"
			:style="contentStyle"
			:expand-height="expandHeight"
			:when="!shouldCollapse"
		>
			<div class="-body">
				<slot name="body" />
			</div>

			<div class="-footer">
				<slot name="footer" />
			</div>
		</AppExpand>
	</div>
</template>

<style lang="stylus" scoped>
.-wrapper
	display: flex
	flex-direction: column
	justify-content: flex-end
	height: 100%
	transition: background-color 600ms 100ms

	&.-collapsed
		height: fit-content

.-header
	position: relative
	flex: none
	z-index: 2

.-content
	display: flex
	flex-direction: column

	> ::v-deep(*)
		height: 100%
		display: flex
		flex-direction: column

.-body
	flex: auto
	display: flex
	flex-direction: column
	max-height: 100%
	overflow: hidden

.-footer
	position: relative
	flex: none
	change-bg('bg')
	z-index: 2
</style>
