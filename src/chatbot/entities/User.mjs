class User {
    thread = null;
    id = null;
    constructor(socket, service) {
        this.id = socket.id;
        this.service = service;
        this.socket = socket;

        if(this.thread === null) {
            this.service.createThread().then((thread) => { 
                this.thread = thread;
                console.log(`Thread created: ${thread.id}`);
                this.addEvents();
                this.service.retrieveMessage("Hello, a new visitor joined the website!", this.thread.id, this.aiMessageReceived.bind(this), true);
            });
        }
    }

    addEvents() {
        this.socket.on('message', async (message) => {
            this.service.retrieveMessage(message, this.thread.id, this.aiMessageReceived.bind(this), true);
        });
    }

    aiMessageReceived(message) {
        console.log(`ai: ${message}`);
        this.socket.emit('message', message);
    }
}

export default User;