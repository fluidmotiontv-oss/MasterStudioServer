export class InfinityFlowBiometrics {
    constructor(onDataCallback) {
        this.device = null;
        this.server = null;
        this.onData = onDataCallback || (() => {});
        this.isConnected = false;
    }

    async connectHeartRateMonitor() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }]
            });
            this.server = await this.device.gatt.connect();
            const service = await this.server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (e) => {
                const heartRate = this.parseHeartRate(e.target.value);
                this.onData({ type: 'heartRate', value: heartRate });
            });
            this.isConnected = true;
        } catch (error) {
            console.warn('Biometric connection skipped or unsupported:', error);
        }
    }

    parseHeartRate(value) {
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        return rate16Bits ? value.getUint16(1, true) : value.getUint8(1);
    }

    disconnect() {
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
            this.isConnected = false;
        }
    }
}
