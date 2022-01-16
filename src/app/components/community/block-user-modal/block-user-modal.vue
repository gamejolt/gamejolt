<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { BaseModal } from '../../../../_common/modal/base';
import { User } from '../../../../_common/user/user.model';
import FormCommunityBlock from '../../forms/community/ban/block.vue';

@Options({
	components: {
		FormCommunityBlock,
	},
})
export default class AppCommunityBlocKUserModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: Object, required: true }) user!: User;

	onFormSubmit() {
		this.modal.resolve(true);
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Block User</translate>
			</h2>
		</div>
		<div class="modal-body">
			<form-community-block :community="community" :user="user" @submit="onFormSubmit" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
