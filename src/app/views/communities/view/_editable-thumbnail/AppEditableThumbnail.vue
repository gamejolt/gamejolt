<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { useRoute } from 'vue-router';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppEditableOverlay from '../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { showCommunityThumbnailModal } from '../../../../components/forms/community/thumbnail/modal/modal.service';
import { routeCommunitiesViewEditDetails } from '../edit/details/details.route';
import { useCommunityRouteStore } from '../view.store';

const routeStore = useCommunityRouteStore()!;
const route = useRoute();

const community = toRef(() => routeStore.community);

const isEditing = computed(() => isEditingCommunity(route));

const canEdit = computed(
	() =>
		isEditing.value &&
		routeStore.canEditMedia &&
		route.name === routeCommunitiesViewEditDetails.name
);

function showEditAvatar() {
	showCommunityThumbnailModal(community.value);
}
</script>

<template>
	<AppEditableOverlay v-if="canEdit" class="-fill" @click="showEditAvatar">
		<template #overlay>
			{{ $gettext(`Change`) }}
		</template>
		<AppCommunityThumbnailImg :community="community" />
	</AppEditableOverlay>
	<RouterLink v-else :to="community.routeLocation">
		<AppCommunityThumbnailImg :community="community" />
	</RouterLink>
</template>
