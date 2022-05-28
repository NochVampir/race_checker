import axios from "axios";
import {parallel} from "async";
import {AppLogger} from "../services/logger/index.js";
import {createRequire} from "node:module"

const require = createRequire(import.meta.url);
const config = require("../../config.json");

export class BasePipe {
    checkData = {};
    errors = [];

    constructor({
        strategyName,
        mode = 'parallel',
        numOfReqs = 150,
        enableAuth = true,
    }) {
        this.strategyName = strategyName;
        this.httpService = axios.create({
            baseURL: process.env.BASE_PATH
        });
        this.numOfReqs = numOfReqs;
        this.mode = mode;
        this.logger = new AppLogger();
        this.enableAuth = enableAuth;
    }

    async setupAuth(){
        try{
            const tokenResponse = await this.httpService.post("/account/login", config.auth);

            if(!tokenResponse.data) throw Error;

            this.httpService.defaults.headers.common["Authorization"] = `Bearer ${tokenResponse.data.token}`;

        }catch (e) {
            this.rejectPipe();
        }
    }

    runParallelPipe(){
        return parallel(
            Array
                .from((Array(this.numOfReqs)
                    .keys()))
                .map((_, index) => async () => {
                    try {
                        await this.runOnRequest(index);
                    }catch (e) {
                        const codeMsg = e.code ?? '';
                        const errMsg = `Request ${index} error${codeMsg ? `: ${codeMsg}` : ''}`;
                        this.logger.logError(errMsg);
                        this.errors.push([index, errMsg]);
                    }
                })
        )
    }

    async runPipe(){
        try{
            this.logger.logInfo(`STARTING PIPE: ${this.strategyName}`);

            if(this.enableAuth){
                await this.setupAuth();
            }

            await this.runOnSetup();
            switch (this.mode){
                case "parallel":
                    await this.runParallelPipe();
                    break;
                case "interval":
                    await this.runIntervalPipe();
                    break;
            }
            await this.runOnResult();

        }catch (e) {
            if(e.code){
                this.logger.logError(e.code);
            }
            throw e;
        }
    }

    async runOnSetup(){
        this.checkData = await this.onSetup();
    }

    runOnResult(){
        return this.onResult();
    }

    runOnRequest(ind){
        this.logger.logInfo(`Request ${ind} is running!`);
        return this.onRequest();
    }

    rejectPipe(){
        this.logger.logError("PIPE IS REJECTED");
    }

    successPipe(){
        this.logger.logInfo("PIPE IS COMPLETE");
    }

    get pipeErrors(){
        return this.errors;
    }

    onResult(){}

    onSetup(){}

    onRequest(){}
}
