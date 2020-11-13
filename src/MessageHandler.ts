import { Message } from "discord.js";

export class MessageHandler {

    private _prefix: string;
    private _trigger: string;
    private _handlers: Map<string, Handler>;

    constructor(prefix: string, trigger: string) {
        this._setPrefix(prefix);
        this._setTrigger(trigger);
        this._initHandlers();
    }

    private _initHandlers() {
        this._handlers = new Map<string, Handler>();
        const help: Handler = {
            description: 'lists available commands',
            usage: '',
            action: async () => {
                let respStr = '';
                this._handlers.forEach((v, k) => {
                    respStr += `${k}: ${v.description ? v.description : ''}\n`;
                    if (v.usage) {
                        respStr += `  Usage: ${this._getTriggerStr()} ${k} ${v.usage}`;
                    }
                    respStr += '\n';
                });
                return respStr;
            }
        };
        this._handlers.set('help', help);
    }

    private _setPrefix(pfx: string) {
        if (pfx.length != 1) {
            throw new Error('Bad prefix: ' + pfx);
        }
        this._prefix = pfx;
    }

    private _setTrigger(trig: string) {
        if (trig.length == 0) {
            throw new Error("Empty trigger");
        }

        if (trig.split(/\s+/).length != 1) {
            throw new Error("Trigger cannot have spaces");
        }
        this._trigger = trig;
    }

    private _getTriggerStr(): string {
        return `${this._prefix}${this._trigger}`;
    }

    public registerHandler(command: string, handler: Handler): MessageHandler {
        this._handlers.set(command, handler);
        return this;
    }

    public async handle(msg: Message) {
        const { content } = msg;
        if (content.length == 0) {
            return;
        }
        const tokens = content.split(/\s+/);
        const [trigCandidate] = tokens;
        if (trigCandidate != `${this._prefix}${this._trigger}`) {
            return;
        }

        if (tokens.length < 2) {
            this._handle('help', [], msg);
        } else {
            const [, commandCandidate, ...rest] = tokens;
            this._handle(commandCandidate, rest, msg);
        }
    }

    private async _handle(command: string, args: string[], msg: Message) {
        if (!this._handlers.has(command)) {
            return;
        }

        const handler = this._handlers.get(command);
        const result = await handler.action(args, msg);
        if (typeof result == 'string') {
            await msg.channel.send(result);
        }

    }
}

export interface Handler {
    description?: string;
    usage?: string;
    action: (args: string[], msg: Message) => Promise<string | void>;
}