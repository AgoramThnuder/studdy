const eventBus = {
    listeners: {},
    
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.unsubscribe(event, callback);
    },
    
    publish(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    },
    
    unsubscribe(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
};

export default eventBus; 