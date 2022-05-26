import {BasePipe} from "./BasePipe.js";

export class SendTransactionPipe extends BasePipe {
    transactionsSum = 0;

    constructor() {
        super({
            strategyName: "ProvideTransaction",
            mode: "parallel",
            numOfReqs: 150,
            setupAuth: false,
        });
    }

    async getProfileAmount(){
        const profileData = await this.httpService.get("/account/details");

        if(!profileData.data.amount) {
            throw Error
        }

        return Number(profileData.data.amount);
    }

    onSetup(){
        return this.getProfileAmount()
    }

    onRequest(){
        const randomCost = Math.floor(Math.random() * 10);
        this.transactionsSum += randomCost;
        return this.httpService.post("/transactions", {
            senderId: 1,
            recipientId: 3,
            cost: randomCost,
        });
    }

    async onResult(){
        const newValue = await this.getProfileAmount();

        if(this.checkData - this.transactionsSum !== newValue) {
            this.setStatus(false);
            return;
        }

        this.setStatus(true);
    }
}
