<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import { FiresideModel } from '../../../../_common/fireside/fireside.model';
import AppForm, { createForm, defineFormProps } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { RealmModel } from '../../../../_common/realm/realm-model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../utils/array';
import AppContentTargets from '../../content/AppContentTargets.vue';

type FormModel = {
	title: string;
	auto_feature: boolean;
	add_community_as_cohosts: boolean;
};

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		default: null,
	},
	realms: {
		type: Array as PropType<RealmModel[]>,
		default: () => [],
	},
	...defineFormProps<FormModel>(false),
});

const emit = defineEmits({
	submit: (_fireside: FiresideModel) => true,
});

const { community, realms, model } = toRefs(props);

const realmsActual = ref<RealmModel[]>([...realms.value]);

const defaultTitle = computed(() => nameSuggestion.value ?? undefined);
const nameSuggestion = ref<string | null>(null);
const targetableCommunities = ref<CommunityModel[]>([]);
const communities = ref<{ community: CommunityModel }[]>([]);
const maxRealms = ref(0);

const selectableCommunities = computed(() => targetableCommunities.value.filter(c => !c.isBlocked));
const canAttachTargets = computed(
	() => selectableCommunities.value.length > 0 || maxRealms.value > 0
);

const loadUrl = `/web/dash/fireside/add`;

const form = createForm({
	model,
	loadUrl,
	onLoad(payload) {
		// If there is already an active fireside for the requested target, return it immediately.
		if (payload.fireside) {
			const fireside = new FiresideModel(payload.fireside);
			emit('submit', fireside);
			return;
		}

		if (payload.nameSuggestion) {
			nameSuggestion.value = payload.nameSuggestion;
		}

		if (payload.targetableCommunities) {
			targetableCommunities.value = CommunityModel.populate(payload.targetableCommunities);
		} else {
			targetableCommunities.value = [];
		}

		if (payload.maxRealms) {
			maxRealms.value = payload.maxRealms;
		}
	},
	onInit() {
		form.formModel.title = '';

		if (community.value) {
			communities.value.push({ community: community.value });
		}
	},
	async onSubmit() {
		const payloadData = {
			title: form.formModel.title,
			// All fireside creation should start as draft/private.
			is_draft: true,
		} as any;

		const selectedCommunity =
			communities.value.length > 0 ? communities.value[0].community : null;

		if (selectedCommunity) {
			payloadData['community_id'] = selectedCommunity.id;
			payloadData['auto_feature'] = form.formModel.auto_feature;
			payloadData['add_community_as_cohosts'] = form.formModel.add_community_as_cohosts;
		}

		if (realmsActual.value.length > 0) {
			payloadData['realm_ids'] = realmsActual.value.map(x => x.id);
		}

		const payload = await Api.sendRequest(loadUrl, payloadData, {
			allowComplexData: ['realm_ids'],
		});

		if (!payload.success) {
			if (payload.errors && payload.errors['rate-limit']) {
				showErrorGrowl(
					$gettext(`You must wait a few minutes before creating another fireside.`)
				);
				return;
			}

			showGenericError();
			return;
		}

		if (!payload.fireside) {
			showGenericError();
			return;
		}

		const fireside = new FiresideModel(payload.fireside);
		emit('submit', fireside);
	},
});

function showGenericError() {
	showErrorGrowl($gettext(`Couldn't create your fireside. Reload and try again.`));
}

function onBlurTitle() {
	form.formModel.title = form.formModel.title.trim();
}

function attachCommunity(
	community: CommunityModel,
	_channel: CommunityChannelModel | undefined,
	append = true
) {
	// Do nothing if that community is already attached.
	if (communities.value.find(i => i.community.id === community.id)) {
		return;
	}

	if (append) {
		communities.value.push({ community: community });
	} else {
		communities.value.unshift({ community: community });
	}
}

function attachRealm(realm: RealmModel, append = true) {
	// Do nothing if that realm is already attached.
	if (realmsActual.value.find(i => i.id === realm.id)) {
		return;
	}

	if (append) {
		realmsActual.value.push(realm);
	} else {
		realmsActual.value.unshift(realm);
	}
}

function removeCommunity(community: CommunityModel) {
	arrayRemove(communities.value, i => i.community.id === community.id, {
		onMissing: () => console.warn('Attempted to remove a community that is not attached'),
	});
}

function removeRealm(realm: RealmModel) {
	arrayRemove(realmsActual.value, i => i.id === realm.id, {
		onMissing: () => console.warn('Attempted to remove a realm that is not attached'),
	});
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			class="-group-title"
			name="title"
			:label="$gettext(`Title`)"
			tiny-label-margin
		>
			<AppFormControl
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				:placeholder="defaultTitle"
				focus
				@blur="onBlurTitle"
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<template v-if="canAttachTargets">
			<AppFormGroup
				class="-group-targetables"
				name="community_id"
				:label="$gettext(`Start in a community or realm?`)"
				hide-label
			>
				<AppContentTargets
					:communities="communities"
					:max-communities="1"
					:realms="realmsActual"
					:max-realms="maxRealms"
					:targetable-communities="selectableCommunities"
					can-add-community
					:can-add-realm="maxRealms > 0"
					can-remove-communities
					can-remove-realms
					no-community-channels
					@remove-community="removeCommunity"
					@remove-realm="removeRealm"
					@select-community="attachCommunity"
					@select-realm="attachRealm"
				/>

				<div class="help-block">
					<AppTranslate>
						You can start firesides in realms or communities you collaborate on.
						Community members will be notified and other collaborators can stream with
						you.
					</AppTranslate>
				</div>
			</AppFormGroup>
		</template>

		<AppFormButton icon="fireside" :disabled="!form.valid" block>
			<AppTranslate>Let's go!</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-group-title
	margin-bottom: 16px

.-group-targetables
	margin-bottom: 40px

.help-block
	margin-top: 8px
</style>
