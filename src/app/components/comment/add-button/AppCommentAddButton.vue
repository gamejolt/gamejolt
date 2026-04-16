<script lang="ts" setup>
import { computed } from 'vue';

import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { CommentableModel } from '../../../../_common/comment/comment-model';
import { Model } from '../../../../_common/model/model.service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { DisplayMode, showCommentModal } from '../modal/modal.service';

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
