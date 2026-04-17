declare module 'vue' {
	/**
	 * Allow native `@submit` on Vue components that wrap form elements.
	 * Allow translate directive attributes on any element/component.
	 */
	interface ComponentCustomProps {
		'translate-n'?: number;
		'translate-plural'?: string;
	}
}

declare module '@vue/runtime-dom' {
	interface HTMLAttributes {
		[key: `data-${string}`]: any;
		'translate-n'?: number;
		'translate-plural'?: string;
	}
}

export {};
