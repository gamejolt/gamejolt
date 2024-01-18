<script lang="ts" setup>
import { PropType, onUnmounted, ref, toRefs } from 'vue';
import { useForm } from '../../../../form-vue/AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../../../form-vue/AppFormControl.vue';
import { useCommonStore } from '../../../../store/common-store';
import { kThemeDark } from '../../../../theme/variables';
import AppUserAvatarImg from '../../AppUserAvatarImg.vue';
import { UserAvatarFrameModel } from '../frame.model';
import AppUserAvatarFrameTile from './AppUserAvatarFrameTile.vue';

const props = defineProps({
	frames: {
		type: Array as PropType<UserAvatarFrameModel[]>,
		required: true,
	},
	...defineFormControlProps(),
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const { frames, validators } = toRefs(props);

const { user } = useCommonStore();

const form = useForm()!;

const { applyValue } = createFormControl<number | 'random'>({
	initialValue: user.value?.avatar_frame?.id || 0,
	alwaysOptional: true,
	onChange: val => emit('changed', val),
	validators,
});

const expiryInfoKey = ref(-1);

const interval = setInterval(() => (expiryInfoKey.value *= -1), 1_000);

onUnmounted(() => {
	clearInterval(interval);
});

function pickFrame(option: number | 'random') {
	if (!form.isLoaded) {
		return;
	}
	applyValue(option);
}

function isSelected(data: UserAvatarFrameModel | 'random' | null) {
	if (data === 'random') {
		return form.formModel.avatar_frame === 'random';
	}

	const frameId = data?.avatar_frame.id || 0;
	return frameId === form.formModel.avatar_frame;
}
</script>

<template>
	<!-- AppUserAvatarFrameSelector -->
	<div
		:style="
			!form.isLoaded || frames.length
				? {
						display: `grid`,
						gap: `8px`,
						gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
				  }
				: {}
		"
	>
		<template v-if="!form.isLoaded">
			<AppUserAvatarFrameTile
				v-for="index of 2"
				:key="`placeholder-${index}`"
				:is-placeholder="true"
				:expiry-info-key="1"
			/>
		</template>
		<template v-else-if="frames.length">
			<AppUserAvatarFrameTile
				key="no-frame"
				:is-selected="isSelected(null)"
				:expiry-info-key="1"
				@select-tile="pickFrame"
			/>
			<AppUserAvatarFrameTile
				key="random-frame"
				:is-selected="isSelected('random')"
				:is-random="true"
				:expiry-info-key="1"
				@select-tile="pickFrame('random')"
			/>

			<AppUserAvatarFrameTile
				v-for="data of frames"
				:key="data.avatar_frame.id"
				:frame="data"
				:is-placeholder="!form.isLoaded"
				:is-selected="isSelected(data)"
				:expiry-info-key="expiryInfoKey"
				@select-tile="pickFrame"
			>
				<template v-if="form.isLoaded" #selected-avatar>
					<Transition name="fade">
						<AppUserAvatarImg
							v-if="isSelected(data)"
							:style="{
								borderRadius: `50%`,
								backgroundColor: kThemeDark,
							}"
							:user="user"
						/>
					</Transition>
				</template>
			</AppUserAvatarFrameTile>
		</template>
		<template v-else>
			<slot name="no-items" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0
</style>
