<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppSectionTitle from '../../../../_common/section/AppSectionTitle.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleChangeBg } from '../../../../_styles/mixins';
import AppProfileSocialLinks from '../AppProfileSocialLinks.vue';
import { ProfileRouteStore, provideProfileRouteStore } from '../RouteProfile.vue';
import AppProfileActionButtons from '../overview/AppProfileActionButtons.vue';
import AppProfileBio from '../overview/AppProfileBio.vue';
import AppProfileShortcuts, {
	ProfileQuickLink,
} from '../overview/shortcut/AppProfileShortcuts.vue';

const props = defineProps({
	routeStore: {
		type: Object as PropType<ProfileRouteStore>,
		required: true,
	},
	quickLinks: {
		type: Array as PropType<ProfileQuickLink[]>,
		required: true,
	},
});

// Route store shouldn't change, so this is fine.
provideProfileRouteStore(props.routeStore);
// eslint-disable-next-line vue/no-setup-props-destructure
const { user: routeUser, myUser, isMe, isOverviewLoaded, shareUrl } = props.routeStore;

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

			<div v-if="routeUser" class="small text-muted" :style="{ marginTop: `32px` }">
				{{ $gettext(`Joined`) }}
				{{ ' ' }}
				<AppTimeAgo :date="routeUser.created_on" />
			</div>

			<AppSpacer :scale="4" vertical />

			<AppShareCard
				v-if="!myUser || !isMe"
				:style="styleChangeBg('bg-offset')"
				resource="user"
				:url="shareUrl"
			/>
			<AppInviteCard v-else :style="styleChangeBg('bg-offset')" :user="myUser" />
		</div>
	</AppModal>
</template>
