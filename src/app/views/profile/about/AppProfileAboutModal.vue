<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppSectionTitle from '../../../../_common/section/AppSectionTitle.vue';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppProfileSocialLinks from '../AppProfileSocialLinks.vue';
import { ProfileRouteStore, provideProfileRouteStore } from '../RouteProfile.vue';
import AppProfileBio from '../overview/AppProfileBio.vue';
import AppProfileShortcutExtras from '../overview/shortcut/AppProfileShortcutExtras.vue';
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
const { user: routeUser, isOverviewLoaded } = props.routeStore;

const modal = useModal()!;

const canToggleDescription = ref(false);
const showFullDescription = ref(false);
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader>
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
			<AppProfileShortcuts :items="quickLinks" centered>
				<template #default="{ itemWidth }">
					<AppProfileShortcutExtras :width="itemWidth" />
				</template>
			</AppProfileShortcuts>

			<div
				:style="{
					margin: `12px 0`,
					height: `1px`,
					backgroundColor: kThemeFg10,
				}"
			/>

			<div class="small text-muted">
				{{ $gettext(`Bio`) }}
			</div>
			<AppProfileBio
				v-if="!isOverviewLoaded || routeUser?.hasBio"
				v-model:can-toggle-description="canToggleDescription"
				v-model:show-full-description="showFullDescription"
			/>
			<div v-else class="small text-muted">
				{{ $gettext(`This user has no bio...`) }}
			</div>

			<AppProfileSocialLinks />

			<!-- TODO(profile-scrunch) make sure we have everything we need here -->
			<!-- <AppProfileActionButtons /> -->

			<div v-if="routeUser" class="small text-muted" :style="{ marginTop: `32px` }">
				{{ $gettext(`Joined`) }}
				{{ ' ' }}
				<AppTimeAgo :date="routeUser.created_on" />
			</div>
		</div>
	</AppModal>
</template>
