<script lang="ts" setup>
import { computed } from 'vue';

import { ComponentProps } from '~common/component-helpers';
import { showReactionDetailsModal } from '~common/reaction/details-modal/modal.service';
import AppReactionListItem from '~common/reaction/list/AppReactionListItem.vue';
import {
	ReactionableModel,
	ReactionCount,
	toggleReactionOnResource,
} from '~common/reaction/reaction-count';
import { Screen } from '~common/screen/screen-service';
import AppScrollScroller, { createScroller } from '~common/scroll/AppScrollScroller.vue';
import { styleWhen } from '~styles/mixins';
import { buildCSSPixelValue } from '~styles/variables';

type ClickAction = 'toggle' | 'emit-click';
type ContextAction = 'show-details' | 'emit-context';

type Props = {
	model: ReactionableModel;
	listType?: 'wrap' | 'h-scroll';
	focusedId?: number;
	clickAction?: ClickAction;
	contextAction?: ContextAction;
	hoverScroll?: boolean;
	hoverScrollBleed?: number;
	hoverScrollWidth?: number;
	sansMarginBottom?: boolean;
};
const {
	model,
	listType = 'wrap',
	clickAction,
	contextAction,
	hoverScrollBleed = 0,
	hoverScrollWidth = 24,
} = defineProps<Props>();

const emit = defineEmits<{
	'item-click': [reaction: ReactionCount];
	'item-context': [reaction: ReactionCount];
}>();

const scrollController = createScroller();

const reactions = computed(() => model.reaction_counts);
const useScroller = computed(() => listType === 'h-scroll');
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
	if (!clickAction) {
		return;
	}

	if (clickAction === 'emit-click') {
		emit('item-click', reaction);
	} else if (clickAction === 'toggle') {
		toggleReactionOnResource({
			model,
			emojiId: reaction.id,
			imgUrl: reaction.img_url,
			prefix: reaction.prefix,
			shortName: reaction.short_name,
		});
	}
}

function onItemContext(reaction: ReactionCount) {
	if (!contextAction) {
		return;
	}

	if (contextAction === 'emit-context') {
		emit('item-context', reaction);
	} else if (contextAction === 'show-details') {
		showReactionDetailsModal({
			model,
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
				...styleWhen(sansMarginBottom, {
					marginBottom: 0,
				}),
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
				v-for="side in ['left', 'right'] as const"
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
