<script lang="ts" setup>
import AppCommunitySidebar from '~app/components/community/sidebar/AppCommunitySidebar.vue';
import { CommunitySidebarData } from '~app/components/community/sidebar/sidebar-data';
import AppButton from '~common/button/AppButton.vue';
import { CommunityModel } from '~common/community/community.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';

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
