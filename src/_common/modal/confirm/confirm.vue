<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../base';

@Options({})
export default class AppModalConfirm extends mixins(BaseModal) {
	@Prop(String) message!: string;
	@Prop(String) title!: string;
	@Prop(String) buttonType!: 'ok' | 'yes';

	ok() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<p>{{ message }}</p>
		</div>

		<div class="modal-footer">
			<AppButton primary solid @click="ok">
				<AppTranslate v-if="buttonType === 'ok'">OK</AppTranslate>
				<AppTranslate v-else-if="buttonType === 'yes'">Yes</AppTranslate>
			</AppButton>
			<AppButton trans @click="cancel">
				<AppTranslate v-if="buttonType === 'ok'">Cancel</AppTranslate>
				<AppTranslate v-else-if="buttonType === 'yes'">No</AppTranslate>
			</AppButton>
		</div>
	</AppModal>
</template>
