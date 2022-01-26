<script lang="ts">
import { Emit, mixins, Options } from 'vue-property-decorator';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';

export type FormModel = {
	title: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({})
export default class FormRoomDetails extends mixins(Wrapper) implements FormOnLoad {
	@Emit('submit')
	emitSubmit(_model: FormModel) {}

	titleMinLength = 3;
	titleMaxLength = 50;

	get loadUrl() {
		return `/web/chat/rooms/room-edit`;
	}

	onLoad($payload: any) {
		this.titleMinLength = $payload.titleMinLength;
		this.titleMaxLength = $payload.titleMaxLength;
	}

	onRename() {
		this.emitSubmit(this.formModel);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<AppFormGroup
				name="title"
				class="-form-input"
				:label="$gettext(`Title`)"
				hide-label
				optional
			>
				<AppFormControl
					type="text"
					:validators="[
						validateMinLength(titleMinLength),
						validateMaxLength(titleMaxLength),
					]"
					validate-on-blur
					:placeholder="$gettext(`Empty group title`)"
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<AppButton solid primary :disabled="!valid" @click="onRename">
				<AppTranslate>Rename</AppTranslate>
			</AppButton>
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	align-items: flex-start

	&-input
		flex: auto

	button
		margin-left: 5px
</style>
