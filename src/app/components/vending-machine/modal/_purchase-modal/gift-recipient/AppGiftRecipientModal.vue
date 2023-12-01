<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppForm, {
	FormController,
	createForm,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../../_common/illustration/AppIllustration.vue';
import {
	illExtremeSadness,
	illNoComments,
} from '../../../../../../_common/illustration/illustrations';
import { InventoryShopProductSaleModel } from '../../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppOnHover from '../../../../../../_common/on/AppOnHover.vue';
import {
	kThemeBg,
	kThemeBgOffset,
	kThemeFg,
	kThemeFg10,
} from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../../../_common/user/user.model';
import {
	styleChangeBg,
	styleTextOverflow,
	styleTyped,
	styleWhen,
} from '../../../../../../_styles/mixins';
import { kFontSizeBase, kFontSizeLarge, kStrongEaseOut } from '../../../../../../_styles/variables';
import { debounceWithCancel } from '../../../../../../utils/utils';

interface UserGiftData {
	user: UserModel;
	canGift: boolean;
}

const props = defineProps({
	sale: {
		type: Object as PropType<InventoryShopProductSaleModel>,
		required: true,
	},
});

const { sale } = toRefs(props);

const modal = useModal()!;

const possibleGiftRecipientsLimit = ref<number>();
const searchLoading = ref<string>();
const lastSearch = ref('');

const allUsers = ref<UserGiftData[]>([]);
const giftableUsers = computed(() => {
	return allUsers.value.reduce<UserModel[]>((users, data) => {
		if (data.canGift) {
			users.push(data.user);
		}
		return users;
	}, []);
});

const searchButtonStates = computed(() => {
	const input = form.formModel.input;

	return {
		softLoading: lastSearch.value !== input.trim(),
		hasInput: input.length,
	};
});

const showSearchHint = computed(() => {
	if (searchLoading.value !== undefined) {
		return false;
	}
	if (lastSearch.value.length) {
		return false;
	}
	const limit = possibleGiftRecipientsLimit.value;
	if (!limit) {
		return false;
	}
	return allUsers.value.length >= limit;
});

const loadUrl = computed(() => `/mobile/shop-sale/${sale.value.id}`);

async function fetchUsers() {
	debounceSearch.cancel();

	const body = getRequestBody(false);
	const searchInput = body.possibleGiftRecipients.usernameFilter;
	searchLoading.value = searchInput;
	lastSearch.value = searchInput;

	try {
		const response = await Api.sendFieldsRequest(loadUrl.value, body, {
			detach: true,
		});

		// A different request started, so ignore this one.
		if (searchLoading.value !== searchInput) {
			return;
		}
		handlePayload(response);
	} catch (e) {
		console.error('Error fetching possible gift recipients.', e, { filter: searchInput });
		showErrorGrowl($gettext(`Something went wrong. Please try again later.`));
	} finally {
		const filterLoading = searchLoading.value ?? '';
		if (filterLoading === searchInput) {
			searchLoading.value = undefined;
		}
	}
}

const debounceSearch = debounceWithCancel(() => {
	const input = form.formModel.input.trim();
	if (input.length) {
		fetchUsers();
	} else {
		searchLoading.value = '';
		lastSearch.value = '';
		form.reload();
	}
}, 500);

function getRequestBody(initial: boolean) {
	const baseFields = {
		possibleGiftRecipients: {
			usernameFilter: form.formModel.input.trim(),
		},
	};
	if (initial) {
		return { ...baseFields, possibleGiftRecipientsLimit: true };
	}
	return baseFields;
}

function handlePayload(payload: any) {
	if (typeof payload.possibleGiftRecipientsLimit === 'number') {
		possibleGiftRecipientsLimit.value = payload.possibleGiftRecipientsLimit;
	}

	const rawRecipients = payload.possibleGiftRecipients;
	const userData: UserGiftData[] = [];

	if (Array.isArray(rawRecipients)) {
		for (const json of rawRecipients) {
			const rawUser = json.user;
			if (!rawUser || !rawUser.id) {
				continue;
			}
			const user = new UserModel(rawUser);
			userData.push({
				user,
				canGift: json.canGift === true,
			});
		}
	}

	allUsers.value = userData;
}

const form: FormController<{ input: string }> = createForm({
	loadUrl,
	loadData: computed(() => {
		return { _fields: getRequestBody(true) };
	}),
	model: ref({
		input: lastSearch.value,
	}),
	onInit() {
		searchLoading.value = form.formModel.input.trim();
	},
	onLoad(payload) {
		// A different request started, so ignore this one.
		if (searchLoading.value !== form.formModel.input.trim()) {
			return;
		}

		handlePayload(payload);
		searchLoading.value = undefined;
	},
});

function onInputChanged(value: string) {
	const input = value.trim();
	if (input === searchLoading.value || input === lastSearch.value) {
		debounceSearch.cancel();
		return;
	}

	debounceSearch.call();
}

function clearSearch() {
	const input = form.formModel.input.trim();
	form.formModel.input = '';
	// Only reload if something was cleared from the input.
	if (input.length) {
		searchLoading.value = '';
		lastSearch.value = '';
		form.reload();
	}
}
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader>
			<template #modal-controls>
				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</template>

			<template #bottom>
				<AppForm :controller="form" :forced-is-loading="false">
					<AppFormGroup
						name="input"
						hide-label
						:style="{
							display: `flex`,
							columnGap: `12px`,
							alignItems: `center`,
							paddingTop: `12px`,
							paddingBottom: `12px`,
							margin: 0,
						}"
					>
						<AppFormControl
							:style="{
								flex: `auto`,
								fontWeight: `normal`,
							}"
							:placeholder="$gettext(`Find friends...`)"
							@changed="onInputChanged"
						/>

						<AppButton
							v-if="searchButtonStates.hasInput || searchButtonStates.softLoading"
							:loading="searchButtonStates.softLoading"
							:disabled="searchButtonStates.softLoading"
							icon="remove"
							circle
							solid
							@click="clearSearch()"
						/>
					</AppFormGroup>
				</AppForm>
			</template>
		</AppModalFloatingHeader>

		<AppLoadingFade :is-loading="!!searchLoading">
			<div class="modal-body">
				<div>
					<template v-if="!giftableUsers.length && !lastSearch?.length">
						<AppIllustration :asset="illExtremeSadness">
							{{
								$gettext(
									`We couldn't find anyone to gift this to. Please make sure you are friends with the user on Game Jolt and that they do not already have this item.`
								)
							}}
						</AppIllustration>
					</template>
					<template v-else-if="!giftableUsers.length">
						<AppIllustration :asset="illNoComments">
							{{
								$gettext(
									`We couldn't find any friends that match your search. Maybe they already have the item?`
								)
							}}
						</AppIllustration>
					</template>
					<template v-else>
						<div class="sheet" :style="{ ...styleChangeBg('bg-offset') }">
							{{ $gettext(`Purchase this item as a gift for a friend.`) }}
						</div>

						<div class="_bleed-modal-body">
							<template v-for="(user, index) of giftableUsers" :key="user.id">
								<AppOnHover>
									<template #default="{ hoverBinding, hovered }">
										<a
											v-bind="{ ...hoverBinding }"
											class="_pad-modal-body"
											:style="
												styleTyped({
													color: kThemeFg,
													display: `grid`,
													gridTemplateColumns: `48px minmax(0, 1fr) auto`,
													columnGap: `12px`,
													backgroundColor: kThemeBg,
													paddingTop: `12px`,
													paddingBottom: `12px`,
													transition: `background-color 200ms ${kStrongEaseOut}`,
													...styleWhen(hovered, {
														backgroundColor: kThemeBgOffset,
													}),
													...styleWhen(index < giftableUsers.length - 1, {
														borderBottom: `1px solid ${kThemeFg10}`,
													}),
												})
											"
											@click="modal.resolve(user)"
										>
											<AppUserAvatarBubble
												:user="user"
												show-verified
												show-frame
												smoosh
												disable-link
											/>

											<div>
												<div
													:style="{
														fontWeight: `bold`,
														fontSize: kFontSizeLarge.px,
														...styleTextOverflow,
													}"
												>
													{{ user.display_name }}
												</div>
												<div
													:style="{
														fontSize: kFontSizeBase.px,
														...styleTextOverflow,
													}"
												>
													@{{ user.username }}
												</div>
											</div>

											<AppJolticon
												:style="{
													alignSelf: `center`,
													fontSize: `24px`,
													margin: 0,
												}"
												icon="chevron-right"
											/>
										</a>
									</template>
								</AppOnHover>
							</template>
						</div>

						<div
							v-if="showSearchHint"
							class="sheet"
							:style="{
								...styleChangeBg('bg-offset'),
								marginTop: `24px`,
								marginBottom: 0,
							}"
						>
							{{
								$gettext(
									`Didn't see your friend? You can try searching for them above.`
								)
							}}
						</div>
					</template>
				</div>
			</div>
		</AppLoadingFade>
	</AppModal>
</template>

<style lang="stylus" scoped>
._bleed-modal-body
	margin-left: -($modal-padding)
	margin-right: -($modal-padding)

._pad-modal-body
	padding-left: $modal-padding
	padding-right: $modal-padding
</style>
