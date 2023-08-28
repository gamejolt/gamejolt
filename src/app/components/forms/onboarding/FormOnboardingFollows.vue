<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { UserModel } from '../../../../_common/user/user.model';
import AppOnboardingFollowsCommunityItem from './AppOnboardingFollowsCommunityItem.vue';

type FormModel = {
	// nothing
};

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
	isSocialRegistration: {
		type: Boolean,
		required: true,
	},
});

const emit = defineEmits({
	next: () => true,
});

const communities = ref<CommunityModel[]>([]);

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		Onboarding.startStep('follows');
	},
	loadUrl: '/web/onboarding/follows',
	onLoad(payload) {
		communities.value = CommunityModel.populate(payload.communities);
	},
	onBeforeSubmit() {
		Onboarding.trackEvent(
			followsAnyCommunity.value ? 'follow-communities-set' : 'follow-communities-skip'
		);
	},
	async onSubmit() {
		// Nothing to submit.
	},
	onSubmitSuccess() {
		Onboarding.endStep(shouldShowSkip.value);
		emit('next');
	},
});

const canContinue = computed(() => form.valid);
const shouldShowSkip = computed(() => !followsAnyCommunity.value);
const followsAnyCommunity = computed(() => communities.value.find(i => !!i.is_member));
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<section class="-message">
				<h1 class="section-header text-display">
					{{ $gettext(`Join some communities`) }}
				</h1>

				<p class="text-muted">
					{{ $gettext(`Explore fan-created artwork, videos, guides and more`) }}
				</p>
			</section>

			<section class="-communities">
				<AppScrollScroller thin>
					<div class="-list">
						<AppOnboardingFollowsCommunityItem
							v-for="community of communities"
							:key="community.id"
							:community="community"
						/>
					</div>
				</AppScrollScroller>
			</section>

			<slot name="controls" :can-continue="canContinue" :should-show-skip="shouldShowSkip" />
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import './variables'

.-form
	display: flex
	flex-direction: column
	max-width: 500px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: $grid-gutter-width

	text-align: center

	> *:not(:first-child)
		margin-top: 30px

.-communities
	p
		margin-bottom: 5px

	.-list
		display: grid
		grid-template-columns: repeat(auto-fill, $-community-item-size)
		grid-gap: 8px
		justify-content: space-between

@media $media-mobile
	.-list
		padding-bottom: 40px
</style>
