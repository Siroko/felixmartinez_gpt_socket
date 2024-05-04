import OpenAI from "openai";

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            organization: process.env.OPENAI_ORGANIZATION_ID,
            project: process.env.OPENAI_PROJECT_ID,
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async createThread() {
        const thread = await this.openai.beta.threads.create();
        return thread;
    }

    async retrieveMessage(message, threadId, onResponse, stream = false) {
        const response = await this.openai.beta.threads.runs.create(
            threadId,
            {
                assistant_id: process.env.OPENAI_ASSISTANT_ID,
                additional_messages: [{ role: "user", content: message }],
                stream: stream
            }
        );

        if (stream && onResponse !== null) {
            let streamMessage = "";
            for await (const event of response) {
                if(event.event === "thread.message.delta") {
                    streamMessage = event.data.delta.content[0].text.value || " ";
                    onResponse(streamMessage);
                }
            }
        }
    }
}

export default OpenAIService;