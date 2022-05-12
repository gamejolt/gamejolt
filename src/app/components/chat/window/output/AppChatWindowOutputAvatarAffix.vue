<script lang="ts">
import { onBeforeUnmount, PropType, ref, toRaw, toRefs, watch } from 'vue';
import { Ruler } from '../../../../../_common/ruler/ruler-service';
import { onScreenResize } from '../../../../../_common/screen/screen-service';
import { ScrollController } from '../../../../../_common/scroll/AppScrollScroller.vue';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { useEventSubscription } from '../../../../../_common/system/event/event-topic';

const InviewConfig = new ScrollInviewConfig({ emitsOn: 'partial-overlap' });
</script>

<script lang="ts" setup>
const props = defineProps({
	parent: {
		type: Object as PropType<ScrollController>,
		required: true,
	},
	avatarSize: {
		type: Number,
		default: 32,
	},
	padding: {
		type: Number,
		default: 8,
	},
});

const { parent, avatarSize, padding } = toRefs(props);

let isInview = true;
let _listeningParentElement: HTMLElement | null = null;

const root = ref<HTMLElement>();
const container = ref<HTMLElement>();

const bottom = ref('0px');

// If we resized, then the element dimensions most likely changed.
useEventSubscription(onScreenResize, _calcBottom);

watch(
	parent,
	() => {
		const newParent = parent.value.element.value;
		if (toRaw(_listeningParentElement) === toRaw(newParent)) {
			return;
		}

		cleanupListeners();
		_listeningParentElement = newParent || null;

		if (!isInview) {
			return;
		}

		attachListeners();
		_calcBottom();
	},
	{
		immediate: true,
	}
);

onBeforeUnmount(() => {
	cleanupListeners();
});

async function _calcBottom() {
	const _parent = _listeningParentElement;
	if (!root.value || !_parent) {
		return;
	}

	const parentOffset = Ruler.offset(_parent);
	const parentHeight = parentOffset.height;
	const myOffset = Ruler.offset(root.value);

	const styleBottom =
		myOffset.top - parentOffset.top + myOffset.height - parentHeight + padding.value;

	const maxBottom = myOffset.height - avatarSize.value;
	bottom.value = Math.max(0, Math.min(maxBottom, styleBottom)) + 'px';
}

function cleanupListeners() {
	_listeningParentElement?.removeEventListener('scroll', _calcBottom, {
		capture: true,
	});
}

function attachListeners() {
	_listeningParentElement?.addEventListener('scroll', _calcBottom, {
		passive: true,
		capture: true,
	});
}

function outview() {
	if (!isInview) {
		return;
	}
	isInview = false;
	cleanupListeners();
}

function inview() {
	if (isInview) {
		return;
	}
	isInview = true;
	attachListeners();
	_calcBottom();
}
</script>

<template>
	<div ref="root" class="chat-avatar-affix">
		<AppScrollInview class="-inview" :config="InviewConfig" @inview="inview" @outview="outview">
			<div
				ref="container"
				class="-container"
				:style="{
					bottom,
					width: avatarSize + 'px',
					height: avatarSize + 'px',
				}"
			>
				<slot />
			</div>
		</AppScrollInview>
	</div>
</template>

<style lang="stylus" scoped>
.chat-avatar-affix
	width: 100%
	height: 100%

.-inview
	display: flex
	justify-content: center
	width: 100%
	height: 100%

.-container
	position: absolute
	bottom: 0
</style>
