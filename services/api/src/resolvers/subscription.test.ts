/**
 * Unit tests for Subscription resolvers
 *
 * Testing was built in from day one — not bolted on later.
 * These tests verify the real-time subscription functionality.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscriptionResolvers } from './subscription';
import * as pubsubModule from '../pubsub';

// Mock the pubsub module
vi.mock('../pubsub', () => ({
  pubsub: {
    asyncIterator: vi.fn(),
  },
  COMPONENT_STATUS_CHANGED: 'COMPONENT_STATUS_CHANGED',
}));

describe('Subscription Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('componentStatusChanged', () => {
    it('should subscribe to COMPONENT_STATUS_CHANGED events', () => {
      // Arrange
      const mockIterator = {
        next: vi.fn(),
        return: vi.fn(),
        throw: vi.fn(),
        [Symbol.asyncIterator]: vi.fn(),
      };
      vi.mocked(pubsubModule.pubsub.asyncIterator).mockReturnValue(mockIterator as unknown as AsyncIterator<unknown>);

      // Act
      const result = subscriptionResolvers.Subscription.componentStatusChanged.subscribe();

      // Assert
      expect(pubsubModule.pubsub.asyncIterator).toHaveBeenCalledWith(['COMPONENT_STATUS_CHANGED']);
      expect(result).toBe(mockIterator);
    });

    it('should resolve payload to return the component', () => {
      // Arrange
      const mockComponent = {
        id: 'comp-123',
        name: 'Heat Shield',
        status: 'ACCEPTED',
      };
      const payload = { componentStatusChanged: mockComponent };

      // Act
      const result = subscriptionResolvers.Subscription.componentStatusChanged.resolve(payload);

      // Assert
      expect(result).toBe(mockComponent);
    });

    it('should pass through any payload structure', () => {
      // Arrange
      const testCases = [
        { componentStatusChanged: { id: '1', name: 'Comp 1' } },
        { componentStatusChanged: null },
        { componentStatusChanged: undefined },
        { componentStatusChanged: { complex: { nested: 'data' } } },
      ];

      // Act & Assert
      testCases.forEach((payload) => {
        const result = subscriptionResolvers.Subscription.componentStatusChanged.resolve(payload);
        expect(result).toBe(payload.componentStatusChanged);
      });
    });
  });
});
