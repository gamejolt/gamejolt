<script lang="ts" setup>
import { PropType, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/AppCommunityVerifiedTick.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadnessSmall } from '../../../../_common/illustration/illustrations';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppSectionTitle from '../../../../_common/section/AppSectionTitle.vue';
import { kThemeBgSubtle } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../_common/user/user.model';
import { styleChangeBg, styleLineClamp } from '../../../../_styles/mixins';
import { kFontSizeSmall, kLineHeightBase } from '../../../../_styles/variables';

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const { user } = toRefs(props);

const communities = ref<CommunityModel[]>([]);

const isBootstrapped = ref(false);

const modal = useModal()!;

onMounted(async () => {
	try {
		const payload = await Api.sendRequest(
			`/web/profile/communities/@${user.value.username}`,
			undefined,
			{
				detach: true,
			}
		);
		communities.value = CommunityModel.populate(payload.communities);
	} catch (e) {
		console.error('Failed to load communities for user', e);
	} finally {
		isBootstrapped.value = true;
	}
});

const nameFontSize = kFontSizeSmall;
const nameMargin = 8;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<AppSectionTitle>
				<template #avatar>
					<AppUserAvatarBubble :user="user" />
				</template>

				<template #title>
					{{ $gettext('Communities') }}
				</template>

				<template #supertitle>
					@{{ $gettext(`%{ username }'s`, { username: user.username }) }}
				</template>
			</AppSectionTitle>
		</div>

		<div class="modal-body">
			<AppLoadingFade :is-loading="!isBootstrapped">
				<template v-if="isBootstrapped && !communities.length">
					<AppIllustration :asset="illExtremeSadnessSmall">
						{{ $gettext(`We couldn't find any communities this user is in.`) }}
					</AppIllustration>
				</template>
				<div
					v-else
					:style="{
						display: `grid`,
						gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
						gridGap: `12px`,
					}"
				>
					<template v-if="!isBootstrapped">
						<template v-for="i in 5" :key="i">
							<AppAspectRatio
								:ratio="1"
								:style="{
									...styleChangeBg('bg-subtle'),
									borderRadius: `50%`,
									marginBottom: `${nameMargin}px`,
								}"
							/>
							<div
								:style="{
									borderRadius: `16px`,
									backgroundColor: kThemeBgSubtle,
									width: `75%`,
									height: `${nameFontSize.value * kLineHeightBase}px`,
								}"
							/>
						</template>
					</template>
					<template v-else>
						<div v-for="community in communities" :key="community.id">
							<div
								:style="{
									width: `100%`,
									position: `relative`,
									marginBottom: `${nameMargin}px`,
								}"
							>
								<AppCommunityThumbnailImg class="_pressy" :community="community" />
								<AppCommunityVerifiedTick
									:style="{
										...styleChangeBg('bg-offset'),
										position: `absolute`,
										// TODO(profile-scrunch) Looks weird with flexible sizes
										// right: `-3px`,
										// bottom: `-1px`,
										right: `5%`,
										bottom: `5%`,
										borderRadius: `50%`,
									}"
									:community="community"
									no-tooltip
								/>
							</div>

							<div
								:style="{
									...styleLineClamp(2),
									fontSize: nameFontSize.px,
									fontWeight: `bold`,
								}"
							>
								{{ community.name }}
							</div>
						</div>
					</template>
				</div>
			</AppLoadingFade>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
._pressy
	pressy()
</style>
