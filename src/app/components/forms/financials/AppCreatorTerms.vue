<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatDate } from '../../../../_common/filters/date';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { UserStripeManagedAccountModel } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';
import { html as termsTemplate } from '../../../../lib/terms/creator/global.md';
import AppFinancialsCheckmark from './AppFinancialsCheckmark.vue';
import AppFinancialsTosScroller from './AppFinancialsTosScroller.vue';

const props = defineProps({
	account: {
		type: Object as PropType<UserStripeManagedAccountModel>,
		default: undefined,
	},
});

const emit = defineEmits({
	accepted: () => true,
});

const { account } = toRefs(props);

const checked = ref(false);

const hasSigned = computed(() => account?.value && account.value.tos_signed_creator > 0);

const agreementLink = computed(
	() =>
		'https://github.com/gamejolt/terms/blob/d78d92b9d7879788e7ac20f31970c85e398badb7/creator/global.md'
);

function onAccept() {
	emit('accepted');
}
</script>

<template>
	<fieldset>
		<legend>
			<AppFinancialsCheckmark
				v-if="hasSigned"
				:tooltip="$gettext(`You have completed this section.`)"
			/>
			{{ $gettext(`Creator Agreement`) }}
		</legend>

		<template v-if="!hasSigned">
			<div class="form-group">
				<div class="small">
					<div>
						{{
							$gettext(
								`If you would like to be a Game Jolt Creator, you must accept the Creator Agreement.`
							)
						}}
					</div>
				</div>
				<br />

				<AppFinancialsTosScroller>
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div v-html="termsTemplate" />
				</AppFinancialsTosScroller>
				<br />

				<div class="checkbox">
					<label>
						<input v-model="checked" type="checkbox" />
						{{
							$gettext(
								`By checking this box and clicking the button below marked "I agree," I agree that I have read, understand, and agree to be bound by the terms of this agreement.`
							)
						}}
					</label>
				</div>
				<br />

				<AppButton primary solid :disabled="!checked" @click="onAccept()">
					{{ $gettext(`I agree`) }}
				</AppButton>
			</div>
		</template>
		<template v-else>
			<div class="form-group">
				<p class="small">
					{{
						$gettextInterpolate(
							`You have agreed to our Creator Agreement on %{ date }.`,
							{ date: formatDate(account!.tos_signed_creator_timestamp, 'medium') }
						)
					}}
					<br />
					<AppLinkExternal :href="agreementLink">
						{{ $gettext(`View Creator Agreement`) }}
					</AppLinkExternal>
				</p>
			</div>
		</template>
	</fieldset>
</template>
