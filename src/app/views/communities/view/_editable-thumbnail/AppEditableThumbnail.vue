<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { useRoute } from 'vue-router';

import { showCommunityThumbnailModal } from '~app/components/forms/community/thumbnail/modal/modal.service';
import { routeCommunitiesViewEditDetails } from '~app/views/communities/view/edit/details/details.route';
import { useCommunityRouteStore } from '~app/views/communities/view/view.store';
import { isEditingCommunity } from '~common/community/community.model';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppEditableOverlay from '~common/editable-overlay/AppEditableOverlay.vue';
import { $gettext } from '~common/translate/translate.service';

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
	<AppEditableOverlay v-if="canEdit" class="-fill" @toggle="showEditAvatar">
		<template #overlay>
			{{ $gettext(`Change`) }}
		</template>
		<AppCommunityThumbnailImg :community="community" />
	</AppEditableOverlay>
	<RouterLink v-else :to="community.routeLocation">
		<AppCommunityThumbnailImg :community="community" />
	</RouterLink>
</template>
