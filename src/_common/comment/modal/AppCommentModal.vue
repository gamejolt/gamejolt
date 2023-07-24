<script lang="ts" setup>
import { computed, PropType } from 'vue';
import AppButton from '../../button/AppButton.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppCommentDisabledCheck from '../AppCommentDisabledCheck.vue';
import { CommentableModel, CommentSort } from '../comment-model';
import AppCommentWidget from '../widget/AppCommentWidget.vue';
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
		type: String as PropType<CommentSort>,
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
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<AppCommentDisabledCheck :model="model">
				<AppCommentWidget
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
