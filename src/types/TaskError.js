class TaskError {
    constructor(source, action, message = '', params = {}) {
        this.source = source;
        this.id = id;
        this.message = message;
        this.params = params;
    }
}

module.exports = TaskError;