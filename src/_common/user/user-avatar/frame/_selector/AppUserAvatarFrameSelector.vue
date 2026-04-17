<script lang="ts" setup>
import { onUnmounted, ref, toRef } from 'vue';

import { useForm } from '~common/form-vue/AppForm.vue';
import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { FormValidator } from '~common/form-vue/validators';
import { useCommonStore } from '~common/store/common-store';
import { kThemeDark } from '~common/theme/variables';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';
import AppUserAvatarFrameTile from '~common/user/user-avatar/frame/_selector/AppUserAvatarFrameTile.vue';
import { UserAvatarFrameModel } from '~common/user/user-avatar/frame/frame.model';

type Props = {
	frames: UserAvatarFrameModel[];
	disabled?: boolean;
	validators?: FormValidator[];
};
const { validators = [] } = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const { user } = useCommonStore();

const form = useForm()!;

const { applyValue } = createFormControl<number>({
	initialValue: user.value?.avatar_frame?.id || 0,
	alwaysOptional: true,
	onChange: val => emit('changed', val),
	validators: toRef(() => validators),
});

const expiryInfoKey = ref(-1);

const interval = setInterval(() => (expiryInfoKey.value *= -1), 1_000);

onUnmounted(() => {
	clearInterval(interval);
});

function pickFrame(frameId: number) {
	if (!form.isLoaded) {
		return;
	}
	applyValue(frameId);
}

function isSelected(data: UserAvatarFrameModel | null) {
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
