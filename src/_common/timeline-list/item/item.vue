<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import './item-content.styl';

@Options({})
export default class AppTimelineListItem extends Vue {
	@Prop(Boolean)
	isActive?: boolean;

	@Prop(Boolean)
	isNew?: boolean;

	@Prop(Boolean)
	isThread?: boolean;

	@Prop(Boolean)
	isLast?: boolean;

	get hasBubble() {
		return !!this.$slots.bubble;
	}
}
</script>

<template>
	<div
		class="timeline-list-item"
		:class="{
			new: isNew,
			active: isActive,
			'is-thread': isThread,
			'is-last': isLast,
		}"
	>
		<div class="timeline-list-item-connector" />

		<div v-if="hasBubble" class="timeline-list-item-bubble">
			<div class="timeline-list-item-bubble-inner">
				<slot name="bubble" />
			</div>
		</div>

		<div class="timeline-list-item-main">
			<slot />
		</div>
	</div>
</template>
