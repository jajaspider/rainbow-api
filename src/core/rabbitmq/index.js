const amqp = require('amqp-connection-manager');
const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

class RabbitMQ {
    constructor() {
        this.configPath = path.join(process.cwd(), 'config', 'rainbow.develop.yaml');
        this.config = yaml.load(fs.readFileSync(this.configPath));
        this.mqConfig = _.get(this.config, 'rabbitmq');

        this.connection = amqp.connect([`amqp://rainbow:rainBow@${this.mqConfig.ip}:${this.mqConfig.port}`]);
        this.channelWrapper = this.connection.createChannel({
            json: true
        });
    }

    async init() {
        await this.assertExchange(this.mqConfig.exchange, 'topic');
    }

    async assertExchange(exchange, exchangeType) {
        await this.channelWrapper.assertExchange(exchange, exchangeType, {
            durable: true
        });
    }

    async bindQueue(queue, exchange, routingKey) {
        await this.channelWrapper.addSetup((channel) => {
            channel.bindQueue(queue, exchange, routingKey);
        })
    }

    async assertQueue(queue) {
        await this.channelWrapper.assertQueue(queue, {
            durable: true
        });
    }

    async sendToQueue(queue, data) {
        await this.channelWrapper.sendToQueue(queue, data);
    }
}

const rabbitMQ = new RabbitMQ();
rabbitMQ.init();

module.exports = rabbitMQ;