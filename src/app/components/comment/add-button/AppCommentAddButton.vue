<script lang="ts" setup>
import { computed } from 'vue';

import { DisplayMode, showCommentModal } from '~app/components/comment/modal/modal.service';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import { CommentableModel } from '~common/comment/comment-model';
import { Model } from '~common/model/model.service';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	model: Model & CommentableModel;
	displayMode: DisplayMode;
	placeholder?: string;
};
const { model, placeholder, displayMode } = defineProps<Props>();

const placeholderText = computed(() => {
	return placeholder ? placeholder : $gettext('What do you think?');
});

function open() {
	showCommentModal({
		model,
		displayMode,
	});
}
</script>

<template>
	<div v-app-auth-required>
		<div class="comment-add-button" @click="open()">
			{{ placeholderText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.comment-add-button
	input-placeholder-button()
	change-bg('bg')
	margin-bottom: $line-height-computed
</style>
