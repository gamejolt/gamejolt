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
	<app-form :controller="form">
		<app-form-group name="title">
			<app-form-control
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				:validate-on="['blur']"
				focus
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
