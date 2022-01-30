<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import AppCommentWidget from '../widget/widget.vue';
import { DisplayMode } from './modal.service';

@Options({
	components: {
		AppCommentWidget,
	},
})
export default class AppCommentModal extends mixins(BaseModal) {
	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Object)
	model!: Model;

	@Prop(String)
	initialTab?: string;

	get autofocusAdd() {
		return !Screen.isXs;
	}

	onReplyAdd() {
		// Dismiss the modal when a reply is added.
		this.modal.dismiss();
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<AppCommentWidget
				:model="model"
				:autofocus="autofocusAdd"
				:initial-tab="initialTab"
				:display-mode="displayMode"
			/>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
::v-deep(.timeline-list-item-split)
	full-bleed()
</style>
