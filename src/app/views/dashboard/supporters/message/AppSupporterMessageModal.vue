<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppButton from '../../../../../_common/button/AppButton.vue';
import ContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { SupporterAction } from '../../../../../_common/supporters/action.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';

const props = defineProps({
	action: {
		type: Object as PropType<SupporterAction>,
		required: true,
	},
});

const { action } = toRefs(props);

const modal = useModal()!;

const creator = computed(() => action.value.message?.from_user);
const content = computed(() => action.value.message?.content);
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Thanks for your support!`) }}
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="creator">
				<h6 class="sans-margin-top">
					{{ $gettext(`From`) }}
				</h6>

				<RouterLink class="-user" :to="creator.routeLocation">
					<AppMediaItemBackdrop
						class="-user-avatar"
						:media-item="creator.avatar_media_item"
						fallback-color="var(--theme-bg-offset)"
					>
						<AppUserAvatarImg :user="creator" />
					</AppMediaItemBackdrop>

					<div>
						<div class="-display-name">{{ creator.display_name }}</div>
						<div class="-username">@{{ creator.username }}</div>
					</div>
				</RouterLink>

				<AppSpacer vertical :scale="4" />
			</template>

			<h6 class="sans-margin-top">
				{{ $gettext(`Message`) }}
			</h6>

			<ContentViewer
				v-if="content"
				class="-message-viewer fill-bg form-control content-editor-form-control"
				:source="content"
			/>
			<div v-else class="fill-bg well">
				{{ $gettext(`This user thanked you for supporting them.`) }}
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-user
	display: inline-flex
	gap: 12px

.-user-avatar
	img-circle()
	width: 48px
	height: @width

.-display-name
.-username
	text-overflow()
	min-width: 0
	max-width: 100%

.-display-name
	font-weight: bold
	font-size: $font-size-base

.-username
	font-size: $font-size-small

.-message-viewer
	height: auto !important
</style>
