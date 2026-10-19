export class InfinityFlowTouchEngine {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.isDragging = false;
        this.isPinching = false;
        this.velocity = { x: 0, y: 0 };
        this.position = { x: 0, y: 0 };
        this.lastMousePosition = { x: 0, y: 0 };
        this.lastTime = 0;
        this.damping = options.damping || 0.90;
        this.sensitivity = options.sensitivity || 0.005;
        this.zoomLevel = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        this.initialPinchDistance = null;
        this.maxVelocity = 30;

        // Claim the gestures: stop the browser stealing drags on touch screens
        this.container.style.touchAction = 'none';
        this.container.style.userSelect = 'none';
        this.container.style.webkitUserSelect = 'none';

        this.initListeners();
        this.startRenderLoop();
    }

    initListeners() {
        this.container.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', (e) => this.onPointerUp(e));
        this.container.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.container.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }

    onPointerDown(e) {
        if (this.isPinching) return;
        this.isDragging = true;
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
        this.velocity = { x: 0, y: 0 };
        this.lastTime = performance.now();
        try { this.container.setPointerCapture(e.pointerId); } catch (err) {}
    }

    onPointerMove(e) {
        if (!this.isDragging || this.isPinching) return;
        const currentTime = performance.now();
        const deltaTime = Math.max(currentTime - this.lastTime, 8); // burst events lie about dt
        const deltaX = e.clientX - this.lastMousePosition.x;
        const deltaY = e.clientY - this.lastMousePosition.y;
        this.position.x += deltaX * this.sensitivity;
        this.position.y += deltaY * this.sensitivity;
        // smoothed + capped velocity: fast flicks glide, no more rocket launches
        const rawVx = (deltaX / deltaTime) * 15;
        const rawVy = (deltaY / deltaTime) * 15;
        this.velocity.x = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.x * 0.6 + rawVx * 0.4));
        this.velocity.y = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.y * 0.6 + rawVy * 0.4));
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
        this.lastTime = currentTime;
    }

    onPointerUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        try { this.container.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    onWheel(e) {
        e.preventDefault();
        const zoomFactor = 0.001;
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel - e.deltaY * zoomFactor));
    }

    onTouchStart(e) {
        if (e.touches.length === 2) {
            this.isPinching = true;
            this.isDragging = false;
            this.initialPinchDistance = this.getPinchDistance(e.touches);
        }
    }

    onTouchMove(e) {
        if (e.touches.length === 2 && this.initialPinchDistance !== null) {
            e.preventDefault();
            const currentDistance = this.getPinchDistance(e.touches);
            const scaleFactor = currentDistance / this.initialPinchDistance;
            this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * scaleFactor));
            this.initialPinchDistance = currentDistance;
        }
    }

    onTouchEnd(e) {
        if (e.touches.length < 2) {
            this.isPinching = false;
            this.initialPinchDistance = null;
        }
    }

    getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startRenderLoop() {
        const updatePhysics = () => {
            if (!this.isDragging) {
                this.position.x += this.velocity.x * 0.016;
                this.position.y += this.velocity.y * 0.016;
                this.velocity.x *= this.damping;
                this.velocity.y *= this.damping;
            }
            this.onUpdate({
                x: this.position.x,
                y: this.position.y,
                zoom: this.zoomLevel,
                isMoving: this.isDragging || Math.abs(this.velocity.x) > 0.01 || Math.abs(this.velocity.y) > 0.01
            });
            requestAnimationFrame(updatePhysics);
        };
        requestAnimationFrame(updatePhysics);
    }

    onUpdate(state) {}
}
