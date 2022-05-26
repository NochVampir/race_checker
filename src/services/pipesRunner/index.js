import {series} from "async";
import {AppLogger} from "../logger/index.js";

export class PipesRunner {
    pipes = [];

    constructor() {
        this.logger = new AppLogger();
    }

    addPipe(pipe){
        this.pipes.push(pipe);
        return this;
    }

    async runPipes(){
        await series(
            this.pipes.map((pipe) => async () => {
                await pipe.runPipe();
            })
        );
        this.logger.logInfo("PIPES IS CLEARED");
    }
}
