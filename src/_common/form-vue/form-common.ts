import AppForm from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlError from '~common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlCheckbox from '~common/form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import AppFormControlSelect from '~common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';

/**
 * @deprecated this was to keep the old forms working, you should always import
 * the components you need from now on
 */
export const CommonFormComponents = {
	AppForm,
	AppFormControl,
	AppFormControlSelect,
	AppFormControlTextarea,
	AppFormControlRadio,
	AppFormControlCheckbox,
	AppFormGroup,
	AppFormControlErrors,
	AppFormControlError,
	AppFormButton,
};
