<script lang="ts" setup>
import { computed } from 'vue';

import { DisplayMode } from '~app/components/comment/modal/modal.service';
import { AppCommentWidgetLazy } from '~app/components/lazy';
import AppButton from '~common/button/AppButton.vue';
import AppCommentDisabledCheck from '~common/comment/AppCommentDisabledCheck.vue';
import { CommentableModel, CommentSort } from '~common/comment/comment-model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { Model } from '~common/model/model.service';
import { getScreen } from '~common/screen/screen-service';

type Props = {
	displayMode: DisplayMode;
	model: CommentableModel & Model;
	initialTab?: CommentSort;
};
defineProps<Props>();

const modal = useModal()!;

const autofocusAdd = computed(() => !getScreen().isXs.value);
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<AppCommentDisabledCheck :model="model">
				<AppCommentWidgetLazy
					:model="model"
					:autofocus="autofocusAdd"
					:initial-tab="initialTab"
					:display-mode="displayMode"
				/>
			</AppCommentDisabledCheck>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
:deep(.timeline-list-item-split)
	full-bleed()
</style>
