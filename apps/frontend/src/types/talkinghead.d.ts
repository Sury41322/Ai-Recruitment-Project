/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

declare module "@met4citizen/talkinghead" {
  export class TalkingHead {
    constructor(node: HTMLElement, options?: any);
    showAvatar(avatar: any, onProgress?: (ev: ProgressEvent) => void): Promise<void>;
    speakText(text: string, options?: any): Promise<void>;
    stopSpeaking(): void;
    start(): void;
    stop(): void;
    [key: string]: any;
  }
}

declare module "@met4citizen/talkinghead/modules/lipsync-en.mjs" {
  export const LipsyncEn: any;
}
