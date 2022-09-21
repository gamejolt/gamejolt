<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { html as termsTemplate } from '../../../../lib/terms/creator/global.md';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatDate } from '../../../../_common/filters/date';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { UserStripeManagedAccount } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';

const props = defineProps({
	account: {
		type: Object as PropType<UserStripeManagedAccount>,
		default: undefined,
	},
});

const emit = defineEmits({
	accepted: () => true,
});

const { account } = toRefs(props);

const checked = ref(false);
const showAgreement = ref(false);

const hasSigned = computed(() => account?.value && account.value.tos_signed_creator > 0);

// TODO
const agreementLink = computed(
	() =>
		'https://github.com/gamejolt/terms/blob/d78d92b9d7879788e7ac20f31970c85e398badb7/creator/global.md'
);

function onAccept() {
	emit('accepted');
	showAgreement.value = false;
}
</script>

<template>
	<fieldset>
		<legend>
			<span
				v-if="hasSigned"
				v-app-tooltip="$gettext(`You have completed this section.`)"
				class="pull-right done-icon"
			>
				<AppJolticon icon="check" big />
			</span>
			<AppTranslate>Creator Agreement</AppTranslate>
		</legend>

		<template v-if="!hasSigned">
			<div v-if="!showAgreement" class="form-group">
				<div class="small">
					<div>
						<AppTranslate>
							If you would like to be a Game Jolt Creator, you must accept the Creator
							Agreement.
						</AppTranslate>
					</div>
				</div>
				<br />

				<AppButton primary @click="showAgreement = true">
					<AppTranslate>Show Creator Agreement</AppTranslate>
				</AppButton>
			</div>
			<div v-else class="form-group">
				<div class="tos-scroller">
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div v-html="termsTemplate" />
				</div>
				<br />

				<div class="checkbox">
					<label>
						<input v-model="checked" type="checkbox" />
						<AppTranslate>
							By checking this box and clicking the button below marked "I Agree," I
							agree that I have read, understand, and agree to be bound by the terms
							of this agreement.
						</AppTranslate>
					</label>
				</div>
				<br />

				<AppButton primary solid :disabled="!checked" @click="onAccept()">
					<AppTranslate>I Agree</AppTranslate>
				</AppButton>
			</div>
		</template>
		<template v-else>
			<div class="form-group">
				<p class="small">
					<AppTranslate
						:translate-params="{
							date: formatDate(account!.tos_signed_creator_timestamp, 'medium'),
						}"
					>
						You have agreed to our Creator Agreement on %{ date }.
					</AppTranslate>
					<br />
					<AppLinkExternal :href="agreementLink">
						<AppTranslate>View Creator Agreement</AppTranslate>
					</AppLinkExternal>
				</p>
			</div>
		</template>
	</fieldset>
</template>
