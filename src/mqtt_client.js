const mqtt = require('mqtt');
const config = require('config');
const fs = require('fs');
const EventEmitter = require('events');
const { logger } = require('./common');

// load configs
const gatewayId = config.get('mqtt.gatewayId');
const host = config.get('mqtt.host');
const port = config.get('mqtt.port');

class MqttClient extends EventEmitter {

    constructor() {
        super();

        var options = {
            host: host,
            port: port,
            protocol: 'mqtt',
            rejectUnauthorized: false
        }

        const certPath = config.mqtt.authentication?.certPath
        const keyPath = config.mqtt.authentication?.keyPath
        if (certPath && keyPath) {
            options.protocol = 'mqtts'
            options.cert = fs.readFileSync(certPath)
            options.key = fs.readFileSync(keyPath)
        }

        this.client = mqtt.connect(options);
        this.client.on('connect', () => {
            this._onConnect();
        });
        this.client.on('error', () => {
            logger.log('error', 'Could not connect MQTT broker');
        });
    }

    _onConnect() {
        logger.log('info', 'Client connected');

        this.client.on('message', (msg) => this._onMessage(msg));

        this.client.subscribe('devices/' + gatewayId + '/state/update')

        this.client.on('error', function (err) {
            logger.log('error', err);
        });
    };

    _onMessage(msg) {
        // {"3_3001906": {"name":"NAE45L-01", "value": 78}}
        logger.log('info', `Received message: ${msg}`);
        if(msg){
            const cmd = JSON.parse(msg)
            Object.entries(cmd).forEach((key, value)=>{
                
            })
        }
    }

    publishMessage(messageJson) {
        const message = JSON.stringify(messageJson);
        const topic = 'devices/' + gatewayId + '/state/reported/delta';

        logger.log('info', 'Publish message to MQTT Broker');
        this.client.publish(topic, message);
    }

}

module.exports = { MqttClient };
