<script lang="ts" setup>
import { computed, ref } from 'vue';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { configOnboardingResources } from '../../../../_common/config/config.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';

type FormModel = {
	// nothing
};

const emit = defineEmits({
	next: () => true,
});

const realms = ref<Realm[]>([]);

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		Onboarding.startStep('follows');
	},
	loadUrl: '/web/onboarding/realms',
	onLoad(payload) {
		realms.value = Realm.populate(payload.realms);
		trackExperimentEngagement(configOnboardingResources);
	},
	onBeforeSubmit() {
		Onboarding.trackEvent(joinedAnyRealm.value ? 'follow-realms-set' : 'follow-realms-skip');
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
const shouldShowSkip = computed(() => !joinedAnyRealm.value);
const joinedAnyRealm = computed(() => realms.value.find(i => !!i.is_following));
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					{{ $gettext(`Follow some realms`) }}
				</h3>

				<p class="text-muted">
					{{ $gettext(`Explore fan-created artwork, videos, guides and more.`) }}
				</p>
			</section>

			<section class="-realms">
				<AppScrollScroller thin>
					<div class="-list">
						<AppRealmFullCard
							v-for="realm of realms"
							:key="realm.id"
							:realm="realm"
							no-sheet
							overlay-content
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
	max-width: 1100px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: $grid-gutter-width

	text-align: center

	> *:not(:first-child)
		margin-top: 30px

.-realms
	p
		margin-bottom: 5px

	.-list
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
		grid-gap: 8px
		justify-content: space-between

@media $media-mobile
	.-list
		padding-bottom: 40px
</style>
