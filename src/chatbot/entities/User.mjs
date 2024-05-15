class User {
    thread = null;
    id = null;
    aiMessageHandle = this.aiMessageReceived.bind(this);
    aiFunctionHandle = this.aiFunctionReceived.bind(this);

    constructor(socket, service) {
        this.id = socket.id;
        this.service = service;
        this.socket = socket;

        if(this.thread === null) {
            this.service.createThread().then((thread) => { 
                this.thread = thread;
                console.log(`Thread created: ${thread.id}`);
                this.addEvents();
                this.service.retrieveMessage(
                    "Hello, I'm a new user to the website", 
                    this.thread.id, 
                    this.aiMessageHandle, 
                    this.aiFunctionHandle, 
                    true
                );
            });
        }
    }

    addEvents() {
        this.socket.on('message', async (message) => {
            this.service.retrieveMessage(
                message, 
                this.thread.id, 
                this.aiMessageHandle, 
                this.aiFunctionHandle, 
                true
            );
        });
    }

    aiMessageReceived(message) {
        console.log(`ai: ${message}`);
        this.socket.emit('message', message);
    }

    aiFunctionReceived(event) {
        switch(event.type) {
            case "get_project_images":
                this.socket.emit('get_project_images', event.arguments.project_name);
                break;
        }
    }
}

export default User;