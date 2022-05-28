import dotenv from 'dotenv';
import terminalImage from "terminal-image";
import {TopBalancePipe} from "./pipes/TopBalancePipe.js";
import {PipesRunner} from "./services/pipesRunner/index.js";
import {SendTransactionPipe} from "./pipes/SendTransactionPipe.js";

dotenv.config();

console.log(await terminalImage.file('src/welcome.jpg', {
    width: 45,
    height: 22
}));

const testPipe = new PipesRunner()
    .addPipe(new SendTransactionPipe({numOfReqs: 20}))
    .addPipe(new SendTransactionPipe({numOfReqs: 100}))
    .addPipe(new SendTransactionPipe({numOfReqs: 50}))
    .addPipe(new TopBalancePipe({numOfReqs: 20}))

testPipe
    .runPipes()
