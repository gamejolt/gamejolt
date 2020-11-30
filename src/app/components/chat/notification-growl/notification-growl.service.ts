import { ContentDocument } from '../../../../_common/content/content-document';
import { Growls } from '../../../../_common/growls/growls.service';
import { Translate } from '../../../../_common/translate/translate.service';
import { ChatClient, enterChatRoom, isInChatRoom } from '../client';
import { ChatMessage, ChatMessageType } from '../message';
import AppChatNotificationGrowl from './notification-growl.vue';

export class ChatNotificationGrowl {
	static async show(chat: ChatClient, message: ChatMessage, system = true) {
		// Skip if already in the room.
		if (isInChatRoom(chat, message.room_id) && chat.isFocused) {
			return;
		}

		Growls.info({
			onclick: () => enterChatRoom(chat, message.room_id),
			system,

			title: this.generateTitle(message),
			message: this.generateSystemMessage(message),

			component: AppChatNotificationGrowl,
			props: { chat, message },
		});
	}

	private static generateTitle(message: ChatMessage): string {
		switch (message.type) {
			case ChatMessageType.MESSAGE:
				return `💬 ${message.user.display_name} (@${message.user.username})`;

			case ChatMessageType.INVITE:
				return '👥 ' + Translate.$gettext(`You received a chat group invite`);
		}

		throw new Error(
			'Chat message type ' + message.type + ' not implemented for notification title.'
		);
	}

	/**
	 * Composes a message for the system notification.
	 * Strategy:
	 *  - When the message starts with an image, say "user sent you an image"
	 *  	- If there is text following that image, have a single line of X characters after "user sent you an image"
	 *  - Same logic as above, but with Gifs and code blocks too.
	 *  - With any text displayed: get the paragraphs, and separate by new lines. Display the text elements inside these paragraphs.
	 *  	- Also show hard break objects as new lines.
	 *  - Try and mask any paragraphs inside of spoilers with *spoiler*
	 *  - Replace gj emoji with :<emoji>:
	 */
	private static generateSystemMessage(message: ChatMessage): string {
		if (message.type === ChatMessageType.INVITE) {
			return this.generateSystemInviteMessage(message);
		}

		let systemMessage = '';

		const doc = ContentDocument.fromJson(message.content);

		const textLines = [] as string[];

		const paragrapghs = doc.getChildrenByType('paragraph');
		const spoilers = doc.getChildrenByType('spoiler');
		const spoilerParagraphs = spoilers.flatMap(i => i.getChildrenByType('paragraph'));

		let currentTextLine = '';

		const pushTextLine = () => {
			currentTextLine = currentTextLine.trim();
			if (currentTextLine.length > 0) {
				textLines.push(currentTextLine);
			}
			currentTextLine = '';
		};

		for (const paragraph of paragrapghs) {
			// Figure out if this paragraph is within a spoiler.
			if (spoilerParagraphs.includes(paragraph)) {
				currentTextLine = '*Spoiler*';
				pushTextLine();
				continue;
			}

			for (const child of paragraph.content) {
				if (child.type === 'text') {
					currentTextLine += child.text;
				} else if (child.type === 'gjEmoji') {
					currentTextLine += ':' + child.attrs.type + ':';
				} else if (child.type === 'hardBreak') {
					pushTextLine();
				}
			}

			pushTextLine();
		}

		// By default, we'll allow up to 5 lines
		let allowedLines = 5;

		const firstChild = doc.firstChild;
		if (firstChild) {
			if (firstChild.type === 'mediaItem') {
				systemMessage = '[Sent you an image]';
				allowedLines = 1;
			} else if (firstChild.type === 'gif') {
				systemMessage = '[Sent you a gif]';
				allowedLines = 1;
			} else if (firstChild.type === 'codeBlock') {
				systemMessage = '[Sent you a code snippet]';
				allowedLines = 1;
			}
		}

		for (let i = 0; i < Math.min(allowedLines, textLines.length); i++) {
			if (systemMessage !== '') {
				systemMessage += '\n';
			}
			systemMessage += textLines[i];
		}

		if (systemMessage.length > 300) {
			systemMessage = systemMessage.substr(0, 299) + '…';
		} else if (textLines.length > allowedLines) {
			systemMessage += ' …';
		}

		// Fallback, in case the message somehow ends up empty.
		if (systemMessage.trim() === '') {
			systemMessage = 'Sent you a message';
		}

		return systemMessage;
	}

	/**
	 * Generates a short predefined message for when a user gets invited to a group chat.
	 */
	private static generateSystemInviteMessage(message: ChatMessage): string {
		return Translate.$gettextInterpolate(
			`%{ displayName } (@%{ username }) invited you to join a group chat.`,
			{
				displayName: message.user.display_name,
				username: message.user.username,
			}
		);
	}
}
