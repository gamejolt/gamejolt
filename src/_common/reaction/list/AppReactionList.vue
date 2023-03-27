<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { toggleReactionOnResource } from '../../emoji/modal/modal.service';
import { ReactionDetailsModal } from '../details-modal/modal.service';
import { ReactionableModel, ReactionCount } from '../reaction.model';
import AppReactionListItem from './AppReactionListItem.vue';

type ClickAction = 'toggle' | 'emit-click';
type ContextAction = 'show-details' | 'emit-context';

const props = defineProps({
	model: {
		type: Object as PropType<ReactionableModel>,
		required: true,
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
});

const { model, focusedId, clickAction, contextAction } = toRefs(props);

const emit = defineEmits({
	'item-click': (_reaction: ReactionCount) => true,
	'item-context': (_reaction: ReactionCount) => true,
});

const reactions = computed(() => model.value.reaction_counts);

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
</script>

<template>
	<!-- AppReactionList -->
	<div
		:style="{
			display: `inline-block`,
			margin: `4px 0 8px 0`,
		}"
	>
		<div
			:style="{
				display: `inline-flex`,
				flexWrap: `wrap`,
				gap: `2px 6px`,
			}"
		>
			<AppReactionListItem
				v-for="reaction of reactions"
				:key="reaction.id"
				:style="{
					cursor: `pointer`,
				}"
				:reaction="reaction"
				:focused-id="focusedId"
				@click="onItemClick(reaction)"
				@contextmenu.prevent="onItemContext(reaction)"
			/>
		</div>
	</div>
</template>
