<script lang="ts" setup>
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppCommunitySidebar from '../AppCommunitySidebar.vue';
import { CommunitySidebarData } from '../sidebar-data';

type Props = {
	community: CommunityModel;
	sidebarData: CommunitySidebarData;
};
defineProps<Props>();

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
			<AppCommunitySidebar :community="community" :sidebar-data="sidebarData" />
		</div>
	</AppModal>
</template>
