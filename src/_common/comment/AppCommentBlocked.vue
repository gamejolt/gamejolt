<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import { CommentBlockReason, CommentModel } from '~common/comment/comment-model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	comment: CommentModel;
	reason: CommentBlockReason;
};
defineProps<Props>();

const emit = defineEmits<{
	show: [];
}>();
</script>

<template>
	<div class="alert">
		<template v-if="reason === 'commenter-blocked'">
			<AppTranslate :translate-params="{ username: comment.user.username }">
				Hidden comment by blocked user @%{ username }.
			</AppTranslate>
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
