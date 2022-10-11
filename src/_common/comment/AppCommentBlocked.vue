<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../button/AppButton.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { Comment, CommentBlockReason } from './comment-model';

defineProps({
	comment: {
		type: Object as PropType<Comment>,
		required: true,
	},
	reason: {
		type: String as PropType<CommentBlockReason>,
		required: true,
	},
});

const emit = defineEmits({
	show: () => true,
});
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
				<AppTranslate>A blocked user is mentioned in this comment.</AppTranslate>
			</span>
		</template>
		<AppButton trans @click="emit('show')">
			<AppTranslate>Show</AppTranslate>
		</AppButton>
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
