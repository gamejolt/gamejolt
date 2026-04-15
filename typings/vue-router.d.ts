import type { AnchorHTMLAttributes } from 'vue';

declare module 'vue-router' {
	interface RouterLinkProps extends Pick<AnchorHTMLAttributes, 'onClick' | 'target'> {
		translateN?: number;
	}
}
