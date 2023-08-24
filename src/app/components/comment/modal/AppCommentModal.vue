<script lang="ts" setup>
import { computed, PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommentDisabledCheck from '../../../../_common/comment/AppCommentDisabledCheck.vue';
import { CommentableModel } from '../../../../_common/comment/comment-model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { Model } from '../../../../_common/model/model.service';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppCommentWidgetLazy } from '../../lazy';
import { DisplayMode } from './modal.service';

defineProps({
	displayMode: {
		type: String as PropType<DisplayMode>,
		required: true,
	},
	model: {
		type: Object as unknown as PropType<CommentableModel & Model>,
		required: true,
	},
	initialTab: {
		type: String,
		default: undefined,
	},
});

const modal = useModal()!;

const autofocusAdd = computed(() => !Screen.isXs);
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
::v-deep(.timeline-list-item-split)
	full-bleed()
</style>
