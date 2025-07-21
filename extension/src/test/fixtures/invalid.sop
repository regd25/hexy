# Invalid SOL Document for Testing

Vision:
  - id: InvalidVision
    # Missing required content field

Domain:
  id: InvalidDomain
  description: "Domain without vision reference"
  # Missing required vision field

Actor:
  - id: OrphanActor
    type: Human
    # Not referenced by any process

Process:
  id: BrokenProcess
  vision: NonExistentVision  # Reference to non-existent vision
  actors:
    - NonExistentActor      # Reference to non-existent actor
  steps:
    - "Broken step"

Policy:
  id: InvalidPolicy
  # Missing required premise and vision fields 