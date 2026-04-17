<script lang="ts">
import { onMounted, ref } from 'vue';

import { Api } from '~common/api/api.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '~common/button/AppButton.vue';
import AppHoverCard from '~common/card/AppHoverCard.vue';
import { CommunityModel } from '~common/community/community.model';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '~common/community/verified-tick/AppCommunityVerifiedTick.vue';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illExtremeSadnessSmall } from '~common/illustration/illustrations';
import AppLoadingFade from '~common/loading/AppLoadingFade.vue';
import AppModal from '~common/modal/AppModal.vue';
import AppModalFloatingHeader from '~common/modal/AppModalFloatingHeader.vue';
import { useModal } from '~common/modal/modal.service';
import AppSectionTitle from '~common/section/AppSectionTitle.vue';
import { kThemeBgSubtle } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';
import { kFontSizeSmall, kLineHeightBase } from '~styles/variables';

const innerCircleEdge = 30 * (Math.SQRT2 - 1);
</script>

<script lang="ts" setup>
type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();

const communities = ref<CommunityModel[]>([]);
const isBootstrapped = ref(false);

const modal = useModal()!;

onMounted(async () => {
	try {
		const payload = await Api.sendRequest(
			`/web/profile/communities/@${user.username}`,
			undefined,
			{ detach: true }
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
		<AppModalFloatingHeader :controls-gap="16">
			<template #inline-title>
				<AppSectionTitle :slot-data="user" :avatar-height="48">
					<template #title>
						{{ $gettext('Communities') }}
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
						gridTemplateColumns: `repeat(auto-fill, minmax(100px, 1fr))`,
						gridGap: `8px`,
					}"
				>
					<template v-if="!isBootstrapped">
						<div
							v-for="i in 5"
							:key="i"
							class="change-bg-bg-offset rounded-lg"
							:style="{
								padding: `12px`,
							}"
						>
							<AppAspectRatio
								:ratio="1"
								class="change-bg-bg-subtle"
								:style="{
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
						</div>
					</template>
					<template v-else>
						<AppHoverCard
							v-for="community in communities"
							:key="community.id"
							class="pressy change-bg-bg-offset rounded-lg"
							disable-scale
							:padding="12"
							:to="community.routeLocation"
							:title="community.name"
						>
							<div
								:style="{
									width: `100%`,
									position: `relative`,
									marginBottom: `${nameMargin}px`,
								}"
							>
								<AppCommunityThumbnailImg :community="community" />
								<AppCommunityVerifiedTick
									class="change-bg-bg-offset"
									:style="{
										position: `absolute`,
										right: `${innerCircleEdge}%`,
										bottom: `${innerCircleEdge}%`,
										transform: `translate(50%, 50%)`,
										borderRadius: `50%`,
									}"
									:community="community"
									no-tooltip
								/>
							</div>

							<div
								class="line-clamp-2 text-center"
								:style="{
									fontSize: nameFontSize.px,
									fontWeight: `bold`,
								}"
							>
								{{ community.name }}
							</div>
						</AppHoverCard>
					</template>
				</div>
			</AppLoadingFade>
		</div>
	</AppModal>
</template>
