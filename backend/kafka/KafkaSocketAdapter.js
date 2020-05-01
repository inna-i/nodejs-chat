const Adapter = require('socket.io-adapter');

function get(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('Failed to parse JSON', e);
    }
}

class KafkaAdapter extends Adapter {
    constructor(nsp, opts) {
        console.log('exec const')
        super(nsp);
        this.emitter = opts.emitter;
        this.emitter.on('kafkaIncome', (message) => {
            const data = get(message.value);
            if (this.nsp.name === data.nsp) {
                super.broadcast(data.packet, data.opts, true);
            }
        });
    }

    broadcast(packet, opts) {
        this.emitter.emit('kafka', { packet, opts, nsp: this.nsp.name });
    }
}

module.exports = KafkaAdapter;
