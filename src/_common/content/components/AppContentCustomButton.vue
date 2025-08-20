<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { CustomButtonModel } from '../../custom-button/custom-button-model.js';
import { Environment } from '../../environment/environment.service.js';
import { showErrorGrowl } from '../../growls/growls.service';
import AppLoading from '../../loading/AppLoading.vue';
import { Navigate } from '../../navigate/navigate.service.js';
import AppConfetti from '../../particle-effects/AppConfetti.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import { $gettext } from '../../translate/translate.service.js';
import { showContentEditorCustomButtonModal } from '../content-editor/modals/custom-button/custom-button-modal.service.js';
import { defineEditableNodeViewProps } from '../content-editor/node-views/base.js';
import { useContentOwnerController } from '../content-owner';
import AppBaseContentComponent from './AppBaseContentComponent.vue';

const props = defineProps({
	customButtonId: {
		type: String,
		required: true,
	},
	isEditing: {
		type: Boolean,
		required: true,
	},
	isDisabled: {
		type: Boolean,
		required: true,
	},
	...defineEditableNodeViewProps(),
});

const { customButtonId, isEditing, isDisabled, onUpdateAttrs } = toRefs(props);

const router = useRouter();

const owner = useContentOwnerController()!;

const customButton = ref<CustomButtonModel>();
const hasError = ref(false);

owner.hydrator.useData('custom-button-id', customButtonId.value.toString(), data => {
	if (data) {
		customButton.value = new CustomButtonModel(data);
	} else {
		hasError.value = true;
	}
});

async function onEdit() {
	const result = await showContentEditorCustomButtonModal(customButtonId.value);
	console.log('Editing custom button in document', result);
	if (result !== undefined) {
		onUpdateAttrs?.value?.({ customButtonId: result.customButtonId });
	}
}

async function onClick(e: Event) {
	e.stopPropagation();
	e.preventDefault();

	if (!customButton.value) {
		return;
	}

	try {
		const { target_url: targetUrl, new_tab: newTab } = await customButton.value.sendWhereToGo();
		if (!targetUrl) {
			throw new Error('target_url is blank');
		}

		if (newTab) {
			Navigate.newWindow(targetUrl);
			return;
		}

		let href = targetUrl;
		const replacements = [Environment.baseUrl, Environment.baseUrlInsecure];
		for (const replacement of replacements) {
			href = href.replace(replacement, '');
		}

		// Now try to match it against our routes and see if we got anything. If
		// we match a 404 it's obviously wrong.
		// TODO(desktop-app-fixes) would that ever work for client? how?.. the base url for the router is wrong isnt it??
		const { matched } = router.resolve(href);
		if (matched.length > 0 && matched[0].name !== 'error.404') {
			router.push(href);
			return;
		}

		Navigate.newWindow(targetUrl);
	} catch (e) {
		console.error('Could not go to custom button target url: ', e);
		showErrorGrowl({
			title: $gettext('Oh no!'),
			message: $gettext('Something went wrong. Try again later.'),
		});
	}
}
</script>

<template>
	<AppBaseContentComponent
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved?.()"
		@edit="onEdit"
	>
		<template v-if="customButton">
			<div class="-custom-button" @click="onClick">
				<AppConfetti />
				<img v-if="customButton.image_url" :src="customButton.image_url" />
				<span>{{ customButton.text }}</span>
			</div>
		</template>
		<template v-else-if="hasError">
			<AppTranslate>Error loading fancy button</AppTranslate>
		</template>
		<template v-else>
			<AppLoading />
		</template>
	</AppBaseContentComponent>
</template>

<style lang="stylus" scoped>
.-custom-button
	change-bg('bg-offset')
	pressy()

	border-radius: 8px
	cursor: pointer

	display: inline-flex
	align-items: center
	overflow: hidden
	position: relative
	min-height: 50px

	img
		float: left
		height: 100%
		z-index: 1

	span
		max-width: 300px
		padding: 18px
</style>
