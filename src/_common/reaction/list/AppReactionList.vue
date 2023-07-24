<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { buildCSSPixelValue } from '../../../_styles/variables';
import { ComponentProps } from '../../component-helpers';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller, { createScroller } from '../../scroll/AppScrollScroller.vue';
import { ReactionDetailsModal } from '../details-modal/modal.service';
import { ReactionableModel, ReactionCount, toggleReactionOnResource } from '../reaction-count';
import AppReactionListItem from './AppReactionListItem.vue';

type ClickAction = 'toggle' | 'emit-click';
type ContextAction = 'show-details' | 'emit-context';

const props = defineProps({
	model: {
		type: Object as PropType<ReactionableModel>,
		required: true,
	},
	listType: {
		type: String as PropType<'wrap' | 'h-scroll'>,
		default: 'wrap',
	},
	focusedId: {
		type: Number,
		default: undefined,
	},
	clickAction: {
		type: String as PropType<ClickAction>,
		default: undefined,
	},
	contextAction: {
		type: String as PropType<ContextAction>,
		default: undefined,
	},
	hoverScroll: {
		type: Boolean,
	},
	hoverScrollBleed: {
		type: Number,
		default: 0,
	},
	hoverScrollWidth: {
		type: Number,
		default: 24,
	},
});

const {
	model,
	listType,
	focusedId,
	clickAction,
	contextAction,
	hoverScroll,
	hoverScrollBleed,
	hoverScrollWidth,
} = toRefs(props);

const emit = defineEmits({
	'item-click': (_reaction: ReactionCount) => true,
	'item-context': (_reaction: ReactionCount) => true,
});

const scrollController = createScroller();

const reactions = computed(() => model.value.reaction_counts);
const useScroller = computed(() => listType.value === 'h-scroll');
const scrollerProps = computed(() => {
	if (!useScroller.value) {
		return {};
	}

	return {
		controller: scrollController,
		horizontal: true,
	} as ComponentProps<typeof AppScrollScroller>;
});

function onItemClick(reaction: ReactionCount) {
	if (!clickAction?.value) {
		return;
	}

	if (clickAction.value === 'emit-click') {
		emit('item-click', reaction);
	} else if (clickAction.value === 'toggle') {
		toggleReactionOnResource({
			model: model.value,
			emojiId: reaction.id,
			imgUrl: reaction.img_url,
			prefix: reaction.prefix,
			shortName: reaction.short_name,
		});
	}
}

function onItemContext(reaction: ReactionCount) {
	if (!contextAction?.value) {
		return;
	}

	if (contextAction.value === 'emit-context') {
		emit('item-context', reaction);
	} else if (contextAction.value === 'show-details') {
		ReactionDetailsModal.show({
			model: model.value,
			initialReaction: reaction,
		});
	}
}

let mouseOverSide: 'left' | 'right' | null = null;
function onMouseLeaveSide() {
	mouseOverSide = null;
}

async function onMouseOverSide(side: typeof mouseOverSide) {
	if (mouseOverSide) {
		return;
	}

	mouseOverSide = side;
	let mod = 8;
	let shouldLoop = !!mouseOverSide;

	while (mod > 0) {
		await new Promise<void>(resolve =>
			requestAnimationFrame(() => {
				const element = scrollController.element.value;
				if (!element) {
					shouldLoop = false;
					mod = 0;
					resolve();
					return;
				}

				if (mouseOverSide !== side) {
					shouldLoop = false;
				}

				if (!shouldLoop) {
					mod = mod / 1.2;
				} else {
					mod = Math.min(mod * 1.2, 10);
				}

				if (mod <= 1) {
					shouldLoop = false;
					mod = 0;
					resolve();
					return;
				}

				let offsetMod = mod / 2;
				if (side === 'left') {
					offsetMod = -offsetMod;
				}
				const offset = element.scrollLeft;

				scrollController.scrollTo(offset + offsetMod, {
					edge: 'left',
				});
				resolve();
			})
		);
	}
}

const scrollerMarginBottom = buildCSSPixelValue(12);
</script>

<template>
	<!-- AppReactionList -->
	<div
		:style="{
			position: `relative`,
		}"
	>
		<component
			:is="useScroller ? AppScrollScroller : 'div'"
			v-bind="scrollerProps"
			:style="{
				display: `inline-block`,
				margin: `4px 0 8px 0`,
				...styleWhen(useScroller, {
					display: `block`,
				}),
			}"
		>
			<div
				:style="{
					display: `inline-flex`,
					flexWrap: `wrap`,
					gap: `2px 6px`,
					...styleWhen(useScroller, {
						flexWrap: `nowrap`,
						marginBottom: scrollerMarginBottom.px,
						zIndex: 0,
					}),
				}"
			>
				<AppReactionListItem
					v-for="reaction of reactions"
					:key="reaction.id"
					:style="
						styleWhen(!!clickAction, {
							cursor: `pointer`,
						})
					"
					:reaction="reaction"
					:focused-id="focusedId"
					@click="onItemClick(reaction)"
					@contextmenu.prevent="onItemContext(reaction)"
				/>
			</div>
		</component>

		<template v-if="Screen.isPointerMouse && useScroller && hoverScroll">
			<div
				v-for="side in (['left', 'right'] as const)"
				:key="side"
				:style="{
					position: `absolute`,
					[side]: `${-hoverScrollBleed}px`,
					top: 0,
					bottom: scrollerMarginBottom.px,
					width: `${hoverScrollWidth}px`,
					zIndex: 1,
				}"
				@mouseover="onMouseOverSide(side)"
				@mouseout="onMouseLeaveSide()"
			/>
		</template>
	</div>
</template>
