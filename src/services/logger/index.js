import winston from "winston";

export class AppLogger {

    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console()
            ]
        })
    }

    addTransport(transportInstance){
        this.logger.transports.push(transportInstance)
    }

    logError(msg = ''){
        this.logger.log({
            level: "error",
            message: msg
        })
    }

    logInfo(msg = '') {
        this.logger.log({
            level: "info",
            message: msg
        })
    }

}
