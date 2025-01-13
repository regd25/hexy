from typing import Union, List
import boto3
from ...domain.event import DomainEvent
from ...domain.event.domain_event_publisher import DomainEventPublisher
from .sns_config import SnsConfig

class SnsDomainEventPublisher(DomainEventPublisher):
    def __init__(self, config: SnsConfig):
        self.config = config
        self.sns_client = self._create_sns_client()

    def _create_sns_client(self):
        kwargs = {
            'region_name': self.config.region
        }
        
        if self.config.access_key_id and self.config.secret_access_key:
            kwargs.update({
                'aws_access_key_id': self.config.access_key_id,
                'aws_secret_access_key': self.config.secret_access_key
            })
            
        return boto3.client('sns', **kwargs)

    async def publish(self, events: Union[DomainEvent, List[DomainEvent]]) -> None:
        if not isinstance(events, list):
            events = [events]

        for event in events:
            await self._publish_event(event)

    async def _publish_event(self, event: DomainEvent) -> None:
        try:
            self.sns_client.publish(
                TopicArn=self.config.topic_arn,
                Message=str(event.to_primitives()),
                MessageAttributes={
                    'routing_key': {
                        'DataType': 'String',
                        'StringValue': event.routing_key.value
                    }
                }
            )
        except Exception as e:
            # Aquí podrías implementar un mejor manejo de errores
            raise Exception(f"Error publicando evento: {str(e)}") 