<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { CommunitySidebarData } from '../sidebar-data';
import AppCommunitySidebar from '../sidebar.vue';

@Options({
	components: {
		AppCommunitySidebar,
	},
})
export default class AppCommunitySidebarModal extends mixins(BaseModal) {
	@Prop({ type: Boolean, required: true })
	isEditing!: boolean;

	@Prop({ type: Object, required: true })
	sidebarData!: CommunitySidebarData;

	@Prop({ type: Object, required: true })
	community!: CommunityModel;
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
			<AppCommunitySidebar
				:is-editing="isEditing"
				:community="community"
				:sidebar-data="sidebarData"
			/>
		</div>
	</AppModal>
</template>
