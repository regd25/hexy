import { EventBus, EventBusError, EventTypes, DomainEvent, EventMetadata } from './EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    eventBus.clear();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create EventBus instance', () => {
      expect(eventBus).toBeInstanceOf(EventBus);
    });

    it('should start with empty listeners', () => {
      expect(eventBus.getEventTypes()).toEqual([]);
    });
  });

  describe('on', () => {
    describe('happy path', () => {
      it('should register event listener', () => {
        const listener = jest.fn();
        const unsubscribe = eventBus.on('test.event', listener);

        expect(typeof unsubscribe).toBe('function');
        expect(eventBus.listenerCount('test.event')).toBe(1);
        expect(eventBus.getEventTypes()).toContain('test.event');
      });

      it('should register multiple listeners for same event', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        eventBus.on('test.event', listener1);
        eventBus.on('test.event', listener2);

        expect(eventBus.listenerCount('test.event')).toBe(2);
      });

      it('should register listeners for different events', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        eventBus.on('event.one', listener1);
        eventBus.on('event.two', listener2);

        expect(eventBus.listenerCount('event.one')).toBe(1);
        expect(eventBus.listenerCount('event.two')).toBe(1);
        expect(eventBus.getEventTypes()).toEqual(['event.one', 'event.two']);
      });

      it('should return unsubscriber that removes listener', () => {
        const listener = jest.fn();
        const unsubscribe = eventBus.on('test.event', listener);

        expect(eventBus.listenerCount('test.event')).toBe(1);
        unsubscribe();
        expect(eventBus.listenerCount('test.event')).toBe(0);
      });

      it('should handle multiple unsubscribes safely', () => {
        const listener = jest.fn();
        const unsubscribe = eventBus.on('test.event', listener);

        unsubscribe();
        unsubscribe(); // Should not throw error

        expect(eventBus.listenerCount('test.event')).toBe(0);
      });
    });

    describe('error cases', () => {
      it('should throw error when max listeners exceeded', () => {
        const eventType = 'test.event';
        
        // Add 100 listeners (the max)
        for (let i = 0; i < 100; i++) {
          eventBus.on(eventType, jest.fn());
        }

        // 101st listener should throw error
        expect(() => {
          eventBus.on(eventType, jest.fn());
        }).toThrow(EventBusError);
        expect(() => {
          eventBus.on(eventType, jest.fn());
        }).toThrow('Maximum number of listeners (100) exceeded');
      });
    });
  });

  describe('once', () => {
    describe('happy path', () => {
      it('should register listener that fires only once', (done) => {
        const listener = jest.fn();
        eventBus.once('test.event', listener);

        expect(eventBus.listenerCount('test.event')).toBe(1);

        eventBus.emit('test.event', 'data1');
        eventBus.emit('test.event', 'data2');

        // Need to wait for setImmediate
        setImmediate(() => {
          expect(listener).toHaveBeenCalledTimes(1);
          expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'test.event',
            data: 'data1'
          }));
          expect(eventBus.listenerCount('test.event')).toBe(0);
          done();
        });
      });

      it('should return unsubscriber function', () => {
        const listener = jest.fn();
        const unsubscribe = eventBus.once('test.event', listener);

        expect(typeof unsubscribe).toBe('function');
        expect(eventBus.listenerCount('test.event')).toBe(1);

        unsubscribe();
        expect(eventBus.listenerCount('test.event')).toBe(0);
      });
    });
  });

  describe('emit', () => {
    describe('happy path', () => {
      it('should emit event to all listeners', (done) => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const eventData = { message: 'test data' };

        eventBus.on('test.event', listener1);
        eventBus.on('test.event', listener2);

        eventBus.emit('test.event', eventData);

        // Wait for setImmediate
        setImmediate(() => {
          expect(listener1).toHaveBeenCalledTimes(1);
          expect(listener2).toHaveBeenCalledTimes(1);

          const expectedEvent = expect.objectContaining({
            type: 'test.event',
            data: eventData,
            timestamp: expect.any(Date),
            id: expect.any(String),
            metadata: {}
          });

          expect(listener1).toHaveBeenCalledWith(expectedEvent);
          expect(listener2).toHaveBeenCalledWith(expectedEvent);
          done();
        });
      });

      it('should emit event with metadata', (done) => {
        const listener = jest.fn();
        const eventData = { message: 'test' };
        const metadata: EventMetadata = {
          source: 'test',
          correlationId: '123',
          userId: 'user1'
        };

        eventBus.on('test.event', listener);
        eventBus.emit('test.event', eventData, metadata);

        setImmediate(() => {
          expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'test.event',
            data: eventData,
            metadata
          }));
          done();
        });
      });

      it('should handle emit when no listeners exist', () => {
        expect(() => {
          eventBus.emit('non.existent.event', 'data');
        }).not.toThrow();
      });

      it('should generate unique event IDs', (done) => {
        const listener = jest.fn();
        eventBus.on('test.event', listener);

        eventBus.emit('test.event', 'data1');
        eventBus.emit('test.event', 'data2');

        setImmediate(() => {
          expect(listener).toHaveBeenCalledTimes(2);
          const call1 = listener.mock.calls[0][0];
          const call2 = listener.mock.calls[1][0];
          expect(call1.id).not.toBe(call2.id);
          done();
        });
      });
    });

    describe('error handling', () => {
      it('should handle listener errors and emit error event', (done) => {
        const errorListener = jest.fn();
        const faultyListener = jest.fn().mockImplementation(() => {
          throw new Error('Listener error');
        });

        eventBus.on(EventTypes.ERROR, errorListener);
        eventBus.on('test.event', faultyListener);

        eventBus.emit('test.event', 'data');

        setImmediate(() => {
          expect(faultyListener).toHaveBeenCalled();
          expect(console.error).toHaveBeenCalledWith(
            'Error in event listener for test.event:',
            expect.any(Error)
          );
          
          // Error event is also emitted with setImmediate, so we need another setImmediate
          setImmediate(() => {
            expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({
              type: EventTypes.ERROR,
              data: expect.objectContaining({
                originalEventType: 'test.event',
                error: expect.objectContaining({
                  message: 'Listener error'
                })
              })
            }));
            done();
          });
        });
      });

      it('should not emit error event for error events to avoid infinite loops', (done) => {
        const errorListener = jest.fn().mockImplementation(() => {
          throw new Error('Error in error listener');
        });

        eventBus.on(EventTypes.ERROR, errorListener);
        eventBus.emit(EventTypes.ERROR, { test: 'error' });

        setImmediate(() => {
          expect(errorListener).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith(
            'Error in event listener for system.error:',
            expect.any(Error)
          );
          done();
        });
      });
    });
  });

  describe('emitAsync', () => {
    describe('happy path', () => {
      it('should emit event and wait for all listeners to complete', async () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const eventData = { message: 'async test' };

        eventBus.on('test.event', listener1);
        eventBus.on('test.event', listener2);

        await eventBus.emitAsync('test.event', eventData);

        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);

        const expectedEvent = expect.objectContaining({
          type: 'test.event',
          data: eventData,
          timestamp: expect.any(Date),
          id: expect.any(String),
          metadata: {}
        });

        expect(listener1).toHaveBeenCalledWith(expectedEvent);
        expect(listener2).toHaveBeenCalledWith(expectedEvent);
      });

      it('should handle async listeners', async () => {
        const asyncListener = jest.fn().mockResolvedValue(undefined);
        const syncListener = jest.fn();

        eventBus.on('test.event', asyncListener);
        eventBus.on('test.event', syncListener);

        await eventBus.emitAsync('test.event', 'data');

        expect(asyncListener).toHaveBeenCalled();
        expect(syncListener).toHaveBeenCalled();
      });

      it('should handle emitAsync when no listeners exist', async () => {
        await expect(eventBus.emitAsync('non.existent.event', 'data')).resolves.not.toThrow();
      });
    });

    describe('error handling', () => {
      it('should handle sync listener errors in async emit', async () => {
        const errorListener = jest.fn();
        const faultyListener = jest.fn().mockImplementation(() => {
          throw new Error('Sync listener error');
        });

        eventBus.on(EventTypes.ERROR, errorListener);
        eventBus.on('test.event', faultyListener);

        await eventBus.emitAsync('test.event', 'data');

        expect(faultyListener).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Error in event listener for test.event:',
          expect.any(Error)
        );
      });

      it('should handle async listener errors', async () => {
        const errorListener = jest.fn();
        const faultyAsyncListener = jest.fn().mockRejectedValue(new Error('Async listener error'));

        eventBus.on(EventTypes.ERROR, errorListener);
        eventBus.on('test.event', faultyAsyncListener);

        await eventBus.emitAsync('test.event', 'data');

        expect(faultyAsyncListener).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Error in async event listener for test.event:',
          expect.any(Error)
        );
      });
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event type', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      eventBus.on('test.event', listener1);
      eventBus.on('test.event', listener2);
      eventBus.on('other.event', jest.fn());

      expect(eventBus.listenerCount('test.event')).toBe(2);
      expect(eventBus.listenerCount('other.event')).toBe(1);

      eventBus.removeAllListeners('test.event');

      expect(eventBus.listenerCount('test.event')).toBe(0);
      expect(eventBus.listenerCount('other.event')).toBe(1);
      expect(eventBus.getEventTypes()).toEqual(['other.event']);
    });

    it('should handle removing listeners for non-existent event type', () => {
      expect(() => {
        eventBus.removeAllListeners('non.existent.event');
      }).not.toThrow();
    });
  });

  describe('listenerCount', () => {
    it('should return correct listener count', () => {
      expect(eventBus.listenerCount('test.event')).toBe(0);

      eventBus.on('test.event', jest.fn());
      expect(eventBus.listenerCount('test.event')).toBe(1);

      eventBus.on('test.event', jest.fn());
      expect(eventBus.listenerCount('test.event')).toBe(2);
    });

    it('should return 0 for non-existent event type', () => {
      expect(eventBus.listenerCount('non.existent.event')).toBe(0);
    });
  });

  describe('getEventTypes', () => {
    it('should return all registered event types', () => {
      expect(eventBus.getEventTypes()).toEqual([]);

      eventBus.on('event.one', jest.fn());
      eventBus.on('event.two', jest.fn());
      eventBus.on('event.three', jest.fn());

      const eventTypes = eventBus.getEventTypes();
      expect(eventTypes).toHaveLength(3);
      expect(eventTypes).toContain('event.one');
      expect(eventTypes).toContain('event.two');
      expect(eventTypes).toContain('event.three');
    });

    it('should return empty array when no listeners registered', () => {
      expect(eventBus.getEventTypes()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all listeners for all events', () => {
      eventBus.on('event.one', jest.fn());
      eventBus.on('event.two', jest.fn());
      eventBus.on('event.three', jest.fn());

      expect(eventBus.getEventTypes()).toHaveLength(3);

      eventBus.clear();

      expect(eventBus.getEventTypes()).toEqual([]);
      expect(eventBus.listenerCount('event.one')).toBe(0);
      expect(eventBus.listenerCount('event.two')).toBe(0);
      expect(eventBus.listenerCount('event.three')).toBe(0);
    });

    it('should handle clear when no listeners exist', () => {
      expect(() => {
        eventBus.clear();
      }).not.toThrow();
    });
  });

  describe('EventBusError', () => {
    it('should create error with message, code and details', () => {
      const message = 'Test error';
      const code = 'MAX_LISTENERS_EXCEEDED';
      const details = { maxListeners: 100 };

      const error = new EventBusError(message, code, details);

      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toBe(details);
      expect(error.name).toBe('EventBusError');
    });

    it('should create error without details', () => {
      const message = 'Test error';
      const code = 'MAX_LISTENERS_EXCEEDED';

      const error = new EventBusError(message, code);

      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toBeUndefined();
    });
  });

  describe('EventTypes', () => {
    it('should have all expected event types', () => {
      expect(EventTypes.PROCESS_STARTED).toBe('process.started');
      expect(EventTypes.PROCESS_STEP_EXECUTED).toBe('process.step.executed');
      expect(EventTypes.PROCESS_COMPLETED).toBe('process.completed');
      expect(EventTypes.PROCESS_FAILED).toBe('process.failed');
      expect(EventTypes.PROCESS_CANCELLED).toBe('process.cancelled');
      
      expect(EventTypes.ARTIFACT_CREATED).toBe('artifact.created');
      expect(EventTypes.ARTIFACT_UPDATED).toBe('artifact.updated');
      expect(EventTypes.ARTIFACT_DELETED).toBe('artifact.deleted');
      expect(EventTypes.ARTIFACT_VALIDATED).toBe('artifact.validated');
      
      expect(EventTypes.POLICY_VIOLATED).toBe('policy.violated');
      expect(EventTypes.POLICY_EVALUATED).toBe('policy.evaluated');
      
      expect(EventTypes.RESULT_EMITTED).toBe('result.emitted');
      
      expect(EventTypes.ERROR).toBe('system.error');
      expect(EventTypes.WARNING).toBe('system.warning');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid event emissions', (done) => {
      const listener = jest.fn();
      eventBus.on('test.event', listener);

      // Emit 100 events rapidly
      for (let i = 0; i < 100; i++) {
        eventBus.emit('test.event', `data-${i}`);
      }

      setImmediate(() => {
        expect(listener).toHaveBeenCalledTimes(100);
        done();
      });
    });

    it('should handle large event data', (done) => {
      const listener = jest.fn();
      const largeData = {
        array: new Array(1000).fill('data'),
        object: { nested: { deep: { value: 'test' } } }
      };

      eventBus.on('test.event', listener);
      eventBus.emit('test.event', largeData);

      setImmediate(() => {
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
          data: largeData
        }));
        done();
      });
    });

    it('should handle special characters in event type names', () => {
      const listener = jest.fn();
      const specialEventType = 'event.with-special_chars$123';

      expect(() => {
        eventBus.on(specialEventType, listener);
        eventBus.emit(specialEventType, 'data');
      }).not.toThrow();

      expect(eventBus.listenerCount(specialEventType)).toBe(1);
    });

    it('should handle null and undefined data', (done) => {
      const listener = jest.fn();
      eventBus.on('test.event', listener);

      eventBus.emit('test.event', null);
      eventBus.emit('test.event', undefined);

      setImmediate(() => {
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({
          data: null
        }));
        expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({
          data: undefined
        }));
        done();
      });
    });

    it('should handle concurrent subscribe and unsubscribe operations', () => {
      const listeners: (() => void)[] = [];

      // Add multiple listeners
      for (let i = 0; i < 10; i++) {
        const unsubscribe = eventBus.on('test.event', jest.fn());
        listeners.push(unsubscribe);
      }

      expect(eventBus.listenerCount('test.event')).toBe(10);

      // Remove half of them
      for (let i = 0; i < 5; i++) {
        listeners[i]();
      }

      expect(eventBus.listenerCount('test.event')).toBe(5);
    });

    it('should handle memory cleanup after max listeners error', () => {
      const eventType = 'test.event';
      
      // Add max listeners
      for (let i = 0; i < 100; i++) {
        eventBus.on(eventType, jest.fn());
      }

      expect(eventBus.listenerCount(eventType)).toBe(100);

      // Clear and should be able to add listeners again
      eventBus.clear();
      expect(eventBus.listenerCount(eventType)).toBe(0);

      expect(() => {
        eventBus.on(eventType, jest.fn());
      }).not.toThrow();
    });
  });
}); 