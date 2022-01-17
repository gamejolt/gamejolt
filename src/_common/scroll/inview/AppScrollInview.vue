<script lang="ts">
import { onMounted, onUnmounted, PropType, reactive, ref, watch } from 'vue';
import { useScrollInviewParent } from './AppScrollInviewParent.vue';

export type ScrollInviewEmitsOn = 'full-overlap' | 'partial-overlap';

/**
 * This is essentially managed by ScrollInviewContainer as the element this
 * controller is attached to goes into and out of view.
 */
export type ScrollInviewController = ReturnType<typeof createScrollInview>;

type ChangeHandler = (visible: boolean) => void;

export function createScrollInview() {
	const c = reactive({
		element: undefined as HTMLElement | undefined,
		isInview: null as null | boolean,
		isFocused: null as null | boolean,
		_changeHandlers: new Set<ChangeHandler>(),

		/**
		 * The Y position of the element on the page.
		 */
		y: 0,

		/**
		 * Latest threshold that has crossed. We keep track of each "quarter"
		 * crossed, as well as fully in view and fully out of view.
		 */
		latestThreshold: 0,

		emitChange(visible: boolean) {
			this._changeHandlers.forEach(i => i(visible));
		},

		_setElement(element: HTMLElement) {
			this.element = element;
		},
	});

	return c;
}

export class ScrollInviewConfig {
	/**
	 * The margin will effectively get added to the bounding box of this element
	 * to make it larger or smaller. It should be in the format of a CSS margin
	 * property and always have the "px" after each value.
	 * Note: This is not reactive.
	 */
	margin = '0px';

	/**
	 * The emits-on prop determines when the inview and outview events emit. Possible values:
	 *	'partial-overlap' (default value)
	 *		inview - emits when the element comes partially in view.
	 *		outview - emits when the element goes completely out of view.
	 *	'full-overlap'
	 *		inview - emits when the element comes in view fully.
	 *		outview - emits when the element goes partially out of view.
	 */
	emitsOn: ScrollInviewEmitsOn = 'partial-overlap';

	/**
	 * Whether or not we should be tracking the most focused element within the
	 * elements attached to this config.
	 */
	trackFocused = false;

	constructor(config?: Partial<ScrollInviewConfig>) {
		if (config) {
			Object.assign(this, config);
		}
	}
}
</script>

<script lang="ts" setup>
const props = defineProps({
	config: {
		type: Object as PropType<ScrollInviewConfig>,
		required: true,
	},
	tag: {
		type: String,
		default: 'div',
	},
	controller: {
		type: Object as PropType<ScrollInviewController>,
		default: () => createScrollInview(),
	},
});

// These will get called by [ScrollInviewContainer].
const emit = defineEmits({
	inview: () => true,
	outview: () => true,
});

const parent = useScrollInviewParent()!;

const onChange: ChangeHandler = visible => {
	if (visible) {
		emit('inview');
	} else {
		emit('outview');
	}
};

onMounted(async () => {
	// Set up the controller with the props from the component.
	props.controller._changeHandlers.add(onChange);
});

onUnmounted(() => {
	parent.getContainer(props.config).unobserveItem(props.controller);
	props.controller._changeHandlers.delete(onChange);
});

const root = ref<HTMLElement | undefined>();

// The ref will be assigned to this once it's fully rendered.
watch(root, newElement => {
	if (newElement) {
		props.controller._setElement(newElement);
		parent.getContainer(props.config).observeItem(props.controller);
	}
});
</script>

<template>
	<component :is="tag" ref="root">
		<slot />
	</component>
</template>
