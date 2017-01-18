class TaskError {
    constructor(source, action, message = '', params = {}) {
        this.action = action;
        this.source = source;
        this.message = message;
        this.params = params;
    }
}

module.exports = TaskError;