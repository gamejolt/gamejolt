import AppForm from './AppForm.vue';
import AppFormButton from './AppFormButton.vue';
import AppFormControl from './AppFormControl.vue';
import AppFormControlError from './AppFormControlError.vue';
import AppFormControlErrors from './AppFormControlErrors.vue';
import AppFormGroup from './AppFormGroup.vue';
import AppFormControlCheckbox from './controls/AppFormControlCheckbox.vue';
import AppFormControlRadio from './controls/AppFormControlRadio.vue';
import AppFormControlSelect from './controls/AppFormControlSelect.vue';
import AppFormControlTextarea from './controls/AppFormControlTextarea.vue';

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
