import {BasePipe} from "./BasePipe.js";

export class TopBalancePipe extends BasePipe {
    topSum = 0;

    constructor() {
        super({
            strategyName: "TopBalancePipe",
            mode: "parallel",
            numOfReqs: 100,
        });
    }

    async getBalanceAmount(){
        const detailsResponse = await this.httpService.get("/account/details")

        if(!detailsResponse.data.amount){
            throw Error
        }

        return Number(detailsResponse.data.amount)
    }

    onSetup() {
        return this.getBalanceAmount();
    }

    onRequest() {
        const randomSum = Math.floor(Math.random() * 20);
        this.topSum += randomSum;
        return this.httpService.put("/account/replenishment", {
            cost: randomSum
        })
    }

    async onResult() {
        const newValue = await this.getProfileAmount();

        if(this.checkData + this.topSum !== newValue) {
            this.setStatus(false);
            return;
        }

        this.setStatus(true);
    }
}
