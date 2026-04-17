<script lang="ts" setup>
import { ref } from 'vue';

import AppProfileSocialLinks from '~app/views/profile/AppProfileSocialLinks.vue';
import AppProfileActionButtons from '~app/views/profile/overview/AppProfileActionButtons.vue';
import AppProfileBio from '~app/views/profile/overview/AppProfileBio.vue';
import AppProfileShortcuts, {
	ProfileQuickLink,
} from '~app/views/profile/overview/shortcut/AppProfileShortcuts.vue';
import { ProfileRouteStore, provideProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import AppButton from '~common/button/AppButton.vue';
import AppInviteCard from '~common/invite/AppInviteCard.vue';
import AppModal from '~common/modal/AppModal.vue';
import AppModalFloatingHeader from '~common/modal/AppModalFloatingHeader.vue';
import { useModal } from '~common/modal/modal.service';
import AppSectionTitle from '~common/section/AppSectionTitle.vue';
import AppShareCard from '~common/share/card/AppShareCard.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { kThemeFg10 } from '~common/theme/variables';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	routeStore: ProfileRouteStore;
	quickLinks: ProfileQuickLink[];
};
const { routeStore, quickLinks } = defineProps<Props>();

// Route store shouldn't change, so this is fine.
provideProfileRouteStore(routeStore);
const { user: routeUser, myUser, isMe, shareUrl } = routeStore;

const modal = useModal()!;

const canToggleDescription = ref(false);
const showFullDescription = ref(false);
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader :controls-gap="16">
			<template #inline-title>
				<AppSectionTitle :slot-data="routeUser" :avatar-height="48">
					<template #supertitle>
						{{ $gettext(`About`) }}
					</template>

					<template #title>
						{{ `@${routeUser?.username || 'user'}` }}
					</template>
				</AppSectionTitle>
			</template>

			<template #modal-controls>
				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</template>
		</AppModalFloatingHeader>

		<div class="modal-body">
			<AppProfileShortcuts :items="quickLinks" centered />
			<AppSpacer vertical :scale="4" />
			<AppProfileActionButtons />
			<AppSpacer vertical :scale="4" />

			<div
				:style="{
					marginBottom: `12px`,
					height: `1px`,
					backgroundColor: kThemeFg10,
				}"
			/>

			<div class="small text-muted">
				{{ $gettext(`Bio`) }}
			</div>
			<AppProfileBio
				v-model:can-toggle-description="canToggleDescription"
				v-model:show-full-description="showFullDescription"
				:no-bio-text="$gettext(`This user has no bio...`)"
			/>

			<AppProfileSocialLinks />

			<div v-if="routeUser" class="small text-muted mt-[32px]">
				{{ $gettext(`Joined`) }}
				{{ ' ' }}
				<AppTimeAgo :date="routeUser.created_on" />
			</div>

			<AppSpacer :scale="4" vertical />

			<AppShareCard
				v-if="!myUser || !isMe"
				class="change-bg-bg-offset"
				resource="user"
				:url="shareUrl"
			/>
			<AppInviteCard v-else class="change-bg-bg-offset" :user="myUser" />
		</div>
	</AppModal>
</template>
