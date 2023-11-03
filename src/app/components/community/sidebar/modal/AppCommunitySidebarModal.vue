<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppCommunitySidebar from '../AppCommunitySidebar.vue';
import { CommunitySidebarData } from '../sidebar-data';

defineProps({
	isEditing: {
		type: Boolean,
		required: true,
	},
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	sidebarData: {
		type: Object as PropType<CommunitySidebarData>,
		required: true,
	},
});

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
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
