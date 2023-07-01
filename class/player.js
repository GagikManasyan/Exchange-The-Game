class Player {
    constructor(card, id) {
        this.id = id;
        this.name = card.name;
        this.money = card.money;
        this.red = card.red;
        this.green = card.green;
        this.blue = card.blue;
        this.status = false;
    }
    getName() {
        return this.name;
    }
    getMoney () {
        return this.money;
    }
    getRed () {
        return this.red;
    }
    getGreen () {
        return this.green;
    }
    getBlue () {
        return this.blue;
    }
    getStatus () {
        return this.status;
    }
    setStatus (currentStatus) {
        this.stats = currentStatus;
    }
    addMoney(amount) {
        this.money += amount;
    }
    removeMoney(amount) {
        this.money -= amount;
    }
    addRed(amount) {
        this.red += amount;
    }
    addGreen(amount) {
        this.green += amount;
    }
    addBlue(amount) {
        this.blue += amount;
    }
    addProperty(color,quantity) {
        switch (color) {
            case 'red':
                this.addRed(quantity);
                break;
            case 'green':
                this.addGreen(quantity);
                break;
            case 'blue':
                this.addBlue(quantity);
                break;
            default:
                break;
        }
    }
    removeProperty(color,quantity) {
        switch (color) {
            case 'red':
                this.removeRed(quantity);
                break;
            case 'green':
                this.removeGreen(quantity);
                break;
            case 'blue':
                this.removeBlue(quantity);
                break;
            default:
                break;
        }
    }
    removeRed(amount) {
        this.red -= amount;
    }
    removeGreen(amount) {
        this.green -= amount;
    }
    removeBlue(amount) {
        this.blue -= amount;
    }
}
module.exports = Player