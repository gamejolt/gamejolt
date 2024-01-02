<script lang="ts">
import { PropType, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppHoverCard from '../../../../_common/card/AppHoverCard.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/AppCommunityVerifiedTick.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadnessSmall } from '../../../../_common/illustration/illustrations';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppSectionTitle from '../../../../_common/section/AppSectionTitle.vue';
import { kThemeBgSubtle } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import { styleBorderRadiusLg, styleChangeBg, styleLineClamp } from '../../../../_styles/mixins';
import { kFontSizeSmall, kLineHeightBase } from '../../../../_styles/variables';

const innerCircleEdge = 30 * (Math.SQRT2 - 1);
</script>

<script lang="ts" setup>
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
		<AppModalFloatingHeader>
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
							:style="{
								...styleChangeBg('bg-offset'),
								...styleBorderRadiusLg,
								padding: `12px`,
							}"
						>
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
						</div>
					</template>
					<template v-else>
						<AppHoverCard
							v-for="community in communities"
							:key="community.id"
							class="pressy"
							:style="{
								...styleChangeBg('bg-offset'),
								...styleBorderRadiusLg,
							}"
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
									:style="{
										...styleChangeBg('bg-offset'),
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
								:style="{
									...styleLineClamp(2),
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
