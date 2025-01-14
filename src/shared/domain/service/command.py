from abc import ABC, abstractmethod


class Command(ABC):
    """Base abstract class for commands

    This class follows the Command pattern, encapsulating a request as an object.
    """

    @abstractmethod
    def execute(self) -> None:
        """Execute the command

        This method should be implemented by concrete commands to perform
        the specific action.
        """
        pass
