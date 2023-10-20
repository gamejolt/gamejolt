<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppButton from '../../button/AppButton.vue';
import AppContentViewer from '../../content/content-viewer/AppContentViewer.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { $gettext } from '../../translate/translate.service';
import AppUserAvatarImg from '../../user/user-avatar/AppUserAvatarImg.vue';
import { SupporterActionModel } from '../action.model';

const props = defineProps({
	action: {
		type: Object as PropType<SupporterActionModel>,
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

			<AppContentViewer v-if="content" class="-message-viewer" :source="content" />
			<div v-else class="fill-bg well">
				{{ $gettext(`This creator thanked you for supporting them.`) }}
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
