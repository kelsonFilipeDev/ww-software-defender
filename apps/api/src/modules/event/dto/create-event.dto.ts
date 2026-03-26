export class CreateEventDto {
  type: string;
  entityId: string;
  payload?: Record<string, unknown>;
  correlationId?: string;
}
