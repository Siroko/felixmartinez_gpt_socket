import OpenAI from "openai";

class OpenAIService {
    streamMessage = "";

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

    async retrieveMessage(message, threadId, onResponse, onFunction, stream = false) {
        const response = await this.openai.beta.threads.runs.create(
            threadId,
            {
                assistant_id: process.env.OPENAI_ASSISTANT_ID,
                additional_messages: [{ role: "user", content: message }],
                stream: stream
            }
        );

        if (stream && onResponse !== null) {
            for await (const event of response) {
                if(event.event === "thread.run.requires_action") {
                    console.log("Action Required", threadId);
                    await this.retrieveActionData(event.data, threadId, onResponse, onFunction);
                }
                if(event.event === "thread.message.delta") {
                    const streamMessage = event.data.delta.content[0].text.value || "";
                    onResponse(streamMessage);
                }
            }
        }
    }

    async retrieveActionData(data, threadId, onResponse, onFunction) {
        const toolOutputs = data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
            if (toolCall.function.name === "get_project_images") {
                onFunction({
                    type: "get_project_images",
                    arguments: JSON.parse(toolCall.function.arguments),
                });
                return {
                    tool_call_id: toolCall.id,
                    output: 'true',
                };
            }
        });

        this.submitToolOutputs(toolOutputs, data.id, threadId, onResponse);
    }

    async submitToolOutputs(toolOutputs, runId, threadId, onResponse) {
        try {
          // Use the submitToolOutputsStream helper
          const stream = await this.openai.beta.threads.runs.submitToolOutputsStream(
                threadId,
                runId,
                {
                    tool_outputs: toolOutputs 
                },
            );
            for await (const event of stream) {
                if(event.event === "thread.message.delta") {
                    const streamMessage = event.data.delta.content[0].text.value || "";
                    onResponse(streamMessage);
                }
            }
        } catch (error) {
            console.error("Error submitting tool outputs:", error);
        }
      }
}

export default OpenAIService;