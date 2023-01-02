import { ContentDocument } from '../../../../_common/content/content-document';
import { showInfoGrowl } from '../../../../_common/growls/growls.service';
import { ChatClient, enterChatRoom, isChatFocusedOnRoom } from '../client';
import { ChatMessage } from '../message';
import { ChatRoom, getChatRoomTitle } from '../room';
import AppChatNotificationGrowl from './notification-growl.vue';

export class ChatNotificationGrowl {
	static async show(
		chat: ChatClient,
		message: ChatMessage,
		groupRoom: ChatRoom | undefined,
		system = true
	) {
		// Skip if already in the room.
		if (isChatFocusedOnRoom(chat, message.room_id)) {
			return;
		}

		let title = `💬 ${message.user.display_name}`;
		// Append room title when message was sent in a group room.
		if (groupRoom) {
			title += ' (' + getChatRoomTitle(groupRoom) + ')';
		} else {
			title += ` (@${message.user.username})`;
		}

		showInfoGrowl({
			onClick: () => enterChatRoom(chat, message.room_id),
			system,

			title,
			message: this.generateSystemMessage(message, groupRoom),
			icon: message.user.img_avatar,

			component: AppChatNotificationGrowl,
			props: { chat, message },
		});
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
	private static generateSystemMessage(
		message: ChatMessage,
		groupRoom: ChatRoom | undefined
	): string {
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
				systemMessage = groupRoom ? '[Sent an image]' : '[Sent you an image]';
				allowedLines = 1;
			} else if (firstChild.type === 'gif') {
				systemMessage = groupRoom ? '[Sent a gif]' : '[Sent you a gif]';
				allowedLines = 1;
			} else if (firstChild.type === 'codeBlock') {
				systemMessage = groupRoom ? '[Sent a code snippet]' : '[Sent you a code snippet]';
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
			if (groupRoom) {
				systemMessage = 'Sent a message';
			} else {
				systemMessage = 'Sent you a message';
			}
		}

		return systemMessage;
	}
}
