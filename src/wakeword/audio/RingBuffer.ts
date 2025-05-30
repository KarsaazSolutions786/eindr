import { RingBuffer as IRingBuffer } from '../../types/wakeword';

/**
 * Circular ring buffer for audio data
 * Optimized for continuous audio streaming without memory reallocation
 */
export class RingBuffer implements IRingBuffer {
  private buffer: Float32Array;
  private capacity: number;
  private writePointer: number = 0;
  private readPointer: number = 0;
  private currentSize: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity);
  }

  /**
   * Write audio data to the buffer
   * Overwrites old data when buffer is full
   */
  write(data: Float32Array): void {
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i++) {
      this.buffer[this.writePointer] = data[i];
      this.writePointer = (this.writePointer + 1) % this.capacity;

      if (this.currentSize < this.capacity) {
        this.currentSize++;
      } else {
        // Buffer is full, advance read pointer
        this.readPointer = (this.readPointer + 1) % this.capacity;
      }
    }
  }

  /**
   * Read data from the buffer
   * @param length Number of samples to read (defaults to all available)
   * @returns Float32Array containing the requested data
   */
  read(length?: number): Float32Array {
    const readLength = Math.min(length || this.currentSize, this.currentSize);
    const result = new Float32Array(readLength);

    let tempReadPointer = this.readPointer;

    for (let i = 0; i < readLength; i++) {
      result[i] = this.buffer[tempReadPointer];
      tempReadPointer = (tempReadPointer + 1) % this.capacity;
    }

    return result;
  }

  /**
   * Get the latest N samples without advancing read pointer
   * Useful for overlapping window processing
   */
  getLatest(length: number): Float32Array {
    const readLength = Math.min(length, this.currentSize);
    const result = new Float32Array(readLength);

    // Start from the most recent data
    let startPointer = this.writePointer - readLength;
    if (startPointer < 0) {
      startPointer += this.capacity;
    }

    for (let i = 0; i < readLength; i++) {
      result[i] = this.buffer[(startPointer + i) % this.capacity];
    }

    return result;
  }

  /**
   * Get the latest window of samples (alias for getLatest)
   * Used by WakeWordEngine for consistent API
   */
  getLatestWindow(windowSize: number): Float32Array {
    return this.getLatest(windowSize);
  }

  /**
   * Consume (read and remove) data from the buffer
   * @param length Number of samples to consume
   * @returns Float32Array containing the consumed data
   */
  consume(length: number): Float32Array {
    const readLength = Math.min(length, this.currentSize);
    const result = new Float32Array(readLength);

    for (let i = 0; i < readLength; i++) {
      result[i] = this.buffer[this.readPointer];
      this.readPointer = (this.readPointer + 1) % this.capacity;
    }

    this.currentSize -= readLength;
    return result;
  }

  /**
   * Get current size of data in buffer
   */
  size(): number {
    return this.currentSize;
  }

  /**
   * Get current size of data in buffer (alias for size)
   * Used by interface compatibility
   */
  getSize(): number {
    return this.size();
  }

  /**
   * Clear all data from buffer
   */
  clear(): void {
    this.writePointer = 0;
    this.readPointer = 0;
    this.currentSize = 0;
    // Note: We don't clear the actual buffer data for performance
  }

  /**
   * Check if buffer has data
   */
  hasData(): boolean {
    return this.currentSize > 0;
  }

  /**
   * Check if buffer is full
   */
  isFull(): boolean {
    return this.currentSize === this.capacity;
  }

  /**
   * Get available space in buffer
   */
  getAvailableSpace(): number {
    return this.capacity - this.currentSize;
  }

  /**
   * Get buffer capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Resize the buffer (creates new buffer, copies existing data)
   * Use sparingly as it involves memory allocation
   */
  resize(newCapacity: number): void {
    const oldData = this.read();
    this.capacity = newCapacity;
    this.buffer = new Float32Array(newCapacity);
    this.clear();

    if (oldData.length > 0) {
      this.write(oldData);
    }
  }

  /**
   * Get buffer statistics for debugging
   */
  getStats(): {
    capacity: number;
    size: number;
    writePointer: number;
    readPointer: number;
    availableSpace: number;
    utilizationPercent: number;
  } {
    return {
      capacity: this.capacity,
      size: this.currentSize,
      writePointer: this.writePointer,
      readPointer: this.readPointer,
      availableSpace: this.getAvailableSpace(),
      utilizationPercent: (this.currentSize / this.capacity) * 100,
    };
  }
}
