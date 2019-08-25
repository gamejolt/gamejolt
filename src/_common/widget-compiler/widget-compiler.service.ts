import { CreateElement, VNode } from 'vue';
import { WidgetCompilerWidget } from './widget';
import { WidgetCompilerWidgetYoutube } from './widget-youtube/widget-youtube.service';
import { WidgetCompilerWidgetVimeo } from './widget-vimeo/widget-vimeo.service';
import { WidgetCompilerWidgetSoundcloud } from './widget-soundcloud/widget-soundcloud.service';

const REGEX = {
	// Match widget definitions: {% activity-feed %}
	// {%(whitespace character)(none new line character -- greedy match)(whitespace character)%}
	// Global match
	widget: /\{\%\s(.+?)\s\%\}/,

	// To match any whitespace.
	whitespace: /\s+/g,

	// Polyfill from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	whitespaceTrim: /^\s+|\s+$/g,
};

export class WidgetCompilerContext {
	[k: string]: any;
}

export class WidgetCompiler {
	static widgets: { [k: string]: WidgetCompilerWidget } = {};
	private static contentClass = 'widget-compiler-compiled-content';

	static addWidget(widgetService: WidgetCompilerWidget) {
		this.widgets[widgetService.name] = widgetService;
	}

	static setContentClass(contentClass: string) {
		this.contentClass = contentClass;
	}

	static getContentClass() {
		return this.contentClass;
	}

	static compile(h: CreateElement, context: WidgetCompilerContext, content: string) {
		if (!content) {
			return undefined;
		}

		let children: VNode[] = [];
		let workingInput = content;

		// Loop through each match that looks like a widget.
		let matchInfo: RegExpMatchArray | null = null;
		while ((matchInfo = workingInput.match(REGEX.widget))) {
			if (!matchInfo) {
				continue;
			}

			const match = matchInfo[0];
			const innerMatch = matchInfo[1];

			// Add in the text up until this regex match.
			children.push(
				h('div', {
					staticClass: this.contentClass,
					domProps: { innerHTML: workingInput.substring(0, matchInfo.index) },
				})
			);

			// Process this match.
			const injectedWidget = this.processWidgetMatch(h, context, innerMatch);
			if (injectedWidget) {
				children.push(injectedWidget);
			}

			// Pull the new working input text to process.
			// It's just anything that was after our match.
			// This way we keep processing from where we left off.
			workingInput = workingInput.substring(matchInfo.index! + match.length);
		}

		// Get the remaining portion of input after the last widget (if there were any).
		children.push(
			h('div', {
				staticClass: this.contentClass,
				domProps: { innerHTML: workingInput },
			})
		);

		// TODO
		// Clean all empty tags out.
		// this.cleanEmptyContent(compiledElement);

		return h(
			'div',
			{
				staticClass: 'widget-compiler',
			},
			children
		);
	}

	/**
	 * Processes a widget match.
	 * Will attempt to figure out the widget that they were trying to call
	 * and call its compilation function.
	 */
	private static processWidgetMatch(
		h: CreateElement,
		context: WidgetCompilerContext,
		match: string
	) {
		// Trim whitespace.
		match = match.replace(REGEX.whitespaceTrim, '');

		// Collapse multiple occurrences of stringed whitespace into one space.
		match = match.replace(REGEX.whitespace, ' ');

		// Now split on spaces to get the params.
		const params = match.split(' ');
		if (!params || !params.length) {
			return undefined;
		}

		const widgetName = params[0];
		if (!this.widgets[widgetName]) {
			return undefined;
		}

		// Remove the widget name off the params.
		params.shift();

		// Call the widget's service.
		return this.widgets[widgetName].compile(h, context, params);
	}

	// private static cleanEmptyContent(compiledElement: HTMLElement) {
	// 	let emptyElems = compiledElement.querySelectorAll('p:empty');
	// 	for (let i = 0; i < emptyElems.length; ++i) {
	// 		const elem = emptyElems[i];
	// 		elem.parentNode!.removeChild(elem);
	// 	}

	// 	emptyElems = compiledElement.querySelectorAll('div:empty');
	// 	for (let i = 0; i < emptyElems.length; ++i) {
	// 		const elem = emptyElems[i];
	// 		elem.parentNode!.removeChild(elem);
	// 	}
	// }
}

// Add in default widgets.
WidgetCompiler.addWidget(new WidgetCompilerWidgetYoutube());
WidgetCompiler.addWidget(new WidgetCompilerWidgetVimeo());
WidgetCompiler.addWidget(new WidgetCompilerWidgetSoundcloud());
