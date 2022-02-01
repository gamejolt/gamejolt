<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<Fireside> {}

@Options({})
export default class FormFiresideEdit extends mixins(Wrapper) {
	modelClass = Fireside;
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title">
			<AppFormControl
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				validate-on-blur
				focus
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton :disabled="!valid">
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>

<style lang="stylus" scoped></style>
