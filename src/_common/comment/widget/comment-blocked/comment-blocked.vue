<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppTimelineListItem from '../../../timeline-list/item/item.vue';
import { Comment, CommentBlockReason } from '../../comment-model';

@Options({
	components: {
		AppTimelineListItem,
	},
})
export default class AppCommentWidgetCommentBlocked extends Vue {
	@Prop({ type: Object, required: true }) comment!: Comment;
	@Prop({ type: String, required: true }) reason!: CommentBlockReason;

	@Emit('show') show() {}
}
</script>

<template>
	<div class="alert">
		<template v-if="reason === 'commenter-blocked'">
			<span v-translate="{ username: comment.user.username }">
				Hidden comment by blocked user <b>@%{ username }</b>.
			</span>
		</template>
		<template v-else-if="reason === 'mentioned-blocked-user'">
			<span>
				<translate>A blocked user is mentioned in this comment.</translate>
			</span>
		</template>
		<app-button trans @click="show">
			<translate>Show</translate>
		</app-button>
	</div>
</template>

<style lang="stylus" scoped>
.alert
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: 0
	padding-top: 8px
	padding-bottom: 8px

	button
		margin: 0
</style>
