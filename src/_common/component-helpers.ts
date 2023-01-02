import { AllowedComponentProps, Component, VNodeProps } from 'vue';

/**
 * Allows us to get prop typing for a component while excluding internal Vue
 * props.
 *
 * https://stackoverflow.com/a/73784241
 */
export type ComponentProps<C extends Component> = C extends new (...args: any) => any
	? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
	: never;
